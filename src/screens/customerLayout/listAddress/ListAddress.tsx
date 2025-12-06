import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateIcon from "@mui/icons-material/Update";
import useListAddress from "./ListAddress.hook";
import AddDeliveryForm from "./AddDeliveryForm";
import { useEffect } from "react";
import type { ReadableCustomerDelivery } from "../../../models/customer/ReadablerCustomerDelivery";
import type { CreateCustomerDelivery } from "../../../models/customer/CreateCustomerDelivery";

const ListAddress = () => {
  const {
    listAddress,
    removeAddress,
    openForm,
    setOpenForm,
    addAddress,
    getAllAddress,
    updateAddress,
    editingAddress,
    setEditingAddress,
  } = useListAddress();

  useEffect(() => {
    getAllAddress();
  }, []);

  const handleSubmit = (data: CreateCustomerDelivery) => {
    if (editingAddress) {
      updateAddress(editingAddress.id, data);
      setEditingAddress(null);
    } else {
      addAddress(data);
    }
    setOpenForm(false);
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        Sổ địa chỉ
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 3 }}
        onClick={() => setOpenForm(true)}
      >
        Thêm địa chỉ mới
      </Button>

      {listAddress.map((item: ReadableCustomerDelivery) => (
        <Card key={item.id} sx={{ mb: 2 }}>
          <CardContent
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography fontWeight={600}>{item.recipientName}</Typography>
                {item.isDefault && (
                  <Chip label="Mặc định" color="error" size="small" />
                )}
              </Box>

              <Typography>{item.phone}</Typography>
              <Typography>{item.fullAddress}</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton
                onClick={() => {
                  setEditingAddress(item); // lưu dữ liệu cần edit
                  setOpenForm(true); // mở form
                }}
              >
                <UpdateIcon color="primary" />
              </IconButton>

              <IconButton onClick={() => removeAddress(item.id)}>
                <DeleteIcon color="error" />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      ))}

      <AddDeliveryForm
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        initialData={editingAddress ?? undefined}
      />
    </Box>
  );
};

export default ListAddress;
