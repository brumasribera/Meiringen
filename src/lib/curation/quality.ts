import { isWithinAgendaHorizon } from "../agenda/constants";
import {
  EVENT_CATEGORIES,
  ORGANIZATION_CATEGORIES,
  type EventCategory,
  type OrganizationCategory,
} from "../constants";

export type EventQualityInput = {
  title: string | null;
  description?: string | null;
  category?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  location_name?: string | null;
  address?: string | null;
  source_url?: string | null;
  sourceName?: string | null;
  siteUrl?: string | null;
  organizationName?: string | null;
};

export type OrganizationQualityInput = {
  name: string | null;
  description?: string | null;
  category?: string | null;
  website_url?: string | null;
  source_url?: string | null;
  locality?: string | null;
};

export type QualityDecision = {
  accepted: boolean;
  reason: string;
};

const REGION_PATTERN =
  /(meiringen|haslital|oberhasli|brienz|brienzwiler|brienzersee|innertkirchen|hasliberg|schattenhalb|guttannen|gadmen|willigen|hofstetten|schwanden|oberried|unterbach|balm|hausen|ballenberg|axalp|reuti|aarenschlucht|michaelskirche|casino(?:platz)?|hasli)/i;

const GENERIC_EVENT_TITLE_PATTERN =
  /^(agenda|aktuell(?:es)?|anl[aä]sse?|calendar|details?|events?|home|kalender|kontakt|mehr|news|programm|start(?:seite)?|termine|veranstaltungen?|weiter(?:lesen)?|zum ereignis)$/i;

const JUNK_EVENT_TITLE_PATTERN =
  /^(pdf|download|seite|page)\b|cookie|datenschutz|geschlossen|impressum|newsletter|login|warenkorb|navigation/i;

const BUSINESS_OR_TRAVEL_ONLY_PATTERN =
  /\b(agb|apartment|ferienwohnung|hotel|jobs?|karriere|package|pauschale|privacy|restaurant|reservation|shop|ticketshop|unterkunft|webcam)\b/i;

const BROAD_HOSTS_REQUIRING_REGIONAL_MATCH = new Set([
  "brienzersee.ch",
  "eventbrite.com",
  "haslital.swiss",
  "interlaken.swiss",
  "jungfrau.ch",
  "localcities.ch",
  "lokalhelden.ch",
  "meiringen-hasliberg.ch",
  "mvb-be.ch",
  "myswitzerland.com",
  "procap.ch",
  "sac-cas.ch",
  "schweizerjodel.ch",
  "thunersee.ch",
]);

const COMMUNITY_ORG_PATTERN =
  /\b(chor|club|dorfkommission|elternverein|feuerwehr|fotoclub|frauenverein|gemeinschaft|gesellschaft|gruppe|jodler|jugend|klub|kultur|musik|orchester|samariter|schule|sektion|sport|stiftung|theater|tracht|turn|verein|vereinigung)\b/i;

const BUSINESS_ORG_PATTERN =
  /\b(ag|gmbh|hotel|immobilien|praxis|restaurant|shop|tourismus|treuhand)\b/i;

export function hostnameFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function normalizeEventCategory(
  value: string | null | undefined,
): EventCategory {
  return EVENT_CATEGORIES.includes(value as EventCategory)
    ? (value as EventCategory)
    : "other";
}

export function normalizeOrganizationCategory(
  value: string | null | undefined,
): OrganizationCategory {
  return ORGANIZATION_CATEGORIES.includes(value as OrganizationCategory)
    ? (value as OrganizationCategory)
    : "other";
}

export function isBroadRegionalHost(url: string | null | undefined): boolean {
  const host = hostnameFromUrl(url);
  return Boolean(host && BROAD_HOSTS_REQUIRING_REGIONAL_MATCH.has(host));
}

export function hasRegionalSignal(
  ...values: Array<string | null | undefined>
): boolean {
  return REGION_PATTERN.test(values.filter(Boolean).join(" "));
}

function normalizedLength(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim().length ?? 0;
}

function hasLetters(value: string) {
  return /[A-Za-zÀ-ÿ]/.test(value);
}

function isValidHttpUrl(value: string | null | undefined) {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function evaluateEventCandidate(
  input: EventQualityInput,
): QualityDecision {
  const title = input.title?.replace(/\s+/g, " ").trim() ?? "";
  if (title.length < 4 || !hasLetters(title)) {
    return { accepted: false, reason: "missing useful title" };
  }

  if (
    GENERIC_EVENT_TITLE_PATTERN.test(title) ||
    JUNK_EVENT_TITLE_PATTERN.test(title)
  ) {
    return { accepted: false, reason: "generic navigation title" };
  }

  if (
    BUSINESS_OR_TRAVEL_ONLY_PATTERN.test(title) &&
    !hasRegionalSignal(title, input.location_name, input.address)
  ) {
    return { accepted: false, reason: "business or travel listing" };
  }

  if (!input.start_date || !isWithinAgendaHorizon(input.start_date)) {
    return { accepted: false, reason: "date outside agenda horizon" };
  }

  if (input.end_date) {
    const start = new Date(input.start_date).getTime();
    const end = new Date(input.end_date).getTime();
    if (Number.isFinite(start) && Number.isFinite(end) && end < start) {
      return { accepted: false, reason: "end date before start date" };
    }
  }

  if (input.source_url && !isValidHttpUrl(input.source_url)) {
    return { accepted: false, reason: "invalid source url" };
  }

  const regionalText = [
    title,
    input.description,
    input.location_name,
    input.address,
    input.source_url,
    input.siteUrl,
    input.sourceName,
    input.organizationName,
  ];

  if (
    (isBroadRegionalHost(input.source_url) ||
      isBroadRegionalHost(input.siteUrl)) &&
    !hasRegionalSignal(...regionalText)
  ) {
    return { accepted: false, reason: "broad source without local signal" };
  }

  return { accepted: true, reason: "accepted" };
}

export function shouldDeleteScrapedEvent(
  input: EventQualityInput,
): QualityDecision {
  const decision = evaluateEventCandidate(input);
  if (!decision.accepted) return decision;

  if (
    normalizedLength(input.description) === 0 &&
    normalizedLength(input.location_name) === 0 &&
    normalizedLength(input.address) === 0 &&
    isBroadRegionalHost(input.source_url) &&
    !hasRegionalSignal(input.title, input.source_url)
  ) {
    return { accepted: false, reason: "thin broad-source event" };
  }

  return decision;
}

export function evaluateOrganizationCandidate(
  input: OrganizationQualityInput,
): QualityDecision {
  const name = input.name?.replace(/\s+/g, " ").trim() ?? "";
  if (name.length < 3 || !hasLetters(name)) {
    return { accepted: false, reason: "missing useful name" };
  }

  if (
    /^(home|kontakt|impressum|vereine?|organisationen?|details?)$/i.test(name)
  ) {
    return { accepted: false, reason: "generic organization label" };
  }

  if (
    BUSINESS_ORG_PATTERN.test(name) &&
    !COMMUNITY_ORG_PATTERN.test(name) &&
    !hasRegionalSignal(
      name,
      input.description,
      input.locality,
      input.website_url,
      input.source_url,
    )
  ) {
    return { accepted: false, reason: "business listing" };
  }

  if (input.website_url && !isValidHttpUrl(input.website_url)) {
    return { accepted: false, reason: "invalid website url" };
  }

  if (input.source_url && !isValidHttpUrl(input.source_url)) {
    return { accepted: false, reason: "invalid source url" };
  }

  return { accepted: true, reason: "accepted" };
}
