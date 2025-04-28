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
    ?.replace(/([a-z])([A-Z])/g, '$1 $2') // Insert space before uppercase letters
    ?.replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
};

export const convertToDDMMYYYY = (dateString: string): string => {
  // Regex for date only: YYYY-MM-DD
  const dateOnlyRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  // Regex for date-time: YYYY-MM-DDTHH:mm:ss.ssssss (ISO format)
  const dateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

  if (dateTimeRegex.test(dateString)) {
    // If it matches date-time format, extract date and time
    const [, year, month, day, hours, minutes] = dateString.match(dateTimeRegex) || [];
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } else if (dateOnlyRegex.test(dateString)) {
    // If it matches date-only format, extract date
    const [, year, month, day] = dateString.match(dateOnlyRegex) || [];
    return `${day}/${month}/${year}`;
  } else {
    throw new Error('Invalid date format. Expected YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.');
  }
};

export const getVietnamISOString = (): string => {
  const currentDateNow = new Date();

  // Get Vietnam time components
  const vietnamDate = currentDateNow.toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: false,
  });

  // Split and parse the date string (e.g., "04/10/2025, 17:24:51.738")
  const [datePart, timePart] = vietnamDate.split(', ');
  const [month, day, year] = datePart.split('/');
  const [time, milliseconds] = timePart.split('.');
  const [hour, minute, second] = time.split(':');

  // Construct ISO 8601 string
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(
    2,
    '0'
  )}:${minute.padStart(2, '0')}:${second.padStart(2, '0')}.${milliseconds}Z`;
};

/**
 * Formats the current date and time in Vietnam (Asia/Ho_Chi_Minh, UTC+7) as an ISO 8601 string.
 * @returns A string in the format "YYYY-MM-DDTHH:mm:ss.SSSZ" (e.g., "2025-04-10T17:24:51.738Z")
 */
export const getVietnamISOTimeString = (): string => {
  const vietnamDate = getVietnamDate();
  return vietnamDate.toISOString(); // This will keep the time as Vietnam local time but in ISO format
};

/**
 * Formats a given Date object to an ISO 8601 string in Vietnam (Asia/Ho_Chi_Minh, UTC+7).
 * @param date - The Date object to format
 * @returns A string in the format "YYYY-MM-DDTHH:mm:ss.SSSZ"
 */
export const formatDateToISOString = (date: Date): string => {
  const vietnamTimeString = date.toLocaleString('en-US', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
  return new Date(vietnamTimeString).toISOString();
};

// utils/dateUtils.ts
export const getVietnamDate = (): Date => {
  try {
    const baseDate = new Date();
    const vietnamTimeString = baseDate.toLocaleString('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const vietnamDate = new Date(vietnamTimeString);
    return vietnamDate;
  } catch (error) {
    console.error('Error in getVietnamDate:', error);
    return new Date(); // Fallback to current device time
  }
};
