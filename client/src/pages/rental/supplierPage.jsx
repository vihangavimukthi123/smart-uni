//supplierPage.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import SupplierAddProductPage from "./supplier/supplierAddProductPage";
import SupplierProductsPage from "./supplier/supplierProductsPage";
import SupplierUpdateProductPage from "./supplier/supplierUpdateProduct";
import SupplierOrdersPage from "./supplier/supplierOrdersPage";
import SupplierReviewsPage from "./supplier/supplierReviewsPage";
import WorkspaceLayout from "../../components/layout/Layout"; // Not needed if already in Layout route


export default function SupplierPage() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%"
      }}
    >
      <Routes>
        <Route index element={<SupplierProductsPage />} />
        <Route path="add-product" element={<SupplierAddProductPage />} />
        <Route path="update-product" element={<SupplierUpdateProductPage />} />
        <Route path="orders" element={<SupplierOrdersPage />} />
        <Route path="reviews" element={<SupplierReviewsPage />} />
        <Route path="users" element={<h1>Profile Settings</h1>} />
      </Routes>
    </div>
  );
}

