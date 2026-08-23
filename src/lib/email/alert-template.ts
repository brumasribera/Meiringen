import type { AlertFrequency } from "@/lib/constants";
import type { Event } from "@/lib/types";
import { cleanEventTitle } from "@/lib/event-title";
import { normalizeImageUrl } from "@/lib/event-images";
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
  welcomeTitle: string;
  welcomeBodyWeekly: string;
  welcomeBodyMonthly: string;
  welcomeSubject: string;
  digestSubject: string;
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
    welcomeTitle: "Du bist dabei!",
    welcomeBodyWeekly:
      "Ab sofort erhältst du wöchentliche E-Mail-Updates zu Veranstaltungen, die zu deinen Interessen passen.",
    welcomeBodyMonthly:
      "Ab sofort erhältst du monatliche E-Mail-Updates zu Veranstaltungen, die zu deinen Interessen passen.",
    welcomeSubject: "Meiringen.life — Event-Alerts aktiviert",
    digestSubject: "Meiringen.life — Veranstaltungen für dich",
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
    welcomeTitle: "You're subscribed!",
    welcomeBodyWeekly:
      "You'll receive weekly email updates for events that match your interests.",
    welcomeBodyMonthly:
      "You'll receive monthly email updates for events that match your interests.",
    welcomeSubject: "Meiringen.life — event alerts activated",
    digestSubject: "Meiringen.life — events for you",
  },
  fr: {
    preheader: "Vos événements correspondants dans le Haslital",
    title: "Votre actualité du Haslital",
    intro: "Ces événements correspondent à vos centres d'intérêt :",
    empty: "Aucun événement correspondant pour cette période.",
    cta: "Voir tous les événements",
    manage: "Modifier les paramètres",
    unsubscribe: "Se désabonner",
    footer: "Meiringen.life — gratuit, multilingue, pensé pour la région.",
    disclaimer:
      "Les informations sur les organisations et les événements peuvent être inexactes ou obsolètes. Veuillez vérifier les détails auprès de l'organisateur avant de participer.",
    frequencyLabel: "Résumé",
    welcomeTitle: "Vous êtes inscrit·e !",
    welcomeBodyWeekly:
      "Vous recevrez désormais des mises à jour hebdomadaires par e-mail sur les événements correspondant à vos centres d'intérêt.",
    welcomeBodyMonthly:
      "Vous recevrez désormais des mises à jour mensuelles par e-mail sur les événements correspondant à vos centres d'intérêt.",
    welcomeSubject: "Meiringen.life — alertes d'événements activées",
    digestSubject: "Meiringen.life — événements pour vous",
  },
  it: {
    preheader: "I tuoi eventi corrispondenti nell'Haslital",
    title: "Il tuo aggiornamento dall'Haslital",
    intro: "Questi eventi corrispondono ai tuoi interessi:",
    empty: "In questo periodo non ci sono ancora eventi corrispondenti.",
    cta: "Vedi tutti gli eventi",
    manage: "Cambia impostazioni",
    unsubscribe: "Annulla iscrizione",
    footer: "Meiringen.life — gratuito, multilingue, pensato per la regione.",
    disclaimer:
      "Le informazioni su organizzazioni ed eventi possono essere imprecise o non aggiornate. Verifica i dettagli con l'organizzatore prima di partecipare.",
    frequencyLabel: "Riepilogo",
    welcomeTitle: "Sei iscritto!",
    welcomeBodyWeekly:
      "Riceverai aggiornamenti via e-mail ogni settimana sugli eventi che corrispondono ai tuoi interessi.",
    welcomeBodyMonthly:
      "Riceverai aggiornamenti via e-mail ogni mese sugli eventi che corrispondono ai tuoi interessi.",
    welcomeSubject: "Meiringen.life — avvisi eventi attivati",
    digestSubject: "Meiringen.life — eventi per te",
  },
  es: {
    preheader: "Tus eventos coincidentes en Haslital",
    title: "Tu actualización de Haslital",
    intro: "Estos eventos coinciden con tus intereses:",
    empty: "Aún no hay eventos coincidentes en este periodo.",
    cta: "Ver todos los eventos",
    manage: "Cambiar ajustes",
    unsubscribe: "Darse de baja",
    footer: "Meiringen.life — gratis, multilingüe y pensado para la región.",
    disclaimer:
      "La información sobre organizaciones y eventos puede ser incorrecta o estar desactualizada. Verifica los detalles con la organización antes de asistir.",
    frequencyLabel: "Resumen",
    welcomeTitle: "¡Ya estás suscrito!",
    welcomeBodyWeekly:
      "Recibirás actualizaciones semanales por correo sobre eventos que coincidan con tus intereses.",
    welcomeBodyMonthly:
      "Recibirás actualizaciones mensuales por correo sobre eventos que coincidan con tus intereses.",
    welcomeSubject: "Meiringen.life — alertas de eventos activadas",
    digestSubject: "Meiringen.life — eventos para ti",
  },
  ca: {
    preheader: "Els teus esdeveniments coincidents a Haslital",
    title: "La teva actualització d'Haslital",
    intro: "Aquests esdeveniments coincideixen amb els teus interessos:",
    empty: "Encara no hi ha esdeveniments coincidents en aquest període.",
    cta: "Veure tots els esdeveniments",
    manage: "Canviar la configuració",
    unsubscribe: "Donar-se de baixa",
    footer: "Meiringen.life — gratuït, multilingüe i pensat per a la regió.",
    disclaimer:
      "La informació sobre organitzacions i esdeveniments pot ser incorrecta o no estar actualitzada. Verifica els detalls amb l'organització abans d'assistir-hi.",
    frequencyLabel: "Resum",
    welcomeTitle: "Ja t'has subscrit!",
    welcomeBodyWeekly:
      "Rebràs actualitzacions setmanals per correu sobre esdeveniments que coincideixin amb els teus interessos.",
    welcomeBodyMonthly:
      "Rebràs actualitzacions mensuals per correu sobre esdeveniments que coincideixin amb els teus interessos.",
    welcomeSubject: "Meiringen.life — alertes d'esdeveniments activades",
    digestSubject: "Meiringen.life — esdeveniments per a tu",
  },
  gsw: {
    preheader: "Din passendi Events im Haslital",
    title: "Din Haslital-Update",
    intro: "Die Events passe zu dine Interesse:",
    empty: "Für dä Zeitraum hets no kei passendi Events.",
    cta: "Alli Events aluege",
    manage: "Istellige ändere",
    unsubscribe: "Abmelde",
    footer: "Meiringen.life - gratis, mehrsprachig, für d Region.",
    disclaimer:
      "Organisations- und Veranstaltungsangabe chönd falsch oder veraltet sii. Bitte vor Ort oder direkt bi de Veranstalter nofröge.",
    frequencyLabel: "Digest",
    welcomeTitle: "Du bisch debi!",
    welcomeBodyWeekly:
      "Ab jetzt bechunsch wöchentli E-Mail-Updates zu Events, wo zu dine Interesse passe.",
    welcomeBodyMonthly:
      "Ab jetzt bechunsch monatli E-Mail-Updates zu Events, wo zu dine Interesse passe.",
    welcomeSubject: "Meiringen.life - Event-Alerts aktiviert",
    digestSubject: "Meiringen.life - Events für di",
  },
  rm: {
    preheader: "Tes novitads adattadas en il Haslital",
    title: "Tes novitads dal Haslital",
    intro: "Quests eveniments correspundan a tes interess:",
    empty: "En quest interval n'ei anc nagins eveniments adattads.",
    cta: "Guardar tut ils eveniments",
    manage: "Midar configuraziun",
    unsubscribe: "S'annullar",
    footer: "Meiringen.life — gratuit, pluriling e concepì per la regiun.",
    disclaimer:
      "Las novitads davart novitads ed organisaziuns pon esser nuncorrectas u antiquadas. Priesa controlla las novitads cun l'organisatur avant da prender part.",
    frequencyLabel: "Resumaziun",
    welcomeTitle: "Ti es s'inscrit!",
    welcomeBodyWeekly:
      "Ti retschaivas novitads per e-mail mintga emna davart eveniments che correspundan a tes interess.",
    welcomeBodyMonthly:
      "Ti retschaivas novitads per e-mail mintga mais davart eveniments che correspundan a tes interess.",
    welcomeSubject: "Meiringen.life — novitads d'eveniments activadas",
    digestSubject: "Meiringen.life — novitads per tai",
  },
  pt: {
    preheader: "Os eventos correspondentes no Haslital",
    title: "A sua atualização do Haslital",
    intro: "Estes eventos correspondem aos seus interesses:",
    empty: "Ainda não há eventos correspondentes neste período.",
    cta: "Ver todos os eventos",
    manage: "Alterar definições",
    unsubscribe: "Cancelar subscrição",
    footer: "Meiringen.life — gratuito, multilingue e feito para a região.",
    disclaimer:
      "As informações sobre organizações e eventos podem estar incorretas ou desatualizadas. Verifique os detalhes com a organização antes de participar.",
    frequencyLabel: "Resumo",
    welcomeTitle: "Está inscrito!",
    welcomeBodyWeekly:
      "Passará a receber atualizações semanais por e-mail sobre eventos que correspondem aos seus interesses.",
    welcomeBodyMonthly:
      "Passará a receber atualizações mensais por e-mail sobre eventos que correspondem aos seus interesses.",
    welcomeSubject: "Meiringen.life — alertas de eventos ativados",
    digestSubject: "Meiringen.life — eventos para si",
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

function safeEmailImageUrl(
  imageUrl: string | null | undefined,
  siteUrl: string,
) {
  return normalizeImageUrl(imageUrl, siteUrl)?.replace(/'/g, "%27") ?? null;
}

function getNewsletterSectionCopy(locale: string) {
  const copy: Record<string, { nextWeek: string; later: string; seeMore: string }> = {
    de: { nextWeek: "Nächste Woche", later: "Weitere Veranstaltungen", seeMore: "Mehr Veranstaltungen ansehen" },
    en: { nextWeek: "Next week", later: "More upcoming events", seeMore: "See more events" },
    fr: { nextWeek: "La semaine prochaine", later: "Autres événements à venir", seeMore: "Voir plus d'événements" },
    it: { nextWeek: "La prossima settimana", later: "Altri eventi in arrivo", seeMore: "Vedi altri eventi" },
    es: { nextWeek: "La próxima semana", later: "Más eventos próximos", seeMore: "Ver más eventos" },
    ca: { nextWeek: "La setmana vinent", later: "Més esdeveniments propers", seeMore: "Veure més esdeveniments" },
    gsw: { nextWeek: "Nächsti Wuche", later: "Wiiteri Events", seeMore: "Meh Events aluege" },
    rm: { nextWeek: "L'autra emna", later: "Auters eveniments", seeMore: "Guardar dapli eveniments" },
    pt: { nextWeek: "Na próxima semana", later: "Mais eventos próximos", seeMore: "Ver mais eventos" },
  };
  return copy[locale] ?? copy.en;
}

function buildEventCardHtml(event: Event, locale: string, siteUrl: string) {
  const when = formatDateRange(event.start_date, event.end_date, locale);
  const title = cleanEventTitle(event.title, event.organization?.name);
  const location = event.location_name
    ? ` · ${escapeHtml(event.location_name)}`
    : "";
  const price =
    event.price && event.price.trim()
      ? `<div style="margin-top:10px;font-size:13px;line-height:1.4;font-weight:700;color:#ffffff;">${escapeHtml(event.price)}</div>`
      : "";
  const badgeColor = categoryColor(event.category);
  const imageUrl = safeEmailImageUrl(event.image_url, siteUrl);
  const eventUrl = `${siteUrl}/events/${escapeHtml(event.slug)}`;

  if (imageUrl) {
    const escapedImageUrl = escapeHtml(imageUrl);

    return `
      <a href="${eventUrl}" style="display:block;text-decoration:none;margin-bottom:12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid rgba(17,17,17,0.12);border-radius:18px;background:#111111;overflow:hidden;box-shadow:0 12px 28px rgba(17,17,17,0.12);">
          <tr>
            <td style="padding:0;background:#111111;">
              <img src="${escapedImageUrl}" width="100%" height="198" alt="${escapeHtml(title)}" style="display:block;width:100%;height:198px;object-fit:cover;background:#111111;" />
            </td>
          </tr>
          <tr>
            <td style="padding:20px;background:#111111;">
              <span style="display:inline-block;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,0.34);background:rgba(255,255,255,0.18);color:#ffffff;font-size:11px;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(event.category)}</span>
              <div style="margin-top:12px;font-size:20px;line-height:1.25;font-weight:800;color:#ffffff;">${escapeHtml(title)}</div>
              <div style="margin-top:8px;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.86);">${escapeHtml(when)}${location}</div>
              ${price}
            </td>
          </tr>
        </table>
      </a>`;
  }

  const plainPrice =
    event.price && event.price.trim()
      ? `<div style="margin-top:10px;font-size:13px;line-height:1.4;font-weight:700;color:#B8860B;">${escapeHtml(event.price)}</div>`
      : "";

  return `
    <a href="${eventUrl}" style="display:block;text-decoration:none;margin-bottom:12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ece7df;border-radius:18px;background:#ffffff;overflow:hidden;">
        <tr>
          <td style="padding:18px 20px;">
            <span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${badgeColor};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${escapeHtml(event.category)}</span>
            <div style="margin-top:12px;font-size:18px;line-height:1.35;font-weight:700;color:#111111;">${escapeHtml(title)}</div>
            <div style="margin-top:8px;font-size:14px;line-height:1.5;color:#57534e;">${escapeHtml(when)}${location}</div>
            ${plainPrice}
          </td>
        </tr>
      </table>
    </a>`;
}

type BuildEmailOptions = {
  events: Event[];
  eventsNextWeek?: Event[];
  eventsLater?: Event[];
  hasMoreEvents?: boolean;
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

  const body =
    options.frequency === "weekly"
      ? copy.welcomeBodyWeekly
      : copy.welcomeBodyMonthly;

  return wrapEmail({
    locale: options.locale,
    preheader: copy.preheader,
    body: `
      <div style="display:inline-block;margin-bottom:14px;padding:6px 12px;border-radius:999px;background:#F4C430;color:#111111;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">${copy.frequencyLabel}</div>
      <h2 style="margin:0 0 12px;font-size:26px;line-height:1.2;color:#111111;letter-spacing:-0.03em;">${copy.welcomeTitle}</h2>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#57534e;">${body}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
        <tr>
          <td>
            <a href="${manageUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 22px;border-radius:999px;">${copy.manage}</a>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-size:14px;line-height:1.6;color:#78716c;">
        <a href="${siteUrl}/events" style="color:#111111;font-weight:600;text-decoration:none;">${copy.cta}</a>
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
        : options.locale === "fr"
          ? "Hebdomadaire"
          : options.locale === "it"
            ? "Settimanale"
            : options.locale === "es"
              ? "Semanal"
              : options.locale === "ca"
                ? "Setmanal"
                : options.locale === "rm"
                  ? "Emna"
                  : options.locale === "pt"
                    ? "Semanal"
                    : "Weekly"
      : options.locale === "de"
        ? "Monatlich"
        : options.locale === "fr"
          ? "Mensuel"
          : options.locale === "it"
            ? "Mensile"
            : options.locale === "es"
              ? "Mensual"
              : options.locale === "ca"
                ? "Mensual"
                : options.locale === "rm"
                  ? "Mintga mais"
                  : options.locale === "pt"
                    ? "Mensal"
                    : "Monthly";

  const nextWeekEvents = options.eventsNextWeek ?? options.events;
  const laterEvents = options.eventsLater ?? [];
  const eventCards = (events: Event[]) =>
    events.map((event) => buildEventCardHtml(event, options.locale, siteUrl)).join("");
  const nextWeekCards = eventCards(nextWeekEvents);
  const laterCards = eventCards(laterEvents);
  const sectionTitle = (title: string) =>
    `<h3 style="margin:28px 0 12px;font-size:18px;line-height:1.3;color:#111111;">${title}</h3>`;
  const content =
    nextWeekEvents.length === 0 && laterEvents.length === 0
      ? `<p style="margin:0;padding:20px;background:#faf8f5;border-radius:16px;color:#57534e;font-size:15px;line-height:1.6;">${copy.empty}</p>`
      : `${nextWeekCards ? `${sectionTitle(getNewsletterSectionCopy(options.locale).nextWeek)}${nextWeekCards}` : ""}`
        + `${laterCards ? `${sectionTitle(getNewsletterSectionCopy(options.locale).later)}${laterCards}` : ""}`;

  return wrapEmail({
    locale: options.locale,
    preheader: copy.preheader,
    body: `
      <p style="margin:0 0 8px;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#B8860B;">${copy.frequencyLabel} · ${freq}</p>
      <h2 style="margin:0 0 12px;font-size:28px;line-height:1.15;color:#111111;letter-spacing:-0.03em;">${copy.title}</h2>
      <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#57534e;">${copy.intro}</p>
      ${content}
      ${options.hasMoreEvents ? `
        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
          <tr>
            <td>
              <a href="${siteUrl}/events" style="display:inline-block;background:#F4C430;color:#111111;text-decoration:none;font-weight:800;font-size:15px;padding:14px 22px;border-radius:999px;box-shadow:0 6px 18px rgba(244,196,48,0.25);">${getNewsletterSectionCopy(options.locale).seeMore}</a>
            </td>
          </tr>
        </table>` : ""}
      <hr style="border:none;border-top:1px solid #ece7df;margin:32px 0;" />
      <p style="margin:0;font-size:14px;line-height:1.7;color:#78716c;">
        <a href="${manageUrl}" style="color:#111111;font-weight:700;text-decoration:none;">${copy.manage}</a>
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
                    Meiringen<span style="color:#F4C430;text-shadow:0.5px 1px 1px rgba(17,17,17,0.4);">.life</span>
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

export function getAlertEmailSubject(locale: string, count?: number): string {
  const copy = getCopy(locale);
  if (typeof count === "number") {
    return copy.digestSubject.replace("{count}", String(count));
  }
  return copy.welcomeSubject;
}
