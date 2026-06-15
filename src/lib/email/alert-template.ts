import type { AlertFrequency } from "@/lib/constants";
import type { Event } from "@/lib/types";
import { formatDateRange } from "@/lib/utils";
import { buildManageUrl, getSiteUrl } from "@/lib/alerts/newsletter-utils";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

type EmailCopy = {
  preheader: string;
  title: string;
  intro: string;
  empty: string;
  cta: string;
  manage: string;
  unsubscribe: string;
  footer: string;
  disclaimer: string;
  frequencyLabel: string;
};

const COPY: Record<string, EmailCopy> = {
  de: {
    preheader: "Deine passenden Veranstaltungen im Haslital",
    title: "Dein Haslital-Update",
    intro: "Diese Veranstaltungen passen zu deinen Interessen:",
    empty: "In diesem Zeitraum gibt es noch keine passenden Veranstaltungen.",
    cta: "Alle Veranstaltungen ansehen",
    manage: "Einstellungen ändern",
    unsubscribe: "Abmelden",
    footer: "Meiringen.life — kostenlos, mehrsprachig, für die Region.",
    disclaimer:
      "Organisations- und Veranstaltungsangaben können fehlerhaft oder veraltet sein. Bitte vor Ort oder direkt beim Veranstalter nachfragen.",
    frequencyLabel: "Digest",
  },
  en: {
    preheader: "Your matching events in Haslital",
    title: "Your Haslital update",
    intro: "These events match your interests:",
    empty: "No matching events in this period yet.",
    cta: "Browse all events",
    manage: "Change settings",
    unsubscribe: "Unsubscribe",
    footer: "Meiringen.life — free, multilingual, built for the region.",
    disclaimer:
      "Organization and event information may be inaccurate or outdated. Please verify details with the organizer before attending.",
    frequencyLabel: "Digest",
  },
};

function getCopy(locale: string): EmailCopy {
  return COPY[locale] ?? COPY.en;
}

function categoryColor(category: string): string {
  const colors: Record<string, string> = {
    culture: "#2d6a4f",
    sport: "#1d4ed8",
    social: "#7c3aed",
    integration: "#0f766e",
    education: "#b45309",
    music: "#be123c",
    nature: "#166534",
    festival: "#a16207",
    market: "#92400e",
    other: "#57534e",
  };
  return colors[category] ?? colors.other;
}

type BuildEmailOptions = {
  events: Event[];
  locale: string;
  frequency: AlertFrequency;
  manageToken: string;
};

export function buildWelcomeEmailHtml(options: {
  locale: string;
  manageToken: string;
  frequency: AlertFrequency;
}): string {
  const copy = getCopy(options.locale);
  const manageUrl = buildManageUrl(options.manageToken, options.locale);
  const siteUrl = getSiteUrl();

  const title =
    options.locale === "de" ? "Du bist dabei!" : "You're subscribed!";
  const body =
    options.locale === "de"
      ? `Ab sofort erhältst du ${options.frequency === "weekly" ? "wöchentliche" : "monatliche"} E-Mail-Updates zu Veranstaltungen, die zu deinen Interessen passen.`
      : `You'll receive ${options.frequency === "weekly" ? "weekly" : "monthly"} email updates for events that match your interests.`;

  return wrapEmail({
    locale: options.locale,
    preheader: copy.preheader,
    body: `
      <h2 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#111111;">${title}</h2>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#57534e;">${body}</p>
      <a href="${manageUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 24px;border-radius:999px;">${copy.manage}</a>
      <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#78716c;">
        <a href="${siteUrl}/events" style="color:#111111;">${copy.cta}</a>
      </p>
    `,
  });
}

