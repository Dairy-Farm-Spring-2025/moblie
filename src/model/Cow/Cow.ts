import { Area } from '@model/Area/Area';
import { HealthRecord } from '@model/HealthRecord/HealthRecord';
import { Item } from '@model/Item/Item';

// Enum for Cow Status
export enum CowStatus {
  MILKING_COW = 'milkingCow',
  DRY_COW = 'dryCow',
  PREGNANT_COW = 'pregnantCow',
  OPEN_COW = 'openCow',
  CALVING_COW = 'calvingCow',
  SICK_COW = 'sickCow',
  BREEDING_COW = 'breedingCow',
  QUARANTINED_COW = 'quarantinedCow',
  CULLING = 'culling',
}

export type CowStatusHealth =
  | 'milkingCow'
  | 'dryCow'
  | 'pregnantCow'
  | 'openCow'
  | 'calvingCow'
  | 'sickCow'
  | 'breedingCow'
  | 'quarantinedCow'
  | 'culling';

// Enum for Cow Origin
export enum CowOrigin {
  EUROPEAN = 'european',
  INDIAN = 'indian',
  AFRICAN = 'african',
  AMERICAN = 'american',
  AUSTRALIAN = 'australian',
  EXOTIC = 'exotic',
  INDIGENOUS = 'indigenous',
  CROSSBREED = 'crossbreed',
}

// Enum for Gender
export enum Gender {
  FEMALE = 'female',
  MALE = 'male',
}

// CowType Model
export interface CowType {
  cowTypeId: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  maxWeight?: number;
}

// Cow Model
export interface Cow {
  cowId: number;
  name: string;
  cowStatus: CowStatus;
  dateOfBirth: string;
  dateOfEnter: string;
  dateOfOut: string | null;
  weight: number;
  size: number;
  description: string;
  cowOrigin: CowOrigin;
  gender: Gender;
  inPen: boolean;
  penResponse: PenResponse;
  healthInfoResponses: HealthResponse[];
  cowType: CowType;
  createdAt: string;
  updatedAt: string;
}

export interface PenResponse {
  penId: number;
  name: string;
  description: string;
  penType: string;
  penStatus: string;
  area: Area;
  createdAt: string;
  updatedAt: string;
}

export type HealthResponse = {
  date: string;
  health: HealthRecord & IllnessCow & InjectionCow;
  id: number;
  type: 'HEALTH_RECORD' | 'ILLNESS' | 'INJECTIONS';
};

export type InjectionStatus = 'pending' | 'inProgress' | 'completed' | 'canceled';

export type InjectionCow = {
  administeredBy: string | null;
  cowEntity: Cow;
  description: string;
  id: number;
  injectionDate: string;
  status: InjectionStatus;
  vaccineCycleDetail: VaccineCycleDetail;
};

export interface VaccineCycle {
  vaccineCycleId: number;
  name: string;
  description: string;
  cowTypeEntity: {
    cowTypeId: number;
    name: string;
    description: string;
    maxWeight: number;
    status: string;
  };
  vaccineCycleDetails: VaccineCycleDetail[];
}

export interface VaccineCycleDetail {
  description: string;
  dosage: number;
  dosageUnit: string;
  firstInjectionMonth: number;
  injectionSite:
    | 'leftArm'
    | 'rightArm'
    | 'leftThigh'
    | 'rightThigh'
    | 'buttock'
    | 'abdomen'
    | 'other';
  itemEntity: Item;
  name: string;
  numberPeriodic: number;
  unitPeriodic: 'days' | 'weeks' | 'months' | 'years';
  vaccineCycleDetailId: number;
  vaccineIngredients: string;
  vaccineType: 'hormone' | 'vaccine';
}

export type IllnessCow = {
  illnessId: number;
  symptoms: string;
  severity: Severity;
  startDate: string;
  endDate: string;
  prognosis: string;
  cowEntity: Cow;
  userEntity: UserProfileData;
  veterinarian: UserProfileData;
  mediaList: MediaList[];
  illnessDetails: IllnessDetail[];
};

export type MediaList = {
  illnessImageId: number;
  type: string;
  url: string;
};

export type UserProfileData = {
  createdAt: string;
  updatedAt: string;
  id: number;
  name: string;
  phoneNumber: number;
  employeeNumber: number;
  email: string;
  gender: string;
  address: string;
  profilePhoto: string;
  dob: string;
  status: string;
  roleId: Role;
};

export type IllnessDetail = {
  illnessDetailId: number;
  date: string;
  description: string;
  status: StatusIllnessDetail;
  veterinarian: UserProfileData;
  vaccine: any;
  dosage: number;
  injectionSite:
    | 'leftArm'
    | 'rightArm'
    | 'leftThigh'
    | 'rightThigh'
    | 'buttock'
    | 'abdomen'
    | 'other';
};

export type StatusIllnessDetail = 'observed' | 'treated' | 'cured' | 'ongoing' | 'deceased';

export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';
