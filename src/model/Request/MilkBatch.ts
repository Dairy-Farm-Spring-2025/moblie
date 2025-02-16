interface dailyMilkCow {
  cowId: number;
  volume: number;
}

export interface CreateMilkBatchModel {
  dailyMilk: [dailyMilkCow];
  shift: string;
}
