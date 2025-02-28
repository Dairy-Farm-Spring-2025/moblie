export const formatType = (type: string) => {
  // Thay thế các dấu gạch dưới (_) thành khoảng trắng và viết hoa chữ cái đầu mỗi từ
  return type
    ?.replace(/([A-Z])/g, ' $1') // Thêm khoảng trắng trước chữ hoa
    ?.replace(/^./, (str) => str.toUpperCase()) // Viết hoa chữ cái đầu tiên
    ?.trim(); // Loại bỏ khoảng trắng dư thừa
};

export const formatFilteredType = (type: string) =>
  type.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^\w/, (c) => c.toUpperCase());

export const formatCamelCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before uppercase letters
    .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
};

export const convertToDDMMYYYY = (dateString: string): string => {
  const regex = /^(\d{4})-(\d{2})-(\d{2})$/;
  if (regex.test(dateString)) {
    return dateString.replace(regex, '$3-$2-$1');
  } else {
    throw new Error('Invalid date format. Expected YYYY-MM-DD.');
  }
};
