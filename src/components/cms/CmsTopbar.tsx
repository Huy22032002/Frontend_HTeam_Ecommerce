import { Box, IconButton, Avatar, Tooltip, Button, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

interface CmsTopbarProps {
  onToggleSidebar?: () => void;
}

import React from 'react';

type NotificationItem = { id: string | number; title: string };
type ActivityItem = { id: string | number; title: string };

export const CmsTopbar = ({ onToggleSidebar }: CmsTopbarProps) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = React.useState<null | HTMLElement>(null);
  const [anchorElActivity, setAnchorElActivity] = React.useState<null | HTMLElement>(null);
  const [notifications] = React.useState<NotificationItem[]>([
    { id: 1, title: 'Bạn có đơn hàng mới' },
    { id: 2, title: 'Khách hàng vừa đăng ký' },
  ]);
  const [activities] = React.useState<ActivityItem[]>([
    { id: 1, title: 'Đã cập nhật sản phẩm' },
    { id: 2, title: 'Đã thêm khách hàng mới' },
  ]);

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" px={2} height={56} borderBottom={theme => `1px solid ${theme.palette.divider}`} bgcolor="background.paper">
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={onToggleSidebar} size="small"><MenuIcon /></IconButton>
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Button variant="outlined" size="small">THÊM KHÁCH HÀNG</Button>
        <Button variant="outlined" size="small">BÁN HÀNG</Button>
        {/* Thông báo */}
        <Tooltip title="Thông báo">
          <IconButton
            size="small"
            onClick={e => setAnchorElNotif(e.currentTarget)}
          >
            {/* You can add a notification icon here */}
            <span role="img" aria-label="notification">🔔</span>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorElNotif}
          open={Boolean(anchorElNotif)}
          onClose={() => setAnchorElNotif(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {(Array.isArray(notifications) ? notifications : []).map((notif, idx) => (
            <MenuItem key={notif.id || idx}>{notif.title}</MenuItem>
          ))}
        </Menu>

        {/* Hoạt động */}
        <Tooltip title="Hoạt động">
          <IconButton
            size="small"
            onClick={e => setAnchorElActivity(e.currentTarget)}
          >
            {/* You can add an activity icon here */}
            <span role="img" aria-label="activity">📝</span>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorElActivity}
          open={Boolean(anchorElActivity)}
          onClose={() => setAnchorElActivity(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {(Array.isArray(activities) ? activities : []).map((activity, idx) => (
            <MenuItem key={activity.id || idx}>{activity.title}</MenuItem>
          ))}
        </Menu>

        {/* Tài khoản */}
        <Tooltip title="Tài khoản">
          <IconButton
            size="small"
            onClick={e => setAnchorEl(e.currentTarget)}
          >
            <Avatar sx={{ width: 32, height: 32 }}>U</Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { /* Xử lý chuyển đến trang hồ sơ */ setAnchorEl(null); }}>
            Hồ sơ
          </MenuItem>
          <MenuItem onClick={() => { /* Xử lý đổi mật khẩu */ setAnchorEl(null); }}>
            Đổi mật khẩu
          </MenuItem>
          <MenuItem onClick={() => { /* Xử lý đăng xuất */ setAnchorEl(null); }}>
            Đăng xuất
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};
