import {
  parseSiteContentDocument,
  type PolicyContentDocument,
} from './siteContentDocument';

function isStaticLegalPdfUrl(url: string): boolean {
  return /\/legal\//i.test(url) || /localhost|127\.0\.0\.1/i.test(url);
}

export function inheritPolicyAssetFromFooter(
  policy: PolicyContentDocument,
  footerRaw: unknown,
): PolicyContentDocument {
  if (policy.asset?.url && !isStaticLegalPdfUrl(policy.asset.url)) {
    return policy;
  }
  try {
    const footer = parseSiteContentDocument('footer', footerRaw);
    for (const block of footer.blocks) {
      for (const row of block.rows) {
        if (row.type !== 'pdf' || row.documentId !== policy.documentId || row.asset == null) {
          continue;
        }
        if (!isStaticLegalPdfUrl(row.asset.url)) {
          return { ...policy, asset: row.asset };
        }
      }
    }
  } catch {
    return policy;
  }
  return policy;
}
