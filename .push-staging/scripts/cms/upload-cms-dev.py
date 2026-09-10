# Upload tmp/cms-pilot to vkraynosti-cms-dev. Keys from .env.cms-dev — never print secrets.
from __future__ import annotations

import json
import mimetypes
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = ROOT / ".env.cms-dev"
MANIFEST_PATH = ROOT / "tmp" / "cms-catalog" / "manifest.json"

CORS = {
    "CORSRules": [
        {
            "AllowedOrigins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5174",
                "http://localhost:4173",
                "http://127.0.0.1:4173",
            ],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedHeaders": ["*"],
            "ExposeHeaders": ["ETag", "Content-Length"],
            "MaxAgeSeconds": 3600,
        }
    ]
}

PUBLIC_GET_POLICY = {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadPublishedAndMedia",
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": [
                "arn:aws:s3:::{bucket}/published/*",
                "arn:aws:s3:::{bucket}/media/*",
                "arn:aws:s3:::{bucket}/draft/*",
            ],
        }
    ],
}


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def read_source_bytes(source_url: str) -> bytes:
    parsed = urlparse(source_url)
    if parsed.scheme in {"http", "https"}:
        local_from_cdn = ROOT / "public" / parsed.path.lstrip("/")
        if local_from_cdn.is_file():
            return local_from_cdn.read_bytes()
        request = urllib.request.Request(
            source_url,
            headers={"User-Agent": "vkraynosti-cms-pilot/1"},
        )
        with urllib.request.urlopen(request) as response:
            return response.read()
    local = ROOT / "public" / source_url.lstrip("/")
    return local.read_bytes()


def content_type_for(key: str) -> str:
    guessed, _ = mimetypes.guess_type(key)
    if key.endswith(".webp"):
        return "image/webp"
    if key.endswith(".webm"):
        return "video/webm"
    if key.endswith(".json"):
        return "application/json"
    return guessed or "application/octet-stream"


def main() -> None:
    env = load_env(ENV_PATH)
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    access_key = env.get("S3_ACCESS_KEY") or env.get("AWS_ACCESS_KEY_ID")
    secret_key = env.get("S3_SECRET_KEY") or env.get("AWS_SECRET_ACCESS_KEY")
    if not access_key or not secret_key:
        raise SystemExit("Missing S3 keys in .env.cms-dev")

    bucket = env.get("S3_BUCKET") or manifest["bucketHint"]
    client = boto3.client(
        "s3",
        endpoint_url=env.get("S3_ENDPOINT") or env.get("AWS_ENDPOINT_URL"),
        region_name=env.get("S3_REGION") or "ru-1",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(s3={"addressing_style": "path"}, signature_version="s3v4"),
    )

    try:
        client.put_bucket_cors(Bucket=bucket, CORSConfiguration=CORS)
        print("cors: ok")
    except ClientError as error:
        print("cors: skip", error.response.get("Error", {}).get("Code"))

    policy = json.dumps(PUBLIC_GET_POLICY).replace("{bucket}", bucket)
    try:
        client.put_bucket_policy(Bucket=bucket, Policy=policy)
        print("bucket_policy: ok")
    except ClientError as error:
        print("bucket_policy: skip", error.response.get("Error", {}).get("Code"))

    for item in manifest.get("mediaObjects") or manifest.get("objects") or []:
        source_url = item["sourceUrl"]
        key = item["key"]
        body = read_source_bytes(source_url)
        extra = {"CacheControl": "public, max-age=3600"}
        try:
            extra["ACL"] = "public-read"
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=body,
                ContentType=content_type_for(key),
                **extra,
            )
        except ClientError:
            extra.pop("ACL", None)
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=body,
                ContentType=content_type_for(key),
                **extra,
            )
        print("uploaded", key, "bytes", len(body))

    json_extra = {"CacheControl": "no-cache"}
    for item in manifest.get("jsonObjects") or []:
        key = item["key"]
        body = Path(item["localPath"]).read_bytes()
        try:
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=body,
                ContentType="application/json",
                ACL="public-read",
                **json_extra,
            )
        except ClientError:
            client.put_object(
                Bucket=bucket,
                Key=key,
                Body=body,
                ContentType="application/json",
                **json_extra,
            )
        print("uploaded", key)

    if "jsonPath" in manifest:
        json_body = Path(manifest["jsonPath"]).read_bytes()
        for json_key in (manifest.get("jsonKey"), manifest.get("draftJsonKey")):
            if not json_key:
                continue
            try:
                client.put_object(
                    Bucket=bucket,
                    Key=json_key,
                    Body=json_body,
                    ContentType="application/json",
                    ACL="public-read",
                    **json_extra,
                )
            except ClientError:
                client.put_object(
                    Bucket=bucket,
                    Key=json_key,
                    Body=json_body,
                    ContentType="application/json",
                    **json_extra,
                )
            print("uploaded", json_key)

    for key in manifest.get("deleteKeys") or []:
        try:
            client.delete_object(Bucket=bucket, Key=key)
            print("deleted", key)
        except ClientError as error:
            print("delete skip", key, error.response.get("Error", {}).get("Code"))


if __name__ == "__main__":
    main()
