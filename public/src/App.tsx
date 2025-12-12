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

//screens
import LoginScreen from "./screens/login/LoginScreen";
import SignupScreen from "./screens/signup/SignupScreen";
import HomeScreen from "./screens/home/HomeScreen";
import ProductsByCategory from "./screens/products/listProduct/ProductsByCategory";
import Footer from "./components/Footer";
import ProductVariantDetail from "./screens/products/productDetail/ProductVariantDetail";
import CartScreen from "./screens/cart/Cartscreen";
import CheckoutScreen from "./screens/order/CheckoutScreen";
import SearchScreen from "./screens/search/SearchScreen";
import OtpScreen from "./screens/signup/OtpScreen";
import SetPasswordScreen from "./screens/signup/setPassword/SetPasswordScreen";
import PromotionProductsScreen from "./screens/promotions/PromotionProductsScreen";
import CustomerLayout from "./screens/customerLayout/CustomerLayout";
import ListAddress from "./screens/customerLayout/listAddress/ListAddress";
import CustomerInfo from "./screens/customerLayout/customerInfo/CustomerInfo";
import OrderHistoryScreen from "./screens/customerLayout/orderHistory/OrderHistoryScreen";
import CustomerReviewScreen from "./screens/customerLayout/review/CustomerReviewScreen";
import VoucherScreen from "./screens/customerLayout/voucher/VoucherScreen";
import FlashSaleScreen from "./screens/flashsale/FlashSaleScreen";
import ChatbotWidget from "./components/chatbot/ChatBotWidget";
import ChatWidget from "./components/chat/ChatWidget";
import GlobalNotification from "./components/GlobalNotification";

function AppContent() {
  const location = useLocation();
  const hideLayout =
    location.pathname === "/login" ||
    location.pathname === "/signup" ||
    location.pathname === "/otp" ||
    location.pathname === "/signup/set-password" ||
    location.pathname === "/forget-password";

  return (
    <div className="app">
      <main className="content">
        {!hideLayout && <Topbar />}
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/signup/set-password" element={<SetPasswordScreen />} />
          <Route path="/otp" element={<OtpScreen />} />
          <Route path="/" element={<HomeScreen />} />
          {/* CUSTOMER LAYOUT */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route path="account-info" element={<CustomerInfo />} />
            <Route path="orders-history" element={<OrderHistoryScreen />} />
            <Route path="addresses" element={<ListAddress />} />
            <Route path="reviews" element={<CustomerReviewScreen />} />
            <Route path="vouchers" element={<VoucherScreen />} />
          </Route>

          <Route path="/search" element={<SearchScreen />} />
          <Route path="/flash-sale" element={<FlashSaleScreen />} />
          <Route path="/all-products" element={<SearchScreen />} />
          <Route
            path="/product-category/:categoryId"
            element={<ProductsByCategory />}
          />
          <Route path="/checkout" element={<CheckoutScreen />} />
          <Route
            path="/product/:variantId"
            element={<ProductVariantDetail />}
          />
          <Route path="/cart" element={<CartScreen />} />
          <Route
            path="/promotions/:promotionId/products"
            element={<PromotionProductsScreen />}
          />
        </Routes>
        {!hideLayout && <Footer />}

        {!hideLayout && <ChatbotWidget />}
        {!hideLayout && <ChatWidget />}
        <GlobalNotification />
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
