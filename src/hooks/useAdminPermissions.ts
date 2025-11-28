import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

/**
 * Hook để kiểm tra quyền admin
 * Trả về các flag quyền cho phép/cấm actions khác nhau
 */
export const useAdminPermissions = () => {
  const userState = useSelector((state: RootState) => state.userAuth);
  
  // Role có thể là array of objects {id, name} hoặc array of strings
  let userRoles: string[] = [];
  
  if (Array.isArray(userState?.user?.role)) {
    userRoles = userState.user.role.map((r: any) => {
      // Nếu là object, lấy name property
      if (typeof r === 'object' && r && r.name) {
        return String(r.name).toUpperCase();
      }
      // Nếu là string
      if (typeof r === 'string') {
        return r.toUpperCase();
      }
      return '';
    }).filter((r: string) => r !== '');
  }

  // Check if user is SUPER_ADMIN (role array contains SUPERADMIN)
  const isSuperAdmin = userRoles.includes('SUPERADMIN');

  // Check if user is ADMIN (has ADMIN but not SUPERADMIN)
  const isAdmin = !isSuperAdmin && userRoles.includes('ADMIN');

  return {
    isSuperAdmin,
    isAdmin,
    userRoles,
    // Permissions for different actions
    canCreate: isSuperAdmin, // Only SUPER_ADMIN can create
    canEdit: isSuperAdmin,   // Only SUPER_ADMIN can edit
    canDelete: isSuperAdmin, // Only SUPER_ADMIN can delete
    canChangeStatus: isSuperAdmin, // Only SUPER_ADMIN can change status
    canView: true, // Everyone can view
  };
};

export default useAdminPermissions;
