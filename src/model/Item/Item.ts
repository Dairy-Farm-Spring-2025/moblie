export type Item = {
  itemId: number;
  name: string;
  status: StatusItem;
  unit: Unit;
  quantity: number;
  categoryEntity: {
    categoryId: number;
    name: string;
  };
  warehouseLocationEntity: {
    warehouseLocationId: number;
    name: string;
    description: string;
  };
};

export type ItemRequestBody = {
  name: string;
  status: 'available' | 'outOfStock' | 'damaged' | 'expired' | 'reserved';
  unit: Unit;
  quantity: number;
  categoryId: number;
  locationId: number;
};

export type Unit =
  | 'kilogram'
  | 'gram'
  | 'liter'
  | 'milliliter'
  | 'piece'
  | 'pack'
  | 'squareMeter'
  | 'bottle'
  | 'bag'
  | 'box';

export type StatusItem =
  | 'available'
  | 'outOfStock'
  | 'damaged'
  | 'expired'
  | 'reserved';
