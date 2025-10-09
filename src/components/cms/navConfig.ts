export interface CmsNavItem {
  key: string;
  label: string;
  icon?: string; // Placeholder: you can swap to MUI Icons later
  children?: CmsNavItem[];
  path?: string; // route path
}

export const cmsNav: CmsNavItem[] = [
  { key: 'dashboard', label: 'Bảng điều khiển', icon: '▦', path: '/dashboard' },
  { key: 'reports', label: 'Thống kê báo cáo', icon: '📊', path: '/reports' },
  { key: 'activity-log', label: 'Lịch sử hoạt động', icon: '📝', path: '/activity-log' },
  { key: 'user-management', label: 'Quản lý người dùng', icon: '👤', path: '/users' },
  { key: 'partners', label: 'Đối tác/Khách hàng', icon: '👥', children: [
      { key: 'partners-list', label: 'Danh sách', path: '/partners' },
    ] },
  { key: 'hanghoa', label: 'Hàng hóa', icon: '💼', children: [
      { key: 'product-list', label: 'Danh sách sản phẩm', path: '/products' },
      { key: 'categories', label: 'Danh mục', path: '/categories' },
    ] },
  { key: 'giaodich', label: 'Giao dịch', icon: '📄', children: [
      { key: 'orders', label: 'Đơn hàng', path: '/orders' },
      { key: 'shipments', label: 'Chuyển hàng', path: '/shipments' },
      { key: 'returns', label: 'Đổi trả hàng', path: '/returns' },
    ] },
  { key: 'khokd', label: 'Kho không kinh doanh', icon: '📦', children: [
      { key: 'warehouse', label: 'Kho', path: '/warehouse' },
    ] },
  { key: 'baohanh', label: 'Bảo hành/Sửa chữa', icon: '🛠', children: [
      { key: 'warranty', label: 'Phiếu bảo hành', path: '/warranty' },
    ] },
  { key: 'promotions', label: 'Khuyến mãi', icon: '🎁', path: '/promotions' },
  { key: 'website', label: 'Website', icon: '🌐', children: [
      { key: 'pages', label: 'Trang', path: '/pages' },
    ] },
];
