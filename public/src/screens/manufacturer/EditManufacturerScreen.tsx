import React, { useEffect, useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ManufacturerAdminApi } from "../../api/manufacturer/manufacturerAdminApi";
import { CloudApi } from "../../api/CloudApi";

const EditManufacturerScreen: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<number | undefined>(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const data = await ManufacturerAdminApi.getById(Number(id));
      if (data) {
        setCode(data.code || "");
        setName(data.name || "");
        setSortOrder(data.sortOrder ?? 0);
        setExistingImageUrl(data.imageUrl || null);
        setPreview(data.imageUrl || null);
      }
    };
    load();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !name.trim()) {
      alert("Vui lòng nhập mã và tên thương hiệu");
      return;
    }

    let imageUrl = existingImageUrl || undefined;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "manufacturers");
      const urls = await CloudApi.uploadImages(formData);
      if (urls && urls.length > 0) imageUrl = urls[0];
    }

    const payload = {
      code: code.trim(),
      name: name.trim(),
      imageUrl,
      sortOrder: sortOrder || 0,
    };

    if (!id) return;
    const updated = await ManufacturerAdminApi.update(Number(id), payload);
    if (updated) {
      alert("Cập nhật thương hiệu thành công");
      navigate("../manufacturers");
    } else {
      alert("Cập nhật thất bại");
    }
  };

  return (
    <Box p={2} maxWidth={600}>
      <Typography variant="h5" mb={2}>
        Chỉnh sửa thương hiệu
      </Typography>

      <TextField
        label="Mã"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        margin="normal"
      />

      <TextField
        label="Sắp xếp"
        type="number"
        value={sortOrder}
        onChange={(e) => setSortOrder(Number(e.target.value))}
        fullWidth
        margin="normal"
      />

      <Box mt={2} mb={2}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <Box mt={1}>
            <img src={preview} alt="preview" style={{ maxWidth: 200 }} />
          </Box>
        )}
      </Box>

      <Box display="flex" gap={2}>
        <Button variant="contained" onClick={handleSubmit}>
          Lưu
        </Button>
        <Button variant="outlined" onClick={() => navigate("../manufacturers")}>
          Hủy
        </Button>
      </Box>
    </Box>
  );
};

export default EditManufacturerScreen;
