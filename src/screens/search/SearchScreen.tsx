import {
  Box,
  Typography,
  useTheme,
  Container,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  Pagination,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { tokens } from "../../theme/theme";
import SearchIcon from "@mui/icons-material/Search";
import ProductVariantList from "../../components/product/ProductVariantsList";
import FilterSideBar from "../../components/product/FilterSideBar";
import type { ProductVariants } from "../../models/products/ProductVariant";
import { VariantsApi } from "../../api/product/VariantApi";

const SearchScreen = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryTerm = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(queryTerm);
  const [searchResults, setSearchResults] = useState<ProductVariants[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const resultsPerPage = 12;
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    available?: boolean;
    hasSalePrice?: boolean;
    manufacturers?: string[];
    categories?: string[];
  }>({});

  // Fetch search results
  const performSearch = async (term: string, page: number = 0, filterOptions?: typeof filters) => {
    setIsSearching(true);
    try {
      const currentFilters = filterOptions || filters;
      
      // Luôn sử dụng API filter (dù search term rỗng)
      // Khi không có search term, API sẽ trả về tất cả sản phẩm
      const response = await VariantsApi.searchWithFilters({
        name: term || "",
        minPrice: currentFilters.minPrice,
        maxPrice: currentFilters.maxPrice,
        available: currentFilters.available,
        hasSalePrice: currentFilters.hasSalePrice,
        manufacturers: currentFilters.manufacturers,
        categories: currentFilters.categories,
        page,
        size: resultsPerPage,
      });
      setSearchResults(response?.content || []);
      setTotalResults(response?.totalItems || 0);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    performSearch(searchTerm, 0, newFilters);
  };

  // Load results when component mounts or query changes
  useEffect(() => {
    setCurrentPage(1);
    performSearch(queryTerm || "", 0);
  }, [queryTerm]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1);
    if (value.trim()) {
      performSearch(value, 0);
    } else {
      setSearchResults([]);
      setTotalResults(0);
    }
  };

  // Handle pagination
  const handlePageChange = (_event: any, page: number) => {
    setCurrentPage(page);
    performSearch(searchTerm, page - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalPages = Math.ceil(totalResults / resultsPerPage);

  return (
    <Box sx={{ bgcolor: colors.greenAccent[700], minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Results Section with Sidebar Separate */}
        <Box sx={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 4 }}>
          {/* Sidebar Filter - Left Column */}
          <Box>
            <Box
              sx={{
                p: 2,
                bgcolor: colors.primary[400],
                borderRadius: 2,
                mb: 2,
              }}
            >
              <TextField
                fullWidth
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={handleSearchChange}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: colors.grey[100] }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "white",
                    borderRadius: 1,
                    fontSize: 14,
                  },
                }}
              />
            </Box>
            <FilterSideBar onFilterChange={handleFilterChange} hideCategories={false} />
          </Box>

          {/* Main Content - Right Column */}
          <Box>
            <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <CardContent sx={{ p: 4, overflow: "hidden" }}>
                {searchTerm.trim() && (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                      Kết quả tìm kiếm cho "{searchTerm}"
                    </Typography>
                    {isSearching && <CircularProgress size={24} />}
                  </Box>
                )}

                {isSearching ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : searchResults.length > 0 ? (
                  <>
                    {!searchTerm.trim() && (
                      <Typography variant="h4" fontWeight="bold" mb={3}>
                        Tất cả sản phẩm
                      </Typography>
                    )}
                    <Typography variant="body2" color="textSecondary" mb={3}>
                      Tìm thấy {totalResults} sản phẩm
                    </Typography>
                    <ProductVariantList data={searchResults as ProductVariants[]} />

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                        <Pagination
                          count={totalPages}
                          page={currentPage}
                          onChange={handlePageChange}
                          color="primary"
                          size="large"
                        />
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    {searchTerm.trim() ? (
                      <>
                        <Typography variant="body1" color="textSecondary">
                          Không tìm thấy sản phẩm nào phù hợp với "{searchTerm}"
                        </Typography>
                        <Button
                          onClick={() => navigate("/")}
                          variant="outlined"
                          sx={{ mt: 2 }}
                        >
                          Quay lại trang chủ
                        </Button>
                      </>
                    ) : (
                      <Typography variant="body1" color="textSecondary">
                        Không có sản phẩm nào
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchScreen;
