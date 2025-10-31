import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Box } from '@mui/material';

const partners = [
  { id: 'PT-01', name: 'Công ty A', segment: 'B2B', status: 'ACTIVE' },
  { id: 'PT-02', name: 'Cửa hàng B', segment: 'Retail', status: 'INACTIVE' },
];

const PartnerListScreen = () => (
  <Box>
    <Typography variant="h4" fontWeight={600} mb={2}>Đối tác / Khách hàng</Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Mã</TableCell>
          <TableCell>Tên</TableCell>
          <TableCell>Phân khúc</TableCell>
          <TableCell>Trạng thái</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {partners.map(p => (
          <TableRow key={p.id} hover>
            <TableCell>{p.id}</TableCell>
            <TableCell>{p.name}</TableCell>
            <TableCell>{p.segment}</TableCell>
            <TableCell><Chip size="small" color={p.status === 'ACTIVE' ? 'success' : 'default'} label={p.status} /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </Box>
);

export default PartnerListScreen;
