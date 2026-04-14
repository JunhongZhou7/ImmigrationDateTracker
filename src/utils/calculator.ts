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
 * grantDate = when PR/visa was granted
 * startDate = when user started residing
 * 
 * For Canadian citizenship: the 5-year window is a ROLLING window ending today.
 * Time before PR as temporary resident counts as 0.5 day/day, max 365 days credit.
 * For most other types: period starts from grant date.
 */
export function calculateResidency(
  startDate: string,
  statusType: StatusType,
  records: TravelRecord[],
  grantDate?: string,
): DayCalculation {
  const today = todayStr();
  const grant = grantDate || startDate;

  // Determine period based on status type
  let periodStart: string;
  let periodEnd: string;

  if (statusType.id === 'ca_citizenship' || statusType.id === 'us_citizenship') {
    // Rolling window: 5 years back from today
    periodEnd = today;
    periodStart = addYears(today, -statusType.periodYears);
  } else if (statusType.id === 'ca_pr_renewal') {
    // Rolling window: 5 years back from today for PR renewal too
    periodEnd = today;
    periodStart = addYears(today, -statusType.periodYears);
  } else {
    // Fixed period from grant date
    periodStart = grant;
    periodEnd = addYears(grant, statusType.periodYears);
  }

  // Effective end is today or period end, whichever is earlier
  const effectiveEnd = today < periodEnd ? today : periodEnd;
  
  // Effective start: don't go before the user started residing
  const effectiveStart = periodStart > startDate ? periodStart : startDate;
  // But for the period display, keep periodStart as-is

  const totalDaysInPeriod = Math.max(0, daysBetween(periodStart, effectiveEnd));

  // Calculate absent days within the period
  const daysAbsent = calculateAbsentDays(records, periodStart, effectiveEnd);

  // Calculate days resided
  let daysResided: number;

  if (statusType.absenceRule === 'half_credit' && grantDate) {
    // Canadian citizenship special rule:
    // Time before PR (as temp resident): 0.5 day/day, max 365 days credit
    // Time after PR: 1 day/day
    
    const prDate = grantDate;
    
    // Days before PR within the period
    const prePrStart = periodStart > startDate ? periodStart : startDate;
    const prePrEnd = prDate < effectiveEnd ? prDate : effectiveEnd;
    
    let prePrDays = 0;
    if (prePrStart < prePrEnd) {
      const totalPrePr = daysBetween(prePrStart, prePrEnd);
      const prePrAbsent = calculateAbsentDays(records, prePrStart, prePrEnd);
      const prePrPresent = Math.max(0, totalPrePr - prePrAbsent);
      // Half credit, max 365
      prePrDays = Math.min(Math.floor(prePrPresent * 0.5), 365);
    }

    // Days after PR within the period
    const postPrStart = prDate > periodStart ? prDate : periodStart;
    let postPrDays = 0;
    if (postPrStart < effectiveEnd) {
      const totalPostPr = daysBetween(postPrStart, effectiveEnd);
      const postPrAbsent = calculateAbsentDays(records, postPrStart, effectiveEnd);
      postPrDays = Math.max(0, totalPostPr - postPrAbsent);
    }

    daysResided = prePrDays + postPrDays;
  } else {
    // Standard calculation
    daysResided = Math.max(0, totalDaysInPeriod - daysAbsent);
  }

  // Days remaining
  const daysRemaining = Math.max(0, statusType.requiredDays - daysResided);

  // Progress
  const progressPercent = statusType.requiredDays > 0
    ? Math.min(100, Math.round((daysResided / statusType.requiredDays) * 100))
    : 100;

  // Is on track?
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
