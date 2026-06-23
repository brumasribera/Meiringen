function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[–—-]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTrailingOrganizationSuffix(title: string, organizationName: string) {
  const normalizedTitle = normalizeText(title);
  const normalizedOrg = normalizeText(organizationName);
  if (!normalizedTitle || !normalizedOrg) return title;

  const separators = [" - ", " – ", " — ", " -", "- ", " –", "– ", " —", "— "];
  for (const separator of separators) {
    const separatorIndex = title.lastIndexOf(separator);
    if (separatorIndex === -1) continue;

    const suffix = title.slice(separatorIndex + separator.length).trim();
    if (normalizeText(suffix) === normalizedOrg) {
      return title.slice(0, separatorIndex).trim();
    }
  }

  return title;
}

function stripOrganizationName(title: string, organizationName?: string | null) {
  if (!organizationName) return title;

  const org = normalizeText(organizationName);
  if (!org) return title;

  const patterns = [
    new RegExp(`^${org}\\s*(?:[:\\-|–—]\\s*)?`, "i"),
    new RegExp(`\\s*(?:[:\\-|–—]\\s*)?${org}$`, "i"),
    new RegExp(`\\s*\\(${org}\\)$`, "i"),
  ];

  let next = title;
  for (const pattern of patterns) {
    next = next.replace(pattern, "").trim();
  }
  return next || title;
}

export function cleanEventTitle(title: string, organizationName?: string | null) {
  const trimmed = title.trim();
  const withRemovedOrg = stripOrganizationName(trimmed, organizationName?.trim() ?? null);
  const cleaned = organizationName
    ? stripTrailingOrganizationSuffix(withRemovedOrg, organizationName.trim())
    : withRemovedOrg;
  return cleaned.replace(/\s*[–—-]\s*(training|probe|kurs|event|veranstaltung)\s*$/i, (match) =>
    match.replace(/^\s*[–—-]\s*/i, " - ")
  );
}
