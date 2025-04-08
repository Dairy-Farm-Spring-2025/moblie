import { User } from '@model/User/User';

export type Notification = {
  id: {
    userId: number;
    notificationId: number;
  };
  user: User;
  notification: {
    notificationId: number;
    title: string;
    description: string;
    link: string;
    category: CategoryNotification;
    dateTime: string;
  };
  read: boolean;
};
export type CategoryNotification = 'milking' | 'feeding' | 'heathcare' | 'task' | 'other';
