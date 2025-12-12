/**
 * Format date từ UTC string hoặc Date object, giữ nguyên ngày (không convert sang local timezone)
 * Input: "2025-12-10T18:24:31.104142Z" (UTC) hoặc Date object
 * Output: "10/12/2025 18:24"
 * 
 * Giải quyết vấn đề: toLocaleDateString() tự convert UTC sang local timezone
 * nên ngày 10 UTC+7 thành ngày 11
 */
export const formatDateWithoutTimezoneShift = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return 'N/A';
  }
};

/**
 * Format date ngắn (chỉ lấy ngày/tháng/năm) từ UTC string hoặc Date object
 */
export const formatDateShortWithoutTimezoneShift = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    
    return `${day}/${month}/${year}`;
  } catch {
    return 'N/A';
  }
};
