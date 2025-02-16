import { Cow } from '@model/Cow/Cow';

export type ListCowMilk = {
  dailyMilk: {
    cowId: number;
    volume: number;
  };
  cow: Cow | undefined;
};
