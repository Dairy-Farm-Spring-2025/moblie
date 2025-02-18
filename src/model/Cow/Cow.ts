import { HealthRecord } from '@model/HealthRecord/HealthRecord';

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
}

// Cow Model
export interface Cow {
  cowId: number;
  name: string;
  cowStatus: CowStatus;
  dateOfBirth: string;
  dateOfEnter: string;
  dateOfOut: string | null;
  description: string;
  cowOrigin: CowOrigin;
  gender: Gender;
  cowType: CowType;
  createdAt: string;
  updatedAt: string;
  inPen: boolean;
  healthInfoResponses: HealthResponse[];
}

export type HealthResponse = {
  date: string;
  health: HealthRecord & IllnessCow;
  id: number;
  type: 'HEALTH_RECORD' | 'ILLNESS';
};

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
  illnessDetails: IllnessDetail[];
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
};

export type StatusIllnessDetail =
  | 'observed'
  | 'treated'
  | 'cured'
  | 'ongoing'
  | 'deceased';

export type Severity = 'mild' | 'moderate' | 'severe' | 'critical';
