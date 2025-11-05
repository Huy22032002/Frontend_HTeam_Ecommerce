import React, { useEffect, useState } from "react";
import { Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Avatar, Chip } from "@mui/material";
import { ManufacturerAdminApi } from "../../api/manufacturer/manufacturerAdminApi";
import { Link } from "react-router-dom";
import type { Manufacturer } from "../../models/manufacturer/Manufacturer";

const ManufacturerListScreen: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const load = async () => {
    // prefer admin endpoint so we can see active status
    const data = await ManufacturerAdminApi.getAllForAdmin();
    setManufacturers(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Box p={2}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Danh sách thương hiệu</Typography>
        <Button variant="contained" component={Link} to="create">
          Tạo thương hiệu
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ảnh</TableCell>
            <TableCell>Mã</TableCell>
            <TableCell>Tên</TableCell>
            <TableCell>Trạng thái</TableCell>
            <TableCell>Sắp xếp</TableCell>
            <TableCell>Hành động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {manufacturers.map((m) => (
            <TableRow key={m.id}>
              <TableCell>
                {m.imageUrl ? (
                  <Avatar src={m.imageUrl} alt={m.name} variant="rounded" />
                ) : (
                  <Avatar variant="rounded">{m.name?.[0]}</Avatar>
                )}
              </TableCell>
              <TableCell>{m.code}</TableCell>
              <TableCell>{m.name}</TableCell>
              <TableCell>
                {m.active ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" color="default" size="small" />}
              </TableCell>
              <TableCell>{m.sortOrder}</TableCell>
              <TableCell>
                <Button variant="outlined" size="small" component={Link} to={`${m.id}/edit`} style={{ marginRight: 8 }}>
                  Sửa
                </Button>

                <Button
                  variant="contained"
                  color={m.active ? "error" : "success"}
                  size="small"
                  onClick={async () => {
                    const target = m.active ? 'Inactive' : 'Active';
                    if (!confirm(`Bạn có chắc muốn chuyển trạng thái thương hiệu "${m.name}" sang ${target}?`)) return;
                    const res = await ManufacturerAdminApi.toggleStatus(Number(m.id));
                    if (res) {
                      // reload list
                      await load();
                    } else {
                      alert('Chuyển trạng thái thất bại');
                    }
                  }}
                >
                  Chuyển trạng thái
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default ManufacturerListScreen;
