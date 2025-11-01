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
import TestProductForm from "./screens/products/listProduct/TestCreateProduct";
import LoginScreen from "./screens/login/LoginScreen";
import SignupScreen from "./screens/signup/SignupScreen";
import HomeScreen from "./screens/home/HomeScreen";
import ProductsByCategory from "./screens/products/listProduct/ProductsByCategory";
import Footer from "./components/Footer";
import ProductVariantDetail from "./screens/products/productDetail/ProductVariantDetail";

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
             <Route
            path="/product-category/:categoryId"
            element={<ProductsByCategory />}
          />
          <Route
            path="/product/:variantId"
            element={<ProductVariantDetail />}
          />
          <Route path="/testCreate" element={<TestProductForm />} />
        
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
