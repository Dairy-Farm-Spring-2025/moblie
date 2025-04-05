import { User } from '@model/User/User';
import { ApplicationType } from './ApplicationType';

export type ApplicationPayload = {
  title: string;
  content: string;
  fromDate: string;
  toDate: string;
  typeId: number;
};

export type Application = {
  applicationId: number;
  title: string;
  content: string;
  status: 'processing' | 'complete' | 'cancel' | 'reject';
  commentApprove: string;
  requestDate: string;
  approveDate: string;
  fromDate: string;
  toDate: string;
  type: ApplicationType;
  approveBy: User;
  requestBy: User;
};
