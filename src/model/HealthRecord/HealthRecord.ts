import { Cow } from '@model/Cow/Cow';

export type Period =
  | 'milkingCow'
  | 'dryCow'
  | 'pregnantCow'
  | 'openCow'
  | 'calvingCow'
  | 'sickCow'
  | 'breedingCow'
  | 'quarantinedCow'
  | 'culling';

export type HealthRecord = {
  status: 'good' | 'fair' | 'poor' | 'critical' | 'recovering';
  weight: number;
  size: number;
  period: Period;
  healthRecordId: number;
  cowEntity: Cow;
  reportTime: string;
};

export type HealthRecordForm = {
  status: 'good' | 'fair' | 'poor' | 'critical' | 'recovering';
  weight: number;
  size: number;
  period: Period;
  cowId: number;
};
