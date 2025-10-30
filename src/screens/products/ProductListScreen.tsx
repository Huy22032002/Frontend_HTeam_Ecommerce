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
import { CmsLayout } from "../../components/cms/CmsLayout";
import { useProducts } from "../../hooks/useProducts";
import type { Product } from "../../models/catalogs/Product";
import type { ProductVariants } from "../../models/products/ProductVariant";

const getStatus = (p: Product) => {
  if (p.available === false) return "OUT";
  return "ACTIVE";
};

const ProductListScreen = () => {
  const { products, loading, error } = useProducts();
  // State để theo dõi sản phẩm nào đang mở variants
  const [openRow, setOpenRow] = React.useState<number | null>(null);

  return (
    <CmsLayout>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h4" fontWeight={600}>
          Danh sách sản phẩm
        </Typography>
        <Button variant="contained" size="small">
          + Thêm
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
                  <TableCell>
                    {p.listCategories
                      ?.map((c: { name: string }) => c.name)
                      .join(", ")}
                  </TableCell>
                  <TableCell>{p.productType}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={getStatus(p) === "ACTIVE" ? "success" : "default"}
                      label={getStatus(p) === "OUT" ? "Hết hàng" : "Đang bán"}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={6}
                  >
                    <Collapse
                      in={openRow === p.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <Box margin={1}>
                        <Typography variant="subtitle1" gutterBottom>
                          Biến thể (Variants):
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>SKU</TableCell>
                              <TableCell>Mặc định</TableCell>
                              <TableCell>Options</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(p.variants || []).map((v: ProductVariants) => (
                              <TableRow key={v.id}>
                                <TableCell>{v.name}</TableCell>
                                <TableCell>{v.code}</TableCell>
                                <TableCell>
                                  {v.defaultSelection ? "✔" : ""}
                                </TableCell>
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
    </CmsLayout>
  );
};

export default ProductListScreen;
