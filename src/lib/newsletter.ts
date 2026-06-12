export {
  matchEventsForUser,
  eventWindowDays,
  shouldSendAlertToday,
  getSiteUrl,
  buildManageUrl,
} from "@/lib/alerts/newsletter-utils";

export { buildAlertDigestEmailHtml as buildNewsletterHtml } from "@/lib/email/alert-template";
