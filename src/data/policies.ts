import {ImmigrationPolicy} from '../types';

export const policies: ImmigrationPolicy[] = [
  {
    country: 'CA',
    countryName: 'Canada',
    countryNameZh: '加拿大',
    flag: '🇨🇦',
    statusTypes: [
      {
        id: 'ca_pr_renewal',
        name: 'PR Renewal',
        nameZh: 'PR 续签（永久居民续签）',
        periodYears: 5,
        requiredDays: 730,
        absenceRule: 'subtract',
        description:
          'Must reside in Canada for at least 730 days (2 years) within a 5-year period to renew PR card.',
        descriptionZh:
          '必须在5年内在加拿大居住至少730天（2年）才能续签PR卡。离开加拿大的每一天都会从已居住天数中扣除。',
        grantDateLabel: 'When did you receive your PR (or last renewal)?',
        grantDateLabelZh: '你是哪天获得永居身份的（或上次续签日期）？',
      },
      {
        id: 'ca_citizenship',
        name: 'Citizenship Application',
        nameZh: '入籍申请',
        periodYears: 5,
        requiredDays: 1095,
        absenceRule: 'subtract',
        description:
          'Must reside in Canada for at least 1,095 days (3 years) within the 5-year period immediately before applying for citizenship.',
        descriptionZh:
          '必须在申请入籍前的5年内在加拿大居住至少1095天（3年）。离开加拿大的每一天都会从已居住天数中扣除。',
        grantDateLabel: 'When did you receive your PR?',
        grantDateLabelZh: '你是哪天获得永居身份的？',
      },
    ],
  },
  {
    country: 'US',
    countryName: 'United States',
    countryNameZh: '美国',
    flag: '🇺🇸',
    statusTypes: [
      {
        id: 'us_green_card',
        name: 'Green Card Maintenance',
        nameZh: '绿卡维持',
        periodYears: 1,
        requiredDays: 185,
        absenceRule: 'reset',
        maxContinuousAbsence: 180,
        description:
          'Should not be outside the US for more than 180 consecutive days, or risk losing green card status.',
        descriptionZh:
          '连续离开美国不应超过180天，否则可能失去绿卡身份。',
        grantDateLabel: 'When did you receive your Green Card?',
        grantDateLabelZh: '你是哪天获得绿卡的？',
      },
      {
        id: 'us_citizenship',
        name: 'Citizenship (5-year rule)',
        nameZh: '入籍申请（5年规则）',
        periodYears: 5,
        requiredDays: 913,
        absenceRule: 'reset',
        maxContinuousAbsence: 180,
        description:
          'Must be physically present in the US for at least 30 months out of 5 years. Any single trip over 6 months may reset the clock.',
        descriptionZh:
          '必须在5年内在美国实际居住至少30个月（约913天）。单次离境超过6个月可能会重置计数。',
        grantDateLabel: 'When did you receive your Green Card?',
        grantDateLabelZh: '你是哪天获得绿卡的？',
      },
    ],
  },
  {
    country: 'AU',
    countryName: 'Australia',
    countryNameZh: '澳大利亚',
    flag: '🇦🇺',
    statusTypes: [
      {
        id: 'au_pr_renewal',
        name: 'PR Renewal (RRV)',
        nameZh: 'PR 续签（居民返程签证）',
        periodYears: 5,
        requiredDays: 730,
        absenceRule: 'subtract',
        description:
          'Must have lived in Australia for at least 2 years within the last 5 years to be eligible for a 5-year RRV.',
        descriptionZh:
          '必须在过去5年内在澳大利亚居住至少2年才有资格获得5年期居民返程签证。',
        grantDateLabel: 'When did you receive your PR?',
        grantDateLabelZh: '你是哪天获得永居身份的？',
      },
    ],
  },
  {
    country: 'NZ',
    countryName: 'New Zealand',
    countryNameZh: '新西兰',
    flag: '🇳🇿',
    statusTypes: [
      {
        id: 'nz_citizenship',
        name: 'Citizenship by Grant',
        nameZh: '入籍申请',
        periodYears: 5,
        requiredDays: 1350,
        absenceRule: 'subtract',
        description:
          'Must be present in NZ for at least 1,350 days during the 5 years before applying, including 240 days in each of those 5 years.',
        descriptionZh:
          '必须在申请前的5年内在新西兰居住至少1350天，且每年至少240天。',
        grantDateLabel: 'When did you receive your residency?',
        grantDateLabelZh: '你是哪天获得居留身份的？',
      },
    ],
  },
  {
    country: 'UK',
    countryName: 'United Kingdom',
    countryNameZh: '英国',
    flag: '🇬🇧',
    statusTypes: [
      {
        id: 'uk_ilr',
        name: 'Indefinite Leave to Remain',
        nameZh: '永久居留（ILR）',
        periodYears: 5,
        requiredDays: 1825,
        absenceRule: 'subtract',
        maxContinuousAbsence: 180,
        description:
          'Must not have been outside the UK for more than 180 days in any 12-month period during the qualifying period.',
        descriptionZh:
          '在合格期间内，任何12个月内离开英国不得超过180天。',
        grantDateLabel: 'When did you receive your visa?',
        grantDateLabelZh: '你是哪天获得签证的？',
      },
    ],
  },
];

export function getPolicy(countryCode: string): ImmigrationPolicy | undefined {
  return policies.find(p => p.country === countryCode);
}

export function getStatusType(countryCode: string, statusId: string) {
  const policy = getPolicy(countryCode);
  return policy?.statusTypes.find(s => s.id === statusId);
}
