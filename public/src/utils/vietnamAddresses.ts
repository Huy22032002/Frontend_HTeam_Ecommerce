/**
 * Dữ liệu các tỉnh/thành phố và quận/huyện của Việt Nam
 * Nguồn: Được cung cấp công khai từ dữ liệu hành chính Việt Nam
 */

export interface Province {
  id: string;
  name: string;
  code: string;
}

export interface District {
  id: string;
  name: string;
  provinceId: string;
  code: string;
}

export const VIETNAM_PROVINCES: Province[] = [
  { id: '01', name: 'An Giang', code: 'AG' },
  { id: '02', name: 'Bà Rịa - Vũng Tàu', code: 'BR' },
  { id: '03', name: 'Bắc Giang', code: 'BG' },
  { id: '04', name: 'Bắc Kạn', code: 'BK' },
  { id: '05', name: 'Bạc Liêu', code: 'BL' },
  { id: '06', name: 'Bắc Ninh', code: 'BN' },
  { id: '07', name: 'Bến Tre', code: 'BT' },
  { id: '08', name: 'Bình Định', code: 'BD' },
  { id: '09', name: 'Bình Dương', code: 'BDU' },
  { id: '10', name: 'Bình Phước', code: 'BP' },
  { id: '11', name: 'Bình Thuận', code: 'BTH' },
  { id: '12', name: 'Cà Mau', code: 'CM' },
  { id: '13', name: 'Cao Bằng', code: 'CB' },
  { id: '14', name: 'Đắk Lắk', code: 'DL' },
  { id: '15', name: 'Đắk Nông', code: 'DN' },
  { id: '16', name: 'Điện Biên', code: 'DB' },
  { id: '17', name: 'Đồng Nai', code: 'DNA' },
  { id: '18', name: 'Đồng Tháp', code: 'DT' },
  { id: '19', name: 'Gia Lai', code: 'GL' },
  { id: '20', name: 'Hà Giang', code: 'HG' },
  { id: '21', name: 'Hà Nam', code: 'HN' },
  { id: '22', name: 'Hà Nội', code: 'HNI' },
  { id: '23', name: 'Hà Tĩnh', code: 'HT' },
  { id: '24', name: 'Hải Dương', code: 'HD' },
  { id: '25', name: 'Hải Phòng', code: 'HP' },
  { id: '26', name: 'Hậu Giang', code: 'HGI' },
  { id: '27', name: 'Hòa Bình', code: 'HB' },
  { id: '28', name: 'Hưng Yên', code: 'HY' },
  { id: '29', name: 'Khánh Hòa', code: 'KH' },
  { id: '30', name: 'Kiên Giang', code: 'KG' },
  { id: '31', name: 'Kon Tum', code: 'KT' },
  { id: '32', name: 'Lai Châu', code: 'LC' },
  { id: '33', name: 'Lâm Đồng', code: 'LD' },
  { id: '34', name: 'Lạng Sơn', code: 'LS' },
  { id: '35', name: 'Lào Cai', code: 'LC2' },
  { id: '36', name: 'Long An', code: 'LA' },
  { id: '37', name: 'Nam Định', code: 'ND' },
  { id: '38', name: 'Nghệ An', code: 'NA' },
  { id: '39', name: 'Ninh Bình', code: 'NB' },
  { id: '40', name: 'Ninh Thuận', code: 'NT' },
  { id: '41', name: 'Phú Thọ', code: 'PT' },
  { id: '42', name: 'Phú Yên', code: 'PY' },
  { id: '43', name: 'Quảng Bình', code: 'QB' },
  { id: '44', name: 'Quảng Nam', code: 'QN' },
  { id: '45', name: 'Quảng Ngãi', code: 'QNG' },
  { id: '46', name: 'Quảng Ninh', code: 'QNI' },
  { id: '47', name: 'Quảng Trị', code: 'QT' },
  { id: '48', name: 'Sóc Trăng', code: 'ST' },
  { id: '49', name: 'Sơn La', code: 'SL' },
  { id: '50', name: 'Tây Ninh', code: 'TN' },
  { id: '51', name: 'Thái Bình', code: 'TB' },
  { id: '52', name: 'Thái Nguyên', code: 'TNG' },
  { id: '53', name: 'Thanh Hóa', code: 'TH' },
  { id: '54', name: 'Thừa Thiên Huế', code: 'TTH' },
  { id: '55', name: 'Tiền Giang', code: 'TG' },
  { id: '56', name: 'TP. Hồ Chí Minh', code: 'TPHCM' },
  { id: '57', name: 'Trà Vinh', code: 'TV' },
  { id: '58', name: 'Tuyên Quang', code: 'TQ' },
  { id: '59', name: 'Vĩnh Long', code: 'VL' },
  { id: '60', name: 'Vĩnh Phúc', code: 'VP' },
  { id: '61', name: 'Yên Bái', code: 'YB' },
];

