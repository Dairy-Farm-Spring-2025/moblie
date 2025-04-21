import { Area } from '@model/Area/Area';
import { IllnessCow, IllnessDetail, InjectionCow, VaccineCycleDetail } from '@model/Cow/Cow';
import { User } from '@model/User/User';

export type Task = {
  taskId: number;
  description: string;
  status: string;
  fromDate: string;
  toDate: string; // Allow null
  areaId: Area; // Match API
  taskTypeId: TaskType;
  assignerName: string; // Match API
  assigneeName: string; // Match API
  priority: string;
  shift: string;
  completionNotes: string | null;
  reportTask: ReportTaskData | null;
  material: {
    illnessDetail: IllnessDetail | null;
    vaccineInjection: InjectionCow | null;
    illness: IllnessCow | null;
  } | null;
};

export type ReportTaskData = {
  reportTaskId: number;
  description: string | null;
  status: string;
  startTime: string;
  endTime: string | null;
  date: string;
  comment: string | null;
  reviewer_id: User | null;
  reportImages: ReportTaskImage[];
};

export type ReportTaskImage = {
  reportTaskImageId: number;
  url: string;
};

export type WarehouseLocation = {
  warehouseLocationId: number;
  name: string;
  description: string;
  type: string;
};

export type Equipment = {
  equipmentId: number;
  name: string;
  type: string;
  status: string;
  description: string;
  quantity: number;
  warehouseLocationEntity: WarehouseLocation;
};

export type UseEquipmentId = {
  equipmentId: number;
  taskTypeId: number;
};

export type UseEquipment = {
  id: UseEquipmentId;
  equipment: Equipment;
  requiredQuantity: number;
  note: string;
};

export type TaskType = {
  taskTypeId: number;
  name: string;
  roleId: Role;
  description: string;
  useEquipments: UseEquipment[];
};

export type TaskTypeResponse = {
  taskTypeId: TaskType;
};
