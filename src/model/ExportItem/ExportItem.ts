import { Task } from '@model/Task/Task';
import { User } from '@model/User/User';

export type ExportItem = {
  exportItemId: 0;
  picker: User;
  quantity: 0;
  itemBatchEntity: ItemBatchEntity;
  exportDate: string;
  task: Task;
  status: ExportItemStatus;
};

export type ExportItemStatus =
  | 'pending'
  | 'approved'
  | 'exported'
  | 'cancel'
  | 'reject';

interface CategoryEntity {
  categoryId: number;
  name: string;
}

interface WarehouseLocationEntity {
  warehouseLocationId: number;
  name: string;
  description: string;
  type: 'milk';
}

interface ItemEntity {
  itemId: number;
  name: string;
  description: string;
  status: 'available';
  unit: 'kilogram';
  quantity: number;
  categoryEntity: CategoryEntity;
  warehouseLocationEntity: WarehouseLocationEntity;
}

interface SupplierEntity {
  supplierId: number;
  name: string;
  address: string;
  phone: string;
  email: string;
}

interface ItemBatchEntity {
  itemBatchId: number;
  quantity: number;
  importDate: string; // 'YYYY-MM-DD' format
  expiryDate: string; // 'YYYY-MM-DD' format
  status: 'available';
  itemEntity: ItemEntity;
  supplierEntity: SupplierEntity;
}
