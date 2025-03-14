import { FeedMealDetails } from '@model/Feed/Feed';

export const filteredHay = (detailData: FeedMealDetails[]) =>
  detailData?.filter(
    (element: FeedMealDetails) =>
      element?.itemEntity?.categoryEntity?.name === 'Cỏ Khô'
  );
export const filteredRefined = (detailData: FeedMealDetails[]) =>
  detailData?.filter(
    (element: FeedMealDetails) =>
      element?.itemEntity?.categoryEntity?.name === 'Thức ăn tinh'
  );
export const filteredSilage = (detailData: FeedMealDetails[]) =>
  detailData?.filter(
    (element: FeedMealDetails) =>
      element?.itemEntity?.categoryEntity?.name === 'Thức ăn ủ chua'
  );
export const filteredMineral = (detailData: FeedMealDetails[]) =>
  detailData?.filter(
    (element: FeedMealDetails) =>
      element?.itemEntity?.categoryEntity?.name === 'Khoáng chất'
  );
