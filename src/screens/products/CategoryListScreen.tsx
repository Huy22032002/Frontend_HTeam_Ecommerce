import { Box, Typography, List, ListItem, ListItemText, Chip, Button } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';

// Placeholder categories
const categories = [
  { id: 'C1', name: 'Laptop', productCount: 120 },
  { id: 'C2', name: 'Phụ kiện', productCount: 340 },
  { id: 'C3', name: 'Màn hình', productCount: 58 },
];

const CategoryListScreen = () => {
  return (
    <CmsLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight={600}>Danh mục</Typography>
        <Button variant="contained" size="small">+ Thêm</Button>
      </Box>
      <List>
        {categories.map(c => (
          <ListItem key={c.id} divider>
            <ListItemText primary={c.name} />
            <Chip label={`${c.productCount} SP`} size="small" />
          </ListItem>
        ))}
      </List>
    </CmsLayout>
  );
};

export default CategoryListScreen;
