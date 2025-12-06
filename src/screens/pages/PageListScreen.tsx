import { Typography, List, ListItem, ListItemText, Chip, Button, Box } from '@mui/material';

const pages = [
  { id: 'PG-01', title: 'Giới thiệu', status: 'PUBLISHED', updatedAt: '2025-09-30' },
  { id: 'PG-02', title: 'Chính sách bảo hành', status: 'DRAFT', updatedAt: '2025-10-02' },
];

const PageListScreen = () => (
  <Box>
    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
      <Typography variant="h4" fontWeight={600}>Trang website</Typography>
      <Button variant="contained" size="small">+ Thêm</Button>
    </Box>
    <List>
      {pages.map(p => (
        <ListItem key={p.id} divider secondaryAction={<Chip size="small" label={p.status} color={p.status === 'PUBLISHED' ? 'success' : 'default'} />}> 
          <ListItemText primary={p.title} secondary={`Cập nhật: ${p.updatedAt}`} />
        </ListItem>
      ))}
    </List>
  </Box>
);

export default PageListScreen;
