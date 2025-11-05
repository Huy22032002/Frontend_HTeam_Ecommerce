import React from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Collapse,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../models/products/Product";
import type { ProductVariants } from "../../models/products/ProductVariant";
import { useNavigate } from "react-router-dom";

const getStatus = (p: Product) => {
  if (p.available === false) return "OUT";
  return "ACTIVE";
};

const ProductListScreen = () => {
  const { products, loading, error } = useProducts();
  // State để theo dõi sản phẩm nào đang mở variants
  const [openRow, setOpenRow] = React.useState<number | null>(null);

  const navigate = useNavigate();

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" fontWeight={600}>
          Danh sách sản phẩm
        </Typography>
        <Button
          onClick={() => navigate("/admin/create-product")}
          variant="contained"
          size="small"
        >
          + Thêm sản phẩm mới
        </Button>
      </Box>
      {loading ? (
        <Typography>Đang tải sản phẩm...</Typography>
      ) : error ? (
        <Typography color="error">Lỗi: {String(error)}</Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((p) => (
              <React.Fragment key={p.id}>
                <TableRow hover>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => setOpenRow(openRow === p.id ? null : p.id)}
                    >
                      <KeyboardArrowDownIcon
                        style={{
                          transform:
                            openRow === p.id ? "rotate(180deg)" : undefined,
                        }}
                      />
                    </IconButton>
                  </TableCell>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.productName}</TableCell>
                  <TableCell>{p.categories?.join(", ") || "N/A"}</TableCell>
                  <TableCell>{p.manufacturerName || "N/A"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={getStatus(p) === "ACTIVE" ? "success" : "default"}
                      label={getStatus(p) === "OUT" ? "Hết hàng" : "Đang bán"}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => navigate(`/admin/products/${p.id}/edit`)}
                      style={{ marginRight: 8 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        if (window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
                          // Call delete API
                          console.log("Delete product:", p.id);
                        }
                      }}
                    >
                      Xóa
                    </Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={7}
                  >
                    <Collapse
                      in={openRow === p.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box margin={1}>
                        <Typography variant="subtitle1" gutterBottom>
                          Biến thể sản phẩm:
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tên biến thể</TableCell>
                              <TableCell>Mã sản phẩm</TableCell>
                              <TableCell>Màu sắc</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(p.variants || []).map((v: ProductVariants) => (
                              <TableRow key={v.id}>
                                <TableCell>{v.name}</TableCell>
                                <TableCell>{v.code}</TableCell>
                                <TableCell>
                                  {(v.options || []).map(
                                    (opt: any, idx: number) => (
                                      <span
                                        key={idx}
                                        style={{ marginRight: 8 }}
                                      >
                                        {opt.name || opt.color || ""} (
                                        {opt.sku || ""})
                                      </span>
                                    )
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};

export default ProductListScreen;
