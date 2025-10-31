export interface CmsNavItem {
  key: string;
  label: string;
  icon?: string; // Placeholder: you can swap to MUI Icons later
  children?: CmsNavItem[];
  path?: string; // route path
}

export const cmsNav: CmsNavItem[] = [
  { key: 'dashboard', label: 'Bảng điều khiển', icon: '▦', path: '/admin/dashboard' },
  { key: 'reports', label: 'Thống kê báo cáo', icon: '📊', path: '/admin/reports' },
  { key: 'activity-log', label: 'Lịch sử hoạt động', icon: '📝', path: '/admin/activity-log' },
  { key: 'user-management', label: 'Quản lý người dùng', icon: '👤', path: '/admin/users' },
  { key: 'partners', label: 'Đối tác/Khách hàng', icon: '👥', children: [
      { key: 'partners-list', label: 'Danh sách', path: '/admin/partners' },
    ] },
  { key: 'hanghoa', label: 'Hàng hóa', icon: '💼', children: [
      { key: 'product-list', label: 'Danh sách sản phẩm', path: '/admin/products' },
      { key: 'categories', label: 'Danh mục', path: '/admin/categories' },
    ] },
  { key: 'giaodich', label: 'Giao dịch', icon: '📄', children: [
      { key: 'orders', label: 'Đơn hàng', path: '/admin/orders' },
      { key: 'invoices', label: 'Hóa đơn', icon: '🧾', path: '/admin/invoices' },
      { key: 'payments', label: 'Thanh toán', icon: '💳', path: '/admin/payments' },
      { key: 'shipments', label: 'Vận chuyển', path: '/admin/shipments' },
      { key: 'returns', label: 'Đổi trả hàng', path: '/admin/returns' },
    ] },
  { key: 'khokd', label: 'Kho không kinh doanh', icon: '📦', children: [
      { key: 'warehouse', label: 'Kho', path: '/admin/warehouse' },
    ] },
  { key: 'baohanh', label: 'Bảo hành/Sửa chữa', icon: '🛠', children: [
      { key: 'warranty', label: 'Phiếu bảo hành', path: '/admin/warranty' },
    ] },
  { key: 'promotions', label: 'Khuyến mãi', icon: '🎁', path: '/admin/promotions' },
  { key: 'website', label: 'Website', icon: '🌐', children: [
      { key: 'pages', label: 'Trang', path: '/admin/pages' },
    ] },
];
