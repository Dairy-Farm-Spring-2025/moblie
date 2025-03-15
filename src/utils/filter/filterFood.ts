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

export const calculateTotalQuantity = (array: any[]) => {
  const total = array?.reduce(
    (total, item) => total + (item?.quantity || 0),
    0
  );
  return total ? total?.toFixed(2) : 0;
};
