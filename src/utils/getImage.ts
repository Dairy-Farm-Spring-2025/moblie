export const getAvatar = (imageUrl: string) => {
  return `https://api.dairyfarmfpt.website/uploads/users/${imageUrl}`;
};

export const getReportImage = (imageUrl: string) => {
  return `https://api.dairyfarmfpt.website/uploads/reportTasks/${imageUrl}`;
};

export const getIllnessImage = (imageUrl: string) => {
  return `https://api.dairyfarmfpt.website/uploads/illness/${imageUrl}`;
};
