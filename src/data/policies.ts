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
          'Must reside in Canada for at least 730 days (2 years) within a 5-year period to renew PR card. Each day outside Canada does not count toward residency.',
        descriptionZh:
          '必须在5年内在加拿大居住至少730天（2年）才能续签PR卡。不在加拿大的日子不计入居住天数。',
        grantDateLabel: 'When did you receive your PR (or last renewal)?',
        grantDateLabelZh: '你是哪天获得永居身份的（或上次续签日期）？',
      },
      {
        id: 'ca_citizenship',
        name: 'Citizenship Application',
        nameZh: '入籍申请',
        periodYears: 5,
        requiredDays: 1095,
        absenceRule: 'half_credit',
        description:
          'Must reside in Canada for at least 1,095 days (3 years) within the 5-year period before applying. Time as a temporary resident (work/study permit) before PR counts as half a day per day, up to a maximum of 365 days credit. Time as PR counts fully.',
        descriptionZh:
          '必须在申请入籍前的5年内在加拿大居住至少1095天（3年）。获得PR之前以临时居民身份（工签/学签）在加拿大居住的时间，每天算0.5天，最多计365天。获得PR之后每天算1天。不在加拿大的日子不计入。',
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
        requiredDays: 1, // not a traditional "days required" — this tracks continuous absence
        absenceRule: 'reset',
        maxContinuousAbsence: 180,
        description:
          'You should not leave the US for more than 180 consecutive days on a single trip, or you risk being considered to have abandoned your permanent residence. Trips over 1 year almost certainly result in loss of green card.',
        descriptionZh:
          '单次离开美国不应超过180天，否则可能被视为放弃永久居民身份。离境超过1年几乎一定会导致绿卡失效。本app会追踪你的连续离境天数并在接近180天时发出警告。',
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
          'Must be physically present in the US for at least 30 months (approximately 913 days) out of the 5 years immediately before filing. Any single trip abroad exceeding 6 months (180 days) breaks continuous residence and may reset the 5-year period.',
        descriptionZh:
          '必须在提交申请前的5年内在美国实际居住至少30个月（约913天）。单次离境超过6个月（180天）会中断连续居住，可能导致5年期重新计算。',
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
          'Must have lived in Australia for at least 730 days (2 years) within the last 5 years to be eligible for a 5-year Resident Return Visa (subclass 155).',
        descriptionZh:
          '必须在过去5年内在澳大利亚居住至少730天（2年）才有资格获得5年期居民返程签证（155类）。',
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
          'Must have been physically present in NZ for at least 1,350 days during the 5 years before applying. Additionally, you must have been present for at least 240 days in each of those 5 years.',
        descriptionZh:
          '必须在申请前的5年内在新西兰实际居住至少1350天。此外，这5年中的每一年都必须至少居住240天。',
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
        name: 'Indefinite Leave to Remain (Skilled Worker)',
        nameZh: '永久居留 ILR（工作签证路径）',
        periodYears: 5,
        requiredDays: 0, // not a cumulative days requirement
        absenceRule: 'subtract',
        maxContinuousAbsence: 180,
        description:
          'Must have lived and worked in the UK for 5 years on a qualifying visa. You must not have spent more than 180 days outside the UK in any 12-month period. This is a continuous residence requirement, not a cumulative days count.',
        descriptionZh:
          '必须在英国持合格工作签证连续居住和工作5年。在任何12个月内离开英国不得超过180天。这是连续居住要求，不是累计天数要求。本app会追踪你每12个月内的离境天数。',
        grantDateLabel: 'When did your qualifying visa start?',
        grantDateLabelZh: '你的合格工作签证是哪天开始的？',
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
