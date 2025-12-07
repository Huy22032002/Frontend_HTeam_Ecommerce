import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import { CloudApi } from "../../api/CloudApi";
import { ManufacturerAdminApi } from "../../api/manufacturer/manufacturerAdminApi";
import { useNavigate } from "react-router-dom";

const CreateManufacturerScreen: React.FC = () => {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState<number | undefined>(0);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const navigate = useNavigate();

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

    let imageUrl: string | undefined = undefined;
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

    const created = await ManufacturerAdminApi.create(payload);
    if (created) {
      alert("Tạo thương hiệu thành công");
      navigate("../manufacturers");
    } else {
      alert("Tạo thương hiệu thất bại");
    }
  };

  return (
    <Box p={2} maxWidth={600}>
      <Typography variant="h5" mb={2}>
        Tạo thương hiệu
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
          Tạo
        </Button>
        <Button variant="outlined" onClick={() => navigate("../manufacturers")}>
          Hủy
        </Button>
      </Box>
    </Box>
  );
};

export default CreateManufacturerScreen;
