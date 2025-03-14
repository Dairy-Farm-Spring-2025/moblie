import { CowStatus, CowType } from '@model/Cow/Cow';
import { Item } from '@model/Item/Item';

export type FeedType = {
  feedMealId: number;
  name: string;
  description: string;
  cowTypeEntity: CowType;
};

export type FeedMeals = {
  feedMealId: number;
  name: string;
  description: string;
  cowTypeEntity: CowType;
  cowStatus: CowStatus;
  shift: 'morningShift';
  feedMealDetails: FeedMealDetails[];
};

export type FeedMealDetails = {
  feedMealDetailId: number;
  quantity: number;
  itemEntity: Item;
};
