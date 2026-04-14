export type TravelType = 'departure' | 'arrival';
export type RecordSource = 'gps' | 'manual';

export interface TravelRecord {
  id: string;
  type: TravelType;
  date: string; // ISO date string YYYY-MM-DD
  destination?: string;
  source: RecordSource;
  note?: string;
  createdAt: string;
  modifiedAt?: string;
  previousDate?: string; // for edit history
}

export interface UserProfile {
  country: string;
  statusType: string;
  statusGrantDate: string; // date PR/visa was granted or last renewed
  startDate: string; // date started residing
  createdAt: string;
}

export interface ImmigrationPolicy {
  country: string;
  countryName: string;
  countryNameZh: string;
  flag: string;
  statusTypes: StatusType[];
}

export interface StatusType {
  id: string;
  name: string;
  nameZh: string;
  periodYears: number; // evaluation period in years
  requiredDays: number; // days required to reside
  absenceRule: 'subtract' | 'reset' | 'half_credit' | 'custom';
  maxContinuousAbsence?: number; // max consecutive days abroad
  description: string;
  descriptionZh: string;
  grantDateLabel: string; // label for the grant date question
  grantDateLabelZh: string;
}

export interface DayCalculation {
  totalDaysInPeriod: number;
  daysResided: number;
  daysAbsent: number;
  daysRequired: number;
  daysRemaining: number;
  periodStartDate: string;
  periodEndDate: string;
  isOnTrack: boolean;
  estimatedCompletionDate?: string;
  progressPercent: number;
}
