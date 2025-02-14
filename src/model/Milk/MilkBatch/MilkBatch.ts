import { DailyMilk } from '../DailyMilk/DailyMilk';

// MilkBatch interface
export interface MilkBatch {
  milkBatchId: number;
  totalVolume: number;
  date: string;
  expiryDate: string;
  status: 'expired' | 'inventory' | 'out_of_stock';
  dailyMilks: DailyMilk[];
}
