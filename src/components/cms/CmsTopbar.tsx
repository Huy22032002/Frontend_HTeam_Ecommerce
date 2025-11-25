import { Box, IconButton, Avatar, Tooltip, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout as logoutAction } from '../../store/userSlice';
import { UserApi } from '../../api/user/UserApi';

interface CmsTopbarProps {
  onToggleSidebar?: () => void;
}

type NotificationItem = { id: string | number; title: string };
type ActivityItem = { id: string | number; title: string };

export const CmsTopbar = ({ onToggleSidebar }: CmsTopbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorElNotif, setAnchorElNotif] = useState<null | HTMLElement>(null);
  const [anchorElActivity, setAnchorElActivity] = useState<null | HTMLElement>(null);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.user);

  const [notifications] = useState<NotificationItem[]>([
    { id: 1, title: 'Bạn có đơn hàng mới' },
    { id: 2, title: 'Khách hàng vừa đăng ký' },
  ]);
  const [activities] = useState<ActivityItem[]>([
    { id: 1, title: 'Đã cập nhật sản phẩm' },
    { id: 2, title: 'Đã thêm khách hàng mới' },
  ]);

  const handleLogout = () => {
    UserApi.logout();
    dispatch(logoutAction());
    navigate('/admin/login');
    setAnchorEl(null);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setIsChangingPassword(true);
    try {
      await UserApi.resetPassword(oldPassword, newPassword);
      setPasswordError('');
      setOpenPasswordDialog(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // Show success message
      alert('Đổi mật khẩu thành công!');
    } catch (err) {
      setPasswordError('Đổi mật khẩu thất bại. Kiểm tra lại mật khẩu cũ.');
      console.error(err);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getAvatarLabel = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" px={2} height={56} borderBottom={theme => `1px solid ${theme.palette.divider}`} bgcolor="background.paper">
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={onToggleSidebar} size="small"><MenuIcon /></IconButton>
      </Box>
      <Box display="flex" alignItems="center" gap={2}>
        <Button variant="outlined" size="small">THÊM KHÁCH HÀNG</Button>
        <Button 
          variant="outlined" 
          size="small"
          onClick={() => navigate('/admin/orders/create')}
        >
          BÁN HÀNG
        </Button>
        {/* Chat */}
        <Tooltip title="Chat với khách hàng">
          <IconButton
            size="small"
            onClick={() => navigate('/admin/chat')}
          >
            <ChatBubbleOutlineIcon />
          </IconButton>
        </Tooltip>

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
        <Tooltip title={user?.username || 'Tài khoản'}>
          <IconButton
            size="small"
            onClick={e => setAnchorEl(e.currentTarget)}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {getAvatarLabel()}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem disabled>
            👤 {user?.username || 'Người dùng'}
          </MenuItem>
          <MenuItem disabled>
            📧 {user?.emailAddress || ''}
          </MenuItem>
          <MenuItem onClick={() => { /* Xử lý chuyển đến trang hồ sơ */ setAnchorEl(null); }}>
            Hồ sơ
          </MenuItem>
          <MenuItem onClick={() => { setOpenPasswordDialog(true); setAnchorEl(null); }}>
            Đổi mật khẩu
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            Đăng xuất
          </MenuItem>
        </Menu>
      </Box>

      {/* Dialog đổi mật khẩu */}
      <Dialog open={openPasswordDialog} onClose={() => !isChangingPassword && setOpenPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField
            label="Mật khẩu cũ"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            fullWidth
            disabled={isChangingPassword}
          />
          <TextField
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            disabled={isChangingPassword}
          />
          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            disabled={isChangingPassword}
          />
          {passwordError && (
            <Box sx={{ color: 'error.main', fontSize: '0.875rem' }}>
              {passwordError}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} disabled={isChangingPassword}>
            Hủy
          </Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={isChangingPassword}>
            {isChangingPassword ? 'Đang xử lý...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
