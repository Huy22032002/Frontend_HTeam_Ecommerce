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
  }>({});

  // Fetch search results
  const performSearch = async (term: string, page: number = 0, filterOptions?: typeof filters) => {
    if (!term.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    try {
      const currentFilters = filterOptions || filters;
      
      // Use filter search if filters are applied, otherwise use simple search
      if (currentFilters.minPrice || currentFilters.maxPrice || currentFilters.available) {
        const response = await VariantsApi.searchWithFilters({
          name: term,
          minPrice: currentFilters.minPrice,
          maxPrice: currentFilters.maxPrice,
          available: currentFilters.available,
          page,
          size: resultsPerPage,
        });
        setSearchResults(response || []);
        setTotalResults(response?.length || 0);
      } else {
        const response = await VariantsApi.search(term, page, resultsPerPage);
        setSearchResults(response || []);
        setTotalResults(response?.length || 0);
      }
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
    if (queryTerm) {
      setSearchTerm(queryTerm);
      setCurrentPage(1);
      performSearch(queryTerm, 0);
    }
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
        {/* Search Bar */}
        <Card sx={{ borderRadius: 2, mb: 6, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" fontWeight="bold" mb={3}>
              🔍 Tìm sản phẩm
            </Typography>
            <TextField
              fullWidth
              placeholder="Nhập tên sản phẩm để tìm kiếm..."
              value={searchTerm}
              onChange={handleSearchChange}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SearchIcon sx={{ color: colors.grey[100] }} />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: colors.primary[400],
                  borderRadius: 1,
                  fontSize: 16,
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  opacity: 0.7,
                },
              }}
            />
          </CardContent>
        </Card>

        {/* Results Section */}
        {searchTerm.trim() && (
          <Box sx={{ display: "flex", gap: 3 }}>
            {/* Sidebar Filter */}
            <Box sx={{ width: 250, flexShrink: 0 }}>
              <FilterSideBar onFilterChange={handleFilterChange} />
            </Box>

            {/* Results */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Card sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                <CardContent sx={{ p: 4, overflow: "hidden" }}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                      Kết quả tìm kiếm cho "{searchTerm}"
                    </Typography>
                    {isSearching && <CircularProgress size={24} />}
                  </Box>

                  {isSearching ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : searchResults.length > 0 ? (
                    <>
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
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {/* Empty State */}
        {!searchTerm.trim() && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              Hãy nhập từ khóa để tìm kiếm sản phẩm
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default SearchScreen;
