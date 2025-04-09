import { Cow, CowStatus, CowStatusHealth, Severity, StatusIllnessDetail } from '@model/Cow/Cow';

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
  healthRecordId: number;
  bodyTemperature: number;
  heartRate: number;
  respiratoryRate: number;
  ruminateActivity: number;
  weight: number;
  size: number;
  description: string | null;
  reportTime: string; // ISO date string
  period: CowStatusHealth;
  cowEntity: Cow;
  chestCircumference: number;
  bodyLength: number;
};

export type HealthRecordForm = {
  bodyTemperature: number;
  heartRate: number;
  respiratoryRate: number;
  ruminateActivity: number;
  size: number;
  description: string | null;
  period: CowStatusHealth;
  chestCircumference: number;
  bodyLength: number;
  cowId: number;
  status: 'good' | 'fair' | 'poor' | 'critical' | 'recovering';
};

export type IllnessPayload = {
  severity: Severity;
  prognosis: string;
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
