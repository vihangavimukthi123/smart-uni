//supplierPage.jsx
import { Route, Routes, useLocation } from "react-router-dom";
import SupplierAddProductPage from "./supplier/supplierAddProductPage";
import SupplierProductsPage from "./supplier/supplierProductsPage";
import SupplierUpdateProductPage from "./supplier/supplierUpdateProduct";
import SupplierOrdersPage from "./supplier/supplierOrdersPage";
import SupplierReviewsPage from "./supplier/supplierReviewsPage";
import SupplierPackagesPage from "./supplier/SupplierPackagesPage";
import SupplierOffersPage from "./supplier/SupplierOffersPage";
import SupplierAddPackagePage from "./supplier/SupplierAddPackagePage";
import SupplierAddOfferPage from "./supplier/SupplierAddOfferPage";
import SupplierEditPackagePage from "./supplier/SupplierEditPackagePage";
import SupplierEditOfferPage from "./supplier/SupplierEditOfferPage";
import SupplierProfilePage from "./supplier/SupplierProfilePage";
import WorkspaceLayout from "../../components/layout/Layout";


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
        <Route path="packages" element={<SupplierPackagesPage />} />
        <Route path="add-package" element={<SupplierAddPackagePage />} />
        <Route path="edit-package/:id" element={<SupplierEditPackagePage />} />
        <Route path="offers" element={<SupplierOffersPage />} />
        <Route path="add-offer" element={<SupplierAddOfferPage />} />
        <Route path="edit-offer/:id" element={<SupplierEditOfferPage />} />
        <Route path="profile" element={<SupplierProfilePage />} />
      </Routes>
    </div>
  );
}

