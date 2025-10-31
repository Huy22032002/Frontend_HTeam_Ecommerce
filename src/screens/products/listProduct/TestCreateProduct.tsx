import React, { useState } from "react";
import { Box, Button, Typography, Grid } from "@mui/material";
import axios from "axios";

interface Availability {
  regularPrice: number;
  salePrice: number;
  quantity: number;
}

interface Option {
  sku: string;
  code: string;
  value: string;
  image?: File | null;
  availability: Availability;
}

interface Variant {
  name: string;
  code: string;
  options: Option[];
}

interface ProductForm {
  productName: string;
  categoryIds: number[];
  manufacturerId: number;
  taxClassId: number;
  variants: Variant[];
}

const TestProductForm = () => {
  const [form, setForm] = useState<ProductForm>({
    productName: "Laptop ASUS ROG Strix G1",
    categoryIds: [1],
    manufacturerId: 3,
    taxClassId: 1,
    variants: [
      {
        name: "ASUS ROG Strix G1 16GB RAM",
        code: "asus-g1-16gb",
        options: [
          {
            sku: "G1_2025_BLACK_16GB",
            code: "color",
            value: "Đen",
            image: null,
            availability: {
              regularPrice: 29000000,
              salePrice: 28000000,
              quantity: 50,
            },
          },
          {
            sku: "G1_2025_RED_16GB",
            code: "color",
            value: "Đỏ",
            image: null,
            availability: {
              regularPrice: 30000000,
              salePrice: 29000000,
              quantity: 45,
            },
          },
        ],
      },
    ],
  });

  const handleImageChange = (
    variantIdx: number,
    optionIdx: number,
    file: File | null
  ) => {
    const newForm = { ...form };
    newForm.variants[variantIdx].options[optionIdx].image = file;
    setForm(newForm);
  };

  const handleSubmit = async () => {
    try {
      // Tạo object JSON thuần
      const payload = {
        productName: form.productName,
        categoryIds: form.categoryIds,
        manufacturerId: form.manufacturerId,
        taxClassId: form.taxClassId,
        variants: form.variants.map((v) => ({
          name: v.name,
          code: v.code,
          options: v.options.map((o) => ({
            sku: o.sku,
            code: o.code,
            value: o.value,
            availability: o.availability,
          })),
        })),
      };

      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      // Thêm hình theo dạng list
      form.variants.forEach((variant) =>
        variant.options.forEach((option) => {
          if (option.image) formData.append("images", option.image);
        })
      );

      console.log([...formData.entries()]);

      // Gửi request
      const res = await axios.post(
        "http://localhost:8080/api/admins/products/full-create",
        formData,
        {
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbjEiLCJyb2xlIjpbeyJhdXRob3JpdHkiOiJST0xFX1NVUEVSQURNSU4ifSx7ImF1dGhvcml0eSI6IlJPTEVfQURNSU4ifV0sImlhdCI6MTc2MTg4ODM5MCwiZXhwIjoyMzY2Njg4MzkwfQ.Xw4d9QzBfE_oh5O8OMp3XBaM5yDGqsAzDIf58RsnVro`,
          },
        }
      );

      console.log("Response:", res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>
        Test Create Product
      </Typography>

      {form.variants.map((variant, vi) => (
        <Box key={variant.code} mb={3} border={1} p={2}>
          <Typography variant="h6">{variant.name}</Typography>

          {variant.options.map((option, oi) => (
            <Grid
              container
              spacing={2}
              key={option.sku}
              alignItems="center"
              mb={1}
            >
              <Grid item xs={3}>
                <Typography>{option.value}</Typography>
              </Grid>
              <Grid item xs={6}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(
                      vi,
                      oi,
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                />
              </Grid>
              <Grid item xs={3}>
                {option.image && <Typography>{option.image.name}</Typography>}
              </Grid>
            </Grid>
          ))}
        </Box>
      ))}

      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};

export default TestProductForm;
