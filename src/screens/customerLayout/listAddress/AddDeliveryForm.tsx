import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import { useState, useEffect } from "react";
import type { CreateCustomerDelivery } from "../../../models/customer/CreateCustomerDelivery";
import { CustomerDeliveryApi } from "../../../api/customer/CustomerDeliveryApi";
import type { ReadableCustomerDelivery } from "../../../models/customer/ReadablerCustomerDelivery";

const AddDeliveryForm = ({
  open,
  onClose,
  onSubmit,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerDelivery) => void;
  initialData?: ReadableCustomerDelivery;
}) => {
  const [form, setForm] = useState<CreateCustomerDelivery>({
    recipientName: "",
    phone: "",
    street: "",
    province: "",
    district: "",
    ward: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isFormReady, setIsFormReady] = useState(false);

  // Hàm tách fullAddress thành các field
  const parseFullAddress = (fullAddress: string) => {
    const parts = fullAddress.split(",").map((p) => p.trim());
    const street = parts[0] || "";
    const ward = parts[1]?.replace(/^Xã\s+/i, "") || "";
    const district = parts[2]?.replace(/^Huyện\s+/i, "") || "";
    const province = parts[3]?.replace(/^Tỉnh\s+/i, "") || "";
    return { street, ward, district, province };
  };

  // Load provinces
  useEffect(() => {
    CustomerDeliveryApi.getProvince().then((res) => {
      setProvinces(res.data);
      setIsFormReady(true); // provinces đã load xong
    });
  }, []);

  // Điền dữ liệu khi edit
  useEffect(() => {
    if (!initialData || !open || !isFormReady) return;

    const { street, ward, district, province } = parseFullAddress(
      initialData.fullAddress
    );

    const selectedProvince = provinces.find((p) => p.name === province);
    const provinceDistricts = selectedProvince?.districts || [];
    setDistricts(provinceDistricts);

    const selectedDistrict = provinceDistricts.find((d) => d.name === district);
    const districtWards = selectedDistrict?.wards || [];
    setWards(districtWards);

    setForm({
      recipientName: initialData.recipientName,
      phone: initialData.phone,
      street,
      ward,
      district,
      province,
      isDefault: initialData.isDefault,
    });
  }, [initialData, open, isFormReady, provinces]);

  // Reset form khi đóng
  useEffect(() => {
    if (!open) {
      setForm({
        recipientName: "",
        phone: "",
        street: "",
        province: "",
        district: "",
        ward: "",
        isDefault: false,
      });
      setDistricts([]);
      setWards([]);
      setErrors({});
    }
  }, [open]);

  const handleChange = (key: string, value: string | boolean) => {
    setForm({ ...form, [key]: value });
    setErrors((prev) => ({ ...prev, [key]: "" })); // Xóa lỗi khi người dùng nhập
  };

  const handleProvinceChange = (code: string) => {
    const selected = provinces.find((p) => p.code === code);
    const provinceDistricts = selected?.districts || [];
    setDistricts(provinceDistricts);
    setWards([]);
    setForm((prev) => ({
      ...prev,
      province: selected?.name || "",
      district: "",
      ward: "",
    }));
    setErrors((prev) => ({ ...prev, province: "", district: "", ward: "" }));
  };

  const handleDistrictChange = (code: string) => {
    const selected = districts.find((d) => d.code === code);
    const districtWards = selected?.wards || [];
    setWards(districtWards);
    setForm((prev) => ({
      ...prev,
      district: selected?.name || "",
      ward: "",
    }));
    setErrors((prev) => ({ ...prev, district: "", ward: "" }));
  };

  // Validate tất cả field
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.recipientName.trim())
      newErrors.recipientName = "Họ tên không được để trống";
    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else {
      const vietnamPhoneRegex = /^(0|\+84)(3|5|7|8|9|1[2|6|8|9])[0-9]{7,8}$/;
      if (!vietnamPhoneRegex.test(form.phone)) {
        newErrors.phone = "Số điện thoại không hợp lệ";
      }
    }
    if (!form.province.trim())
      newErrors.province = "Tỉnh/Thành phố không được để trống";
    if (!form.district.trim())
      newErrors.district = "Quận/Huyện không được để trống";
    if (!form.ward.trim()) newErrors.ward = "Phường/Xã không được để trống";
    if (!form.street.trim())
      newErrors.street = "Địa chỉ chi tiết không được để trống";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSubmit(form);
  };

  if (!isFormReady) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Họ tên người nhận"
          value={form.recipientName}
          onChange={(e) => handleChange("recipientName", e.target.value)}
          error={!!errors.recipientName}
          helperText={errors.recipientName}
        />
        <TextField
          label="Số điện thoại"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={!!errors.phone}
          helperText={errors.phone}
        />
        <TextField
          select
          label="Tỉnh/Thành phố"
          value={provinces.find((p) => p.name === form.province)?.code || ""}
          onChange={(e) => handleProvinceChange(e.target.value)}
          error={!!errors.province}
          helperText={errors.province}
        >
          {provinces.map((p) => (
            <MenuItem key={p.code} value={p.code}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Quận/Huyện"
          value={districts.find((d) => d.name === form.district)?.code || ""}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!districts.length}
          error={!!errors.district}
          helperText={errors.district}
        >
          {districts.map((d) => (
            <MenuItem key={d.code} value={d.code}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Phường/Xã"
          value={form.ward}
          onChange={(e) => handleChange("ward", e.target.value)}
          disabled={!wards.length}
          error={!!errors.ward}
          helperText={errors.ward}
        >
          {wards.map((w) => (
            <MenuItem key={w.code} value={w.name}>
              {w.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Địa chỉ chi tiết (Số nhà, tên đường...)"
          value={form.street}
          onChange={(e) => handleChange("street", e.target.value)}
          error={!!errors.street}
          helperText={errors.street}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={form.isDefault}
              onChange={(e) => handleChange("isDefault", e.target.checked)}
            />
          }
          label="Đặt làm mặc định"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddDeliveryForm;
