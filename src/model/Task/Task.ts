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
  taskTypeId: {
    taskTypeId: number;
    name: string;
    roleId: { id: number; name: string }; // Include roleId
    description: string; // Include description
  };
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
