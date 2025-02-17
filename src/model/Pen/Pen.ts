import { Area } from '@model/Area/Area';

export type Pen = {
  penId: number;
  name: string;
  description: string;
  penType:
    | 'calfPen'
    | 'heiferPen'
    | 'dryCowPen'
    | 'lactatingCowPen'
    | 'maternityPen'
    | 'isolationPen'
    | 'holdingPen';
  penStatus:
    | 'occupied'
    | 'empty'
    | 'reserved'
    | 'underMaintenance'
    | 'decommissioned'
    | 'inPlaning';
  areaId: number;
  area: Area;
};
