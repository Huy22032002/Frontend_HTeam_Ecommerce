import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/store";

import { ColorModeContext, useMode } from "./theme/theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

import Topbar from "./components/Topbar";
// Customer-facing profile screens (created below)
import CustomerProfile from "./screens/customers/CustomerProfil";

//screens
import LoginScreen from "./screens/login/LoginScreen";
import SignupScreen from "./screens/signup/SignupScreen";
import HomeScreen from "./screens/home/HomeScreen";
import ProductsByCategory from "./screens/products/listProduct/ProductsByCategory";
import Footer from "./components/Footer";
import ProductVariantDetail from "./screens/products/productDetail/ProductVariantDetail";
import CartScreen from "./screens/cart/Cartscreen";
import CheckoutScreen from "./screens/order/CheckoutScreen";
import OrderHistoryScreen from "./screens/order/OrderHistoryScreen";
import SearchScreen from "./screens/search/SearchScreen";

function AppContent() {
  const location = useLocation();
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/forget-password";

  return (
    <div className="app">
      <main className="content">
        {!hideLayout && <Topbar />}
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/" element={<HomeScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/all-products" element={<SearchScreen />} />
          <Route
            path="/product-category/:categoryId"
            element={<ProductsByCategory />}
          />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route path="/order-history" element={<OrderHistoryScreen />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route path="/profile" element={<CustomerProfile />} />
          <Route
            element={<ProductVariantDetail />}
          />
          <Route path="/cart" element={<CartScreen />} />
        </Routes>
        {!hideLayout && <Footer />}
      </main>
    </div>
  );
}

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppContent />
          </Router>
        </ThemeProvider>
      </Provider>
    </ColorModeContext.Provider>
  );
}

export default App;