// Dữ liệu quận/huyện theo tỉnh (một số tỉnh chính)
export const VIETNAM_DISTRICTS: District[] = [
  // Hà Nội
  { id: '101', name: 'Quận Ba Đình', provinceId: '22', code: 'BD' },
  { id: '102', name: 'Quận Hoàn Kiếm', provinceId: '22', code: 'HK' },
  { id: '103', name: 'Quận Tây Hồ', provinceId: '22', code: 'TH' },
  { id: '104', name: 'Quận Cầu Giấy', provinceId: '22', code: 'CG' },
  { id: '105', name: 'Quận Đống Đa', provinceId: '22', code: 'DD' },
  { id: '106', name: 'Quận Hai Bà Trưng', provinceId: '22', code: 'HBT' },
  { id: '107', name: 'Quận Hoàng Mai', provinceId: '22', code: 'HM' },
  { id: '108', name: 'Quận Long Biên', provinceId: '22', code: 'LB' },
  { id: '109', name: 'Quận Thanh Xuân', provinceId: '22', code: 'TX' },
  { id: '110', name: 'Huyện Thanh Trì', provinceId: '22', code: 'TTR' },
  { id: '111', name: 'Huyện Gia Lâm', provinceId: '22', code: 'GL' },
  { id: '112', name: 'Huyện Sóc Sơn', provinceId: '22', code: 'SS' },
  { id: '113', name: 'Huyện Doãn Kế Thiện', provinceId: '22', code: 'DKT' },
  { id: '114', name: 'Huyện Mê Linh', provinceId: '22', code: 'ML' },
  { id: '115', name: 'Huyện Ba Vì', provinceId: '22', code: 'BV' },
  { id: '116', name: 'Huyện Phúc Thọ', provinceId: '22', code: 'PT' },
  { id: '117', name: 'Huyện Đan Phượng', provinceId: '22', code: 'DP' },
  { id: '118', name: 'Huyện Hoài Đức', provinceId: '22', code: 'HD' },
  { id: '119', name: 'Huyện Quốc Oai', provinceId: '22', code: 'QO' },
  { id: '120', name: 'Huyện Thạch Thất', provinceId: '22', code: 'TT' },
  { id: '121', name: 'Huyện Chương Mỹ', provinceId: '22', code: 'CM' },
  { id: '122', name: 'Huyện Mỹ Đức', provinceId: '22', code: 'MD' },

  // TP. Hồ Chí Minh
  { id: '201', name: 'Quận 1', provinceId: '56', code: 'Q1' },
  { id: '202', name: 'Quận 2', provinceId: '56', code: 'Q2' },
  { id: '203', name: 'Quận 3', provinceId: '56', code: 'Q3' },
  { id: '204', name: 'Quận 4', provinceId: '56', code: 'Q4' },
  { id: '205', name: 'Quận 5', provinceId: '56', code: 'Q5' },
  { id: '206', name: 'Quận 6', provinceId: '56', code: 'Q6' },
  { id: '207', name: 'Quận 7', provinceId: '56', code: 'Q7' },
  { id: '208', name: 'Quận 8', provinceId: '56', code: 'Q8' },
  { id: '209', name: 'Quận 9', provinceId: '56', code: 'Q9' },
  { id: '210', name: 'Quận 10', provinceId: '56', code: 'Q10' },
  { id: '211', name: 'Quận 11', provinceId: '56', code: 'Q11' },
  { id: '212', name: 'Quận 12', provinceId: '56', code: 'Q12' },
  { id: '213', name: 'Quận Bình Tân', provinceId: '56', code: 'BT' },
  { id: '214', name: 'Quận Bình Thạnh', provinceId: '56', code: 'BTH' },
  { id: '215', name: 'Quận Gò Vấp', provinceId: '56', code: 'GV' },
  { id: '216', name: 'Quận Phú Nhuận', provinceId: '56', code: 'PN' },
  { id: '217', name: 'Quận Tân Bình', provinceId: '56', code: 'TBN' },
  { id: '218', name: 'Quận Tân Phú', provinceId: '56', code: 'TP' },
  { id: '219', name: 'Huyện Bình Chánh', provinceId: '56', code: 'BCH' },
  { id: '220', name: 'Huyện Cần Giuộc', provinceId: '56', code: 'CG' },
  { id: '221', name: 'Huyện Cần Giờ', provinceId: '56', code: 'CGO' },
  { id: '222', name: 'Huyện Hóc Môn', provinceId: '56', code: 'HM' },
  { id: '223', name: 'Huyện Nhà Bè', provinceId: '56', code: 'NB' },
  { id: '224', name: 'Huyện Củ Chi', provinceId: '56', code: 'CC' },

  // Hải Phòng
  { id: '301', name: 'Quận Hồng Bàng', provinceId: '25', code: 'HB' },
  { id: '302', name: 'Quận Ngô Quyền', provinceId: '25', code: 'NQ' },
  { id: '303', name: 'Quận Lê Chân', provinceId: '25', code: 'LC' },
  { id: '304', name: 'Quận Kiến An', provinceId: '25', code: 'KA' },
  { id: '305', name: 'Quận Hải An', provinceId: '25', code: 'HA' },
  { id: '306', name: 'Quận Đồ Sơn', provinceId: '25', code: 'DS' },
  { id: '307', name: 'Huyện Tiên Lãng', provinceId: '25', code: 'TL' },
  { id: '308', name: 'Huyện Vũ Thư', provinceId: '25', code: 'VT' },
  { id: '309', name: 'Huyện Thủy Nguyên', provinceId: '25', code: 'TN' },
  { id: '310', name: 'Huyện Cát Hải', provinceId: '25', code: 'CH' },
  { id: '311', name: 'Huyện Bạch Long Vĩ', provinceId: '25', code: 'BLV' },

  // Đà Nẵng
  { id: '401', name: 'Quận Hải Châu', provinceId: '56', code: 'HC' },
  { id: '402', name: 'Quận Thanh Khe', provinceId: '56', code: 'TK' },
  { id: '403', name: 'Quận Sơn Trà', provinceId: '56', code: 'ST' },
  { id: '404', name: 'Quận Ngũ Hành Sơn', provinceId: '56', code: 'NHS' },
  { id: '405', name: 'Quận Liên Chiểu', provinceId: '56', code: 'LC' },
  { id: '406', name: 'Huyện Hòa Vang', provinceId: '56', code: 'HV' },
  { id: '407', name: 'Huyện Hoàng Sa', provinceId: '56', code: 'HS' },
];

/**
 * Lấy danh sách quận/huyện theo mã tỉnh
 */
export const getDistrictsByProvince = (provinceId: string): District[] => {
  return VIETNAM_DISTRICTS.filter(district => district.provinceId === provinceId);
};

/**
 * Lấy tên tỉnh theo ID
 */
export const getProvinceName = (provinceId: string): string => {
  const province = VIETNAM_PROVINCES.find(p => p.id === provinceId);
  return province?.name || '';
};

/**
 * Lấy tên quận/huyện theo ID
 */
export const getDistrictName = (districtId: string): string => {
  const district = VIETNAM_DISTRICTS.find(d => d.id === districtId);
  return district?.name || '';
};
