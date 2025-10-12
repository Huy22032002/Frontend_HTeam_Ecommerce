import { Box, Typography, List, ListItem, ListItemText, Button, CircularProgress } from '@mui/material';
import { CmsLayout } from '../../components/cms/CmsLayout';
import { useCategories } from '../../hooks/useCategories';

const CategoryListScreen = () => {
  const { categories, loading, error } = useCategories();

  return (
    <CmsLayout>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight={600}>Danh mục</Typography>
        <Button variant="contained" size="small">+ Thêm</Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Lỗi: {String(error)}</Typography>
      ) : (
        <List>
          {categories.map(c => (
            <ListItem key={c.id} divider>
              <ListItemText primary={c.name} secondary={`Code: ${c.code}`}/>
            </ListItem>
          ))}
        </List>
      )}
    </CmsLayout>
  );
};

export default CategoryListScreen;
