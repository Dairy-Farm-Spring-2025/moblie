export type Area = {
  areaId: number;
  name: string;
  description: string;
  length: number;
  width: number;
  penLength: number;
  penWidth: number;
  areaType: AreaType;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
};

export type AreaType = 'cowHousing' | 'milkingParlor' | 'warehouse';
