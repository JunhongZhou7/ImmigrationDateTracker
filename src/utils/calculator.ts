import {TravelRecord, StatusType, DayCalculation} from '../types';

function daysBetween(d1: string, d2: string): number {
  const date1 = new Date(d1 + 'T00:00:00');
  const date2 = new Date(d2 + 'T00:00:00');
  return Math.round((date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function addYears(dateStr: string, years: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Calculate days absent from travel records.
 * Records should be sorted by date ascending.
 * Each departure should be followed by an arrival.
 * If last record is a departure with no arrival, assume still abroad until today.
 */
export function calculateAbsentDays(
  records: TravelRecord[],
  periodStart: string,
  periodEnd: string,
): number {
  const sorted = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  let totalAbsent = 0;
  let currentDeparture: string | null = null;

  for (const record of sorted) {
    if (record.type === 'departure') {
      currentDeparture = record.date;
    } else if (record.type === 'arrival' && currentDeparture) {
      // Calculate absent days for this trip
      const tripStart = currentDeparture < periodStart ? periodStart : currentDeparture;
      const tripEnd = record.date > periodEnd ? periodEnd : record.date;

      if (tripStart < tripEnd) {
        totalAbsent += daysBetween(tripStart, tripEnd);
      }
      currentDeparture = null;
    }
  }

  // If currently abroad (departure with no matching arrival)
  if (currentDeparture) {
    const tripStart = currentDeparture < periodStart ? periodStart : currentDeparture;
    const today = todayStr();
    const tripEnd = today > periodEnd ? periodEnd : today;

    if (tripStart < tripEnd) {
      totalAbsent += daysBetween(tripStart, tripEnd);
    }
  }

  return totalAbsent;
}

/**
 * Main calculation function
 */
export function calculateResidency(
  startDate: string,
  statusType: StatusType,
  records: TravelRecord[],
): DayCalculation {
  const today = todayStr();
  const periodEnd = addYears(startDate, statusType.periodYears);
  const periodStart = startDate;

  // Total days elapsed in the period (up to today or period end)
  const effectiveEnd = today < periodEnd ? today : periodEnd;
  const totalDaysInPeriod = Math.max(0, daysBetween(periodStart, effectiveEnd));

  // Calculate absent days
  const daysAbsent = calculateAbsentDays(records, periodStart, effectiveEnd);

  // Days resided
  const daysResided = Math.max(0, totalDaysInPeriod - daysAbsent);

  // Days remaining
  const daysRemaining = Math.max(0, statusType.requiredDays - daysResided);

  // Progress
  const progressPercent = Math.min(
    100,
    Math.round((daysResided / statusType.requiredDays) * 100),
  );

  // Is on track?
  const totalPeriodDays = daysBetween(periodStart, periodEnd);
  const daysLeft = Math.max(0, daysBetween(today, periodEnd));
  const isOnTrack = daysRemaining <= daysLeft;

  // Estimated completion date (if staying continuously from now)
  let estimatedCompletionDate: string | undefined;
  if (daysRemaining > 0) {
    estimatedCompletionDate = addDays(today, daysRemaining);
  }

  return {
    totalDaysInPeriod,
    daysResided,
    daysAbsent,
    daysRequired: statusType.requiredDays,
    daysRemaining,
    periodStartDate: periodStart,
    periodEndDate: periodEnd,
    isOnTrack,
    estimatedCompletionDate,
    progressPercent,
  };
}

/**
 * Check if user is currently abroad based on records
 */
export function isCurrentlyAbroad(records: TravelRecord[]): boolean {
  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  if (sorted.length === 0) return false;
  return sorted[0].type === 'departure';
}

/**
 * Get current trip info if abroad
 */
export function getCurrentTripDays(records: TravelRecord[]): number {
  if (!isCurrentlyAbroad(records)) return 0;

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const lastDeparture = sorted[0];
  return daysBetween(lastDeparture.date, todayStr());
}
