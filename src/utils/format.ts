export const formatType = (type: string) => {
  // Thay thế các dấu gạch dưới (_) thành khoảng trắng và viết hoa chữ cái đầu mỗi từ
  return type
    ?.replace(/([A-Z])/g, ' $1') // Thêm khoảng trắng trước chữ hoa
    ?.replace(/^./, (str) => str.toUpperCase()) // Viết hoa chữ cái đầu tiên
    ?.trim(); // Loại bỏ khoảng trắng dư thừa
};

export const formatFilteredType = (type: string) =>
  type
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());

export const formatCamelCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before uppercase letters
    .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
};

export const convertToDDMMYYYY = (dateString: string): string => {
  // Regex for date only: YYYY-MM-DD
  const dateOnlyRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  // Regex for date-time: YYYY-MM-DDTHH:mm:ss.ssssss (ISO format)
  const dateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

  if (dateTimeRegex.test(dateString)) {
    // If it matches date-time format, extract date and time
    const [, year, month, day, hours, minutes] =
      dateString.match(dateTimeRegex) || [];
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } else if (dateOnlyRegex.test(dateString)) {
    // If it matches date-only format, extract date
    const [, year, month, day] = dateString.match(dateOnlyRegex) || [];
    return `${day}/${month}/${year}`;
  } else {
    throw new Error(
      'Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.'
    );
  }
};
