import { Card, CardHeader, CardContent, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import type { Order } from "../../models/dashboard/Order";

export const OrdersTable = ({ orders }: { orders: Order[] }) => {
  return (
    <Card variant="outlined">
      <CardHeader title="Recent Orders" sx={{ pb: 0 }} />
      <CardContent>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(o => (
              <TableRow key={o.id} hover>
                <TableCell>{o.id}</TableCell>
                <TableCell>{o.customerName}</TableCell>
                <TableCell align="right">${'{'}o.total.toFixed(2){'}'}</TableCell>
                <TableCell>{o.status}</TableCell>
                <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
