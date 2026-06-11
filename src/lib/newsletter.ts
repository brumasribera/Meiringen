import type { Event } from "./types";
import type { NewsletterPreferences } from "./types";

export function matchEventsForUser(
  events: Event[],
  prefs: NewsletterPreferences
): Event[] {
  return events.filter((event) => {
    if (prefs.categories.length > 0 && !prefs.categories.includes(event.category)) {
      return false;
    }
    if (
      prefs.organization_ids.length > 0 &&
      event.organization_id &&
      !prefs.organization_ids.includes(event.organization_id)
    ) {
      return false;
    }
    if (
      prefs.languages.length > 0 &&
      event.language &&
      !prefs.languages.includes(event.language)
    ) {
      return false;
    }
    return true;
  });
}

export function buildNewsletterHtml(
  events: Event[],
  locale: string = "de"
): string {
  const titles: Record<string, string> = {
    de: "Deine Veranstaltungen im Haslital",
    gsw: "Dini Veranstaltige im Haslital",
    en: "Your events in Haslital",
    fr: "Vos événements dans le Haslital",
    it: "I tuoi eventi nel Haslital",
    rm: "Tias occurrenzas en il Haslital",
    pt: "Os seus eventos no Haslital",
  };

  const heading = titles[locale] ?? titles.de;

  const items = events
    .map(
      (e) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e7e5e4;">
          <strong style="color:#1b4332;">${e.title}</strong><br/>
          <span style="color:#78716c;font-size:14px;">
            ${new Date(e.start_date).toLocaleDateString(locale, { dateStyle: "medium" })}
            ${e.location_name ? ` · ${e.location_name}` : ""}
          </span>
        </td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:system-ui,sans-serif;background:#faf8f5;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;border:1px solid #e7e5e4;">
    <h1 style="color:#1b4332;margin:0 0 8px;font-size:24px;">Meiringen.org</h1>
    <p style="color:#78716c;margin:0 0 24px;">${heading}</p>
    <table style="width:100%;border-collapse:collapse;">${items}</table>
    <p style="margin-top:24px;font-size:14px;color:#78716c;">
      <a href="https://meiringen.org/${locale}/events" style="color:#1b4332;">Alle Veranstaltungen anzeigen</a>
    </p>
  </div>
</body>
</html>`;
}
