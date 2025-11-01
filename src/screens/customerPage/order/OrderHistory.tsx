// AccountOrders.tsx
import {
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

const dummyOrders = [
  { id: 1, date: "2025-11-01", total: "1,200,000₫", status: "Đã giao" },
  { id: 2, date: "2025-10-25", total: "850,000₫", status: "Đang xử lý" },
];

export default function CustomerOrders() {
  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Lịch sử đơn hàng
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Mã đơn</TableCell>
            <TableCell>Ngày</TableCell>
            <TableCell>Tổng</TableCell>
            <TableCell>Trạng thái</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {dummyOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.date}</TableCell>
              <TableCell>{order.total}</TableCell>
              <TableCell>{order.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