export function buildAlertDigestEmailHtml(options: BuildEmailOptions): string {
  const copy = getCopy(options.locale);
  const manageUrl = buildManageUrl(options.manageToken, options.locale);
  const unsubscribeUrl = `${getSiteUrl()}/api/alerts/manage?token=${encodeURIComponent(options.manageToken)}&action=unsubscribe`;
  const siteUrl = getSiteUrl();
  const freq =
    options.frequency === "weekly"
      ? options.locale === "de"
        ? "Wöchentlich"
        : "Weekly"
      : options.locale === "de"
        ? "Monatlich"
        : "Monthly";

  const eventCards =
    options.events.length === 0
      ? `<p style="margin:0;padding:20px;background:#faf8f5;border-radius:16px;color:#57534e;font-size:15px;line-height:1.6;">${copy.empty}</p>`
      : options.events
          .slice(0, 12)
          .map((event) => {
            const when = formatDateRange(
              event.start_date,
              event.end_date,
              options.locale,
            );
            const location = event.location_name
              ? ` · ${escapeHtml(event.location_name)}`
              : "";
            const badgeColor = categoryColor(event.category);

            return `
              <a href="${siteUrl}/events/${escapeHtml(event.slug)}" style="display:block;text-decoration:none;margin-bottom:12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ece7df;border-radius:18px;background:#ffffff;overflow:hidden;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${badgeColor};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(event.category)}</span>
                      <div style="margin-top:12px;font-size:18px;line-height:1.35;font-weight:700;color:#111111;">${escapeHtml(event.title)}</div>
                      <div style="margin-top:8px;font-size:14px;line-height:1.5;color:#57534e;">${escapeHtml(when)}${location}</div>
                    </td>
                  </tr>
                </table>
              </a>`;
          })
          .join("");

  return wrapEmail({
    locale: options.locale,
    preheader: copy.preheader,
    body: `
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#B8860B;">${copy.frequencyLabel} · ${freq}</p>
      <h2 style="margin:0 0 12px;font-size:28px;line-height:1.2;color:#111111;">${copy.title}</h2>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#57534e;">${copy.intro}</p>
      ${eventCards}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
        <tr>
          <td>
            <a href="${siteUrl}/events" style="display:inline-block;background:#F4C430;color:#111111;text-decoration:none;font-weight:700;font-size:15px;padding:14px 22px;border-radius:999px;">${copy.cta}</a>
          </td>
        </tr>
      </table>
      <hr style="border:none;border-top:1px solid #ece7df;margin:32px 0;" />
      <p style="margin:0;font-size:14px;line-height:1.7;color:#78716c;">
        <a href="${manageUrl}" style="color:#111111;font-weight:600;">${copy.manage}</a>
        &nbsp;·&nbsp;
        <a href="${unsubscribeUrl}" style="color:#78716c;">${copy.unsubscribe}</a>
      </p>
    `,
  });
}

function wrapEmail(options: {
  locale: string;
  preheader: string;
  body: string;
}): string {
  const siteUrl = getSiteUrl();

  return `<!DOCTYPE html>
<html lang="${escapeHtml(options.locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Meiringen.life</title>
</head>
<body style="margin:0;padding:0;background:#f3efe7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(options.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#f3efe7 0%,#faf8f5 100%);padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;">
          <tr>
            <td style="padding-bottom:18px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:52px;height:52px;border-radius:12px;overflow:hidden;vertical-align:middle;">
                    <img src="${siteUrl}/brand/logo-mark.png" width="52" height="52" alt="Meiringen.life" style="display:block;border-radius:12px;" />
                  </td>
                  <td style="padding-left:12px;font-size:22px;font-weight:800;color:#111111;letter-spacing:-0.02em;">
                    Meiringen<span style="color:#B8860B;">.life</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #ece7df;border-radius:28px;padding:32px 28px;box-shadow:0 18px 40px rgba(17,17,17,0.06);">
              ${options.body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;text-align:center;font-size:13px;line-height:1.6;color:#78716c;">
              <p style="margin:0 0 12px;font-size:12px;line-height:1.6;color:#a8a29e;">${getCopy(options.locale).disclaimer}</p>
              ${getCopy(options.locale).footer}<br />
              <a href="${siteUrl}" style="color:#111111;text-decoration:none;">${siteUrl.replace("https://", "")}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
