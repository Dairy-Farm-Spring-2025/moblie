import { StatusItem } from '@model/Item/Item';

const statusItemColors: Record<StatusItem, string> = {
  available: '#166534', // Dark Green
  outOfStock: '#B91C1C', // Dark Red
  damaged: '#78350F', // Dark Brown
  expired: '#92400E', // Dark Orange
  reserved: '#1E3A8A', // Dark Blue
};

export const getStatusItemDarkColor = (status: StatusItem) =>
  statusItemColors[status] || '#374151'; // Default Dark Gray
