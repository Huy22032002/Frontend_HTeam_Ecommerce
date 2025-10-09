import { useState } from 'react';
import { Box, Collapse, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import { cmsNav } from './navConfig';
import type { CmsNavItem } from './navConfig';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  width?: number;
}

const renderItem = (item: CmsNavItem, openMap: Record<string, boolean>, toggle: (k: string) => void, currentPath: string) => {
  const hasChildren = !!item.children?.length;
  const active = item.path && currentPath.startsWith(item.path);
  return (
    <Box key={item.key}>
      <ListItemButton
        onClick={() => hasChildren ? toggle(item.key) : undefined}
        {...(item.path ? { component: Link, to: item.path } as any : {})}
        selected={!!active}
        sx={{ pl: 2 }}
      >
        <Typography sx={{ fontSize: 18, width: 28 }}>{item.icon || '•'}</Typography>
        <ListItemText primary={item.label} />
      </ListItemButton>
      {hasChildren && (
        <Collapse in={openMap[item.key]} timeout="auto" unmountOnExit>
          <List disablePadding>
            {item.children!.map(child => (
              <ListItemButton
                key={child.key}
                {...(child.path ? { component: Link, to: child.path } as any : {})}
                selected={child.path ? currentPath.startsWith(child.path) : false}
                sx={{ pl: 6 }}
              >
                <ListItemText primary={child.label} />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

export const CmsSidebar = ({ width = 250 }: SidebarProps) => {
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({ dashboard: true, giaodich: true });
  const location = useLocation();

  const toggle = (k: string) => setOpenMap(m => ({ ...m, [k]: !m[k] }));

  return (
    <Box sx={{ width, flexShrink: 0, borderRight: theme => `1px solid ${theme.palette.divider}`, height: '100%', overflowY: 'auto', bgcolor: 'background.paper' }}>
      <Box px={2} py={1} borderBottom={theme => `1px solid ${theme.palette.divider}`}> 
        <Typography variant="h6" fontWeight={700}>HTeam CMS</Typography>
      </Box>
      <List component="nav" dense>
        {cmsNav.map(item => renderItem(item, openMap, toggle, location.pathname))}
      </List>
    </Box>
  );
};
