import { create } from 'zustand';
import { DailyMilk } from '@model/Milk/DailyMilk/DailyMilk';

type DailyMilkStore = {
  dailyMilk: DailyMilk[];
  setDailyMilk: (newDailyMilk: DailyMilk[]) => void;
};

export const useDailyMilkStoreList = create<DailyMilkStore>((set) => ({
  dailyMilk: [],
  setDailyMilk: (newDailyMilk: DailyMilk[]) => set({ dailyMilk: newDailyMilk }),
}));
