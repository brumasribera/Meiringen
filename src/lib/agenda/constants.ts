export const AGENDA_HORIZON_DAYS = 365;

export function agendaHorizonDate(from = new Date()): Date {
  const horizon = new Date(from);
  horizon.setUTCDate(horizon.getUTCDate() + AGENDA_HORIZON_DAYS);
  horizon.setUTCHours(23, 59, 59, 999);
  return horizon;
}

export function isWithinAgendaHorizon(
  isoDate: string,
  from = new Date()
): boolean {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return false;
  return date >= from && date <= agendaHorizonDate(from);
}
