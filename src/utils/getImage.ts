export const getAvatar = (imageUrl: string) => {
  return `http://34.124.196.11:8080/uploads/users/${imageUrl}`;
};

export const getReportImage = (imageUrl: string) => {
  return `http://34.124.196.11:8080/uploads/reportTasks/${imageUrl}`;
};
