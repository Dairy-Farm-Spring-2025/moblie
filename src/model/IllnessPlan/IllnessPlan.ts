import { InjectionSite } from '@model/Illness/enums/InjectionSite';

// Vaccine interfaces (from previous steps)
interface CategoryEntity {
  categoryId: number;
  name: string;
}

interface WarehouseLocationEntity {
  warehouseLocationId: number;
  name: string;
  description: string;
  type: string;
}

export interface Vaccine {
  itemId: number;
  name: string;
  description: string;
  status: string;
  unit: string;
  categoryEntity: CategoryEntity;
  warehouseLocationEntity: WarehouseLocationEntity;
}

// Interface for the illness plan request body
export interface IllnessPlan {
  dosage: number;
  injectionSite: InjectionSite;
  date: string; // Format: YYYY-MM-DD
  itemId: number; // Vaccine/Medication ID
  description: string;
  illnessId: number;
}

export interface IllnessPlanRequest {
  plans: IllnessPlan[];
}
