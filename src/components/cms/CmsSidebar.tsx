import { useState, useEffect } from "react";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import styles from "./CmsSidebar.module.css";
import { cmsNav } from "./navConfig";
import type { CmsNavItem } from "./navConfig";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  width?: number;
}

/**
 * Check if user can access this nav item based on requiredRole
 */
const canAccessItem = (item: CmsNavItem, userRole: any[]): boolean => {
  // If no required role specified, everyone can access
  if (!item.requiredRole) return true;
  
  // Convert roles to strings
  const roleStrings = userRole.map((r: any) => {
    if (typeof r === 'object' && r && r.name) {
      return String(r.name).toUpperCase();
    }
    if (typeof r === 'string') {
      return r.toUpperCase();
    }
    return '';
  }).filter((r: string) => r !== '');
  
  // If SUPER_ADMIN is required, check if user is SUPER_ADMIN
  if (item.requiredRole === 'SUPER_ADMIN') {
    return roleStrings.some(r => r === 'SUPERADMIN' || r === 'SUPER_ADMIN');
  }
  
  return true;
};

const renderItem = (
  item: CmsNavItem,
  openMap: Record<string, boolean>,
  toggle: (k: string) => void,
  currentPath: string,
  userRole: string[]
) => {
  // Skip if user doesn't have access
  if (!canAccessItem(item, userRole)) {
    return null;
  }

  const hasChildren = !!item.children?.length;
  const active = item.path && currentPath.startsWith(item.path);
  
  // Filter children based on role
  const accessibleChildren = item.children?.filter(child => canAccessItem(child, userRole)) || [];
  const hasAccessibleChildren = accessibleChildren.length > 0;

  return (
    <Box key={item.key}>
      <ListItemButton
        onClick={
          hasAccessibleChildren
            ? (e) => {
                e.stopPropagation();
                toggle(item.key);
              }
            : undefined
        }
        {...(item.path ? ({ component: Link, to: item.path } as any) : {})}
        selected={!!active}
        className={[
          styles.sidebarNavItem,
          active ? styles.sidebarNavItemActive : "",
        ].join(" ")}
      >
        <span className={styles.sidebarIcon}>{item.icon || "•"}</span>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            fontWeight: active ? 700 : 500,
            fontSize: 16,
          }}
        />
      </ListItemButton>
      {hasAccessibleChildren && (
        <Collapse in={openMap[item.key]} timeout="auto" unmountOnExit>
          <List disablePadding>
            {accessibleChildren.map((child) => {
              const childActive = child.path
                ? currentPath.startsWith(child.path)
                : false;
              return (
                <ListItemButton
                  key={child.key}
                  {...(child.path
                    ? ({ component: Link, to: child.path } as any)
                    : {})}
                  selected={childActive}
                  className={[
                    styles.sidebarNavChild,
                    childActive ? styles.sidebarNavChildActive : "",
                  ].join(" ")}
                >
                  <ListItemText
                    primary={child.label}
                    primaryTypographyProps={{
                      fontWeight: childActive ? 700 : 400,
                      fontSize: 15,
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

export const CmsSidebar = (_props: SidebarProps) => {
  // Get user role from Redux
  const userState = useSelector((state: RootState) => state.userAuth);
  const userRole = Array.isArray(userState?.user?.role)
    ? userState.user.role
    : [];

  // Load persisted openMap from localStorage so navigation doesn't reset opened parents
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem("cmsSidebarOpenMap");
      if (raw) return JSON.parse(raw) as Record<string, boolean>;
    } catch (e) {
      // ignore parse errors
    }
    return { dashboard: true };
  });
  useEffect(() => {
    try {
      localStorage.setItem("cmsSidebarOpenMap", JSON.stringify(openMap));
    } catch (e) {
      // ignore storage errors (e.g., SSR or quota)
    }
  }, [openMap]);
  const location = useLocation();

  const toggle = (k: string) =>
    setOpenMap((m) => ({ ...m, [k]: m[k] ? false : true }));

  return (
    <Box className={styles.sidebarRoot}>
      <Box className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>HEcommerce CMS</span>
      </Box>
      <List component="nav" dense>
        {cmsNav.map((item) =>
          renderItem(item, openMap, toggle, location.pathname, userRole)
        )}
      </List>
    </Box>
  );
};
