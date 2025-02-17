import { Cow, CowStatus } from '@model/Cow/Cow';

export type HealthRecord = {
  status: 'good' | 'fair' | 'poor' | 'critical' | 'recovering';
  weight: number;
  size: number;
  period: CowStatus;
  healthRecordId: number;
  cowEntity: Cow;
  reportTime: string;
};
