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
}
