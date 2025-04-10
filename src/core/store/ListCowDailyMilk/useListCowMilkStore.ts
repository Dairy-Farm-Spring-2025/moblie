import { create } from 'zustand';
import { ListCowMilk } from '@model/Milk/ListCowMilk/ListCowMilk';

type ListCowMilkStore = {
  listCowMilk: ListCowMilk[];
  setListCowMilk: (newItem: ListCowMilk) => void;
  removeCowMilk: (cowId: number) => void; // New function to remove item
};

export const useListCowMilkStore = create<ListCowMilkStore>((set) => ({
  listCowMilk: [],
  setListCowMilk: (newItem) =>
    set((state) => {
      const updatedList = state.listCowMilk.map((item) =>
        item.dailyMilk.cowId === newItem.dailyMilk.cowId
          ? { ...item, dailyMilk: { ...item.dailyMilk, volume: newItem.dailyMilk.volume } }
          : item
      );

      const isExisting = state.listCowMilk.some(
        (item) => item.dailyMilk.cowId === newItem.dailyMilk.cowId
      );

      return {
        listCowMilk: isExisting ? updatedList : [...updatedList, newItem],
      };
    }),
  removeCowMilk: (cowId) =>
    set((state) => ({
      listCowMilk: state.listCowMilk.filter((item) => item.dailyMilk.cowId !== cowId),
    })),
}));
