export const DEFAULT_FROM_EMAIL = "Meiringen Alerts <alerts@meiringen.life>";

export function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL?.trim() ?? DEFAULT_FROM_EMAIL;
}
