/**
 * Прямая загрузка JSON в S3 (Timeweb, SigV4, path-style).
 * Свойства скрипта: S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY;
 * опционально S3_ENDPOINT (https://s3.twcstorage.ru), S3_REGION (ru-1).
 *
 * Подпись: паттерн tanaikech / S3-for-Google-Apps-Script (byte[] в цепочке HMAC).
 */

var S3_BUCKET_PROPERTY = 'S3_BUCKET';
var S3_ACCESS_KEY_PROPERTY = 'S3_ACCESS_KEY';
var S3_SECRET_KEY_PROPERTY = 'S3_SECRET_KEY';
var S3_ENDPOINT_PROPERTY = 'S3_ENDPOINT';
var S3_REGION_PROPERTY = 'S3_REGION';
var S3_DEFAULT_ENDPOINT = 'https://s3.twcstorage.ru';
var S3_DEFAULT_REGION = 'ru-1';

/** sync: src/constants/tourDataUrls.ts TOUR_DATA_S3_PATHS */
var S3_OBJECT_KEYS = {
  tours: 'tour-schedule/tours_list.json',
  schedule: 'tour-schedule/schedule.json',
};

/**
 * @returns {{ bucket: string, accessKey: string, secretKey: string, endpoint: string, region: string }}
 */
function getS3Config_() {
  var props = PropertiesService.getScriptProperties();
  var bucket = props.getProperty(S3_BUCKET_PROPERTY);
  var accessKey = props.getProperty(S3_ACCESS_KEY_PROPERTY);
  var secretKey = props.getProperty(S3_SECRET_KEY_PROPERTY);
  if (!bucket || !accessKey || !secretKey) {
    throw new Error(
      'Задайте в свойствах скрипта: S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY.'
    );
  }
  return {
    bucket: bucket.trim(),
    accessKey: accessKey.trim(),
    secretKey: secretKey.trim(),
    endpoint: (props.getProperty(S3_ENDPOINT_PROPERTY) || S3_DEFAULT_ENDPOINT).replace(
      /\/$/,
      ''
    ),
    region: (props.getProperty(S3_REGION_PROPERTY) || S3_DEFAULT_REGION).trim(),
  };
}

/**
 * @param {number[]} bytes
 * @returns {string}
 */
function bytesToHex_(bytes) {
  return bytes
    .map(function (b) {
      var v = b < 0 ? b + 256 : b;
      return (v < 16 ? '0' : '') + v.toString(16);
    })
    .join('');
}

/**
 * @param {string} text
 * @returns {string}
 */
function sha256Hex_(text) {
  return bytesToHex_(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text, Utilities.Charset.UTF_8)
  );
}

/**
 * @param {string} secretKey
 * @param {string} dateStamp
 * @param {string} region
 * @param {string} service
 * @returns {number[]}
 */
function getSignatureKey_(secretKey, dateStamp, region, service) {
  var kDate = Utilities.computeHmacSha256Signature(dateStamp, 'AWS4' + secretKey);
  var kRegion = Utilities.computeHmacSha256Signature(
    Utilities.newBlob(region).getBytes(),
    kDate
  );
  var kService = Utilities.computeHmacSha256Signature(
    Utilities.newBlob(service).getBytes(),
    kRegion
  );
  return Utilities.computeHmacSha256Signature(
    Utilities.newBlob('aws4_request').getBytes(),
    kService
  );
}

/**
 * @param {string} stringToSign
 * @param {number[]} signingKey
 * @returns {string}
 */
function signStringToSign_(stringToSign, signingKey) {
  return bytesToHex_(
    Utilities.computeHmacSha256Signature(
      Utilities.newBlob(stringToSign).getBytes(),
      signingKey
    )
  );
}

/**
 * AWS URI encode (один сегмент пути).
 * @param {string} value
 * @returns {string}
 */
function awsUriEncode_(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, function (ch) {
    return '%' + ch.charCodeAt(0).toString(16).toUpperCase();
  });
}

/**
 * @param {string} objectKey
 * @returns {string}
 */
function buildCanonicalUri_(bucket, objectKey) {
  var encodedKey = objectKey
    .split('/')
    .map(function (segment) {
      return awsUriEncode_(segment);
    })
    .join('/');
  return '/' + bucket + '/' + encodedKey;
}

/**
 * @param {string} objectKey
 * @param {Object} payload
 * @returns {{ key: string, status: number }}
 */
function uploadJsonObjectToS3_(objectKey, payload) {
  var config = getS3Config_();
  var body = JSON.stringify(payload, null, 2) + '\n';
  var contentType = 'application/json';
  var host = config.endpoint.replace(/^https?:\/\//, '');
  var canonicalUri = buildCanonicalUri_(config.bucket, objectKey);
  var method = 'PUT';
  var service = 's3';
  var amzDate = Utilities.formatDate(new Date(), 'GMT', "yyyyMMdd'T'HHmmss'Z'");
  var dateStamp = amzDate.substring(0, 8);
  var payloadHash = sha256Hex_(body);
  var canonicalHeaders =
    'content-type:' +
    contentType +
    '\n' +
    'host:' +
    host +
    '\n' +
    'x-amz-content-sha256:' +
    payloadHash +
    '\n' +
    'x-amz-date:' +
    amzDate +
    '\n';
  var signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';
  var canonicalRequest =
    method +
    '\n' +
    canonicalUri +
    '\n' +
    '\n' +
    canonicalHeaders +
    '\n' +
    signedHeaders +
    '\n' +
    payloadHash;
  var credentialScope = dateStamp + '/' + config.region + '/' + service + '/aws4_request';
  var stringToSign =
    'AWS4-HMAC-SHA256' +
    '\n' +
    amzDate +
    '\n' +
    credentialScope +
    '\n' +
    sha256Hex_(canonicalRequest);
  var signingKey = getSignatureKey_(config.secretKey, dateStamp, config.region, service);
  var signature = signStringToSign_(stringToSign, signingKey);
  var authorization =
    'AWS4-HMAC-SHA256 Credential=' +
    config.accessKey +
    '/' +
    credentialScope +
    ', SignedHeaders=' +
    signedHeaders +
    ', Signature=' +
    signature;
  var url = config.endpoint + canonicalUri;

  var response = UrlFetchApp.fetch(url, {
    method: 'put',
    contentType: contentType,
    payload: body,
    headers: {
      'x-amz-date': amzDate,
      'x-amz-content-sha256': payloadHash,
      Authorization: authorization,
      'Cache-Control': 'no-cache, max-age=0, must-revalidate',
    },
    muteHttpExceptions: true,
  });

  var status = response.getResponseCode();
  if (status < 200 || status >= 300) {
    throw new Error(
      'S3 отклонил загрузку ' +
        objectKey +
        ': HTTP ' +
        status +
        '. ' +
        response.getContentText() +
        '\n\nПроверьте S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET и S3_REGION (' +
        config.region +
        ').'
    );
  }

  return { key: objectKey, status: status };
}

/**
 * @param {string} target
 * @param {Object} payload
 * @returns {{ key: string, status: number }}
 */
function publishJsonToS3_(target, payload) {
  var key = S3_OBJECT_KEYS[target];
  if (!key) {
    throw new Error('Неизвестный target: ' + target);
  }
  return uploadJsonObjectToS3_(key, payload);
}
