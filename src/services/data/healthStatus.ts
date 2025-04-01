import { t } from 'i18next';

export const OPTIONS_HEALTH_STATUS = [
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
  { label: 'Poor', value: 'poor' },
  { label: 'Critical', value: 'critical' },
  { label: 'Recovering', value: 'recovering' },
];

export const OPTIONS_ILLNESS_DETAIL_STATUS = [
  { label: 'Observed', value: 'observed' },
  { label: 'Treated', value: 'treated' },
  { label: 'Cured', value: 'cured' },
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Deceased', value: 'deceased' },
];

export const OPTION_INJECTION_SITES = () => [
  { label: t('Left Arm'), value: 'leftArm' },
  { label: t('Right Arm'), value: 'rightArm' },
  { label: t('Left Thigh'), value: 'leftThigh' },
  { label: t('Right Thigh'), value: 'rightThigh' },
  { label: t('Buttock'), value: 'buttock' },
  { label: t('Abdomen'), value: 'abdomen' },
  { label: t('Other'), value: 'other' },
];
