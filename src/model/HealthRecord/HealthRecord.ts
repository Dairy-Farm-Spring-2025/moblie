import { Cow, Severity, StatusIllnessDetail } from '@model/Cow/Cow';

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
  weight: number | any;
  size: number | any;
  period: Period;
  cowId: number;
};

export type IllnessPayload = {
  symptoms: string;
  severity: Severity;
  startDate: string;
  endDate: string;
  prognosis: string;
  cowId: number;
};

export type IllnessDetailPayload = {
  date: string;
  description: string;
  status: StatusIllnessDetail;
  veterinarianId: number;
  itemId: number;
  illnessId: number;
  dosage: string;
  injectionSite:
    | 'leftArm'
    | 'rightArm'
    | 'leftThigh'
    | 'rightThigh'
    | 'buttock'
    | 'abdomen'
    | 'other';
};

export type IllnessDetailPlan = {
  fields: IllnessDetailPlanPayload[];
};

export type IllnessDetailPlanPayload = {
  date: string;
  description: string;
  itemId: number | any;
  illnessId: number;
};
