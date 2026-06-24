export const ADMIN_EMAIL = "brumasribera@gmail.com";

export function isAdminEmail(email?: string | null): boolean {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}
