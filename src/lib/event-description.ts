function decodeBasicEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function decodeNumericEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, codePoint: string) => {
      const code = Number(codePoint);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : _;
    });
}

/**
 * Normalizes event descriptions imported from remote sites.
 * Cinema listings often encode line breaks as numeric entities like `&#010;`.
 */
export function formatEventDescription(description: string) {
  return decodeNumericEntities(
    decodeBasicEntities(description)
  )
    .replace(/\r\n?/g, "\n")
    .replace(/\u000b/g, "\n")
    .replace(/\u00a0/g, " ")
    .trim();
}
