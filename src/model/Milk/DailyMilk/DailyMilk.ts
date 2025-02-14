import { Cow } from '@model/Cow/Cow';

// DailyMilk interface
export interface DailyMilk {
  dailyMilkId: number;
  shift: 'shiftOne' | 'shiftTwo' | 'shiftThree' | 'shiftFour';
  milkDate: string;
  milkBatch: string;
  volume: number;
  status: 'pending' | 'inMilkBatch' | 'expired';
  worker: Worker;
  cow: Cow;
}
