import { useState, useEffect } from "react";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import styles from "./CmsSidebar.module.css";
import { cmsNav } from "./navConfig";
import type { CmsNavItem } from "./navConfig";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  width?: number;
}

const renderItem = (
  item: CmsNavItem,
  openMap: Record<string, boolean>,
  toggle: (k: string) => void,
  currentPath: string
) => {
  const hasChildren = !!item.children?.length;
  const active = item.path && currentPath.startsWith(item.path);
  return (
    <Box key={item.key}>
      <ListItemButton
        onClick={
          hasChildren
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
      {hasChildren && (
        <Collapse in={openMap[item.key]} timeout="auto" unmountOnExit>
          <List disablePadding>
            {item.children!.map((child) => {
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
          renderItem(item, openMap, toggle, location.pathname)
        )}
      </List>
    </Box>
  );
};
