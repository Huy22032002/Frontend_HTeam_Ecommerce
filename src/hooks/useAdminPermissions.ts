import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

/**
 * Hook để kiểm tra quyền admin
 * Trả về các flag quyền cho phép/cấm actions khác nhau
 */
export const useAdminPermissions = () => {
  const userState = useSelector((state: RootState) => state.userAuth);
  
  const userRole = Array.isArray(userState?.user?.role)
    ? userState.user.role
    : [];

  // Check if user is SUPER_ADMIN
  const isSuperAdmin = userRole.some(r => 
    r.toUpperCase().includes('SUPERADMIN') || 
    r.toUpperCase().includes('SUPER_ADMIN')
  );

  // Check if user is ADMIN (but not SUPER_ADMIN)
  const isAdmin = !isSuperAdmin && userRole.some(r => 
    r.toUpperCase().includes('ADMIN')
  );

  return {
    isSuperAdmin,
    isAdmin,
    userRole,
    // Permissions for different actions
    canCreate: isSuperAdmin, // Only SUPER_ADMIN can create
    canEdit: isSuperAdmin,   // Only SUPER_ADMIN can edit
    canDelete: isSuperAdmin, // Only SUPER_ADMIN can delete
    canChangeStatus: isSuperAdmin, // Only SUPER_ADMIN can change status (khách hàng, đối tác)
    canView: true, // Everyone can view
  };
};

export default useAdminPermissions;
