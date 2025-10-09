import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box } from '@mui/material';
import { CmsSidebar } from './CmsSidebar';
import { CmsTopbar } from './CmsTopbar';

interface CmsLayoutProps {
  children: ReactNode;
}

export const CmsLayout = ({ children }: CmsLayoutProps) => {
  const [open, setOpen] = useState(true);
  const sidebarWidth = 250;

  return (
    <Box display="flex" height="100%" width="100%" bgcolor={(theme) => theme.palette.background.default}>
      {open && <CmsSidebar width={sidebarWidth} />}
      <Box flex={1} display="flex" flexDirection="column" minWidth={0}>
        <CmsTopbar onToggleSidebar={() => setOpen(o => !o)} />
        <Box flex={1} p={3} overflow="auto" bgcolor={(theme) => theme.palette.grey[100]}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};
