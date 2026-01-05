import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { ProductsListing } from './pages/admin/ProductsListing';
import { ProductManage } from './pages/admin/ProductManage';
import { ProductDetails } from './pages/admin/ProductDetails';
import { CustomOrders } from './pages/admin/CustomOrders';
import { CustomProducts } from './pages/admin/CustomProducts';
import { CustomProductManage } from './pages/admin/CustomProductManage';
import { CustomProductDetails } from './pages/admin/CustomProductDetails';
import { Contacts } from './pages/admin/Contacts';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductsListing />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/manage"
          element={
            <ProtectedRoute>
              <ProductManage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/manage/:id"
          element={
            <ProtectedRoute>
              <ProductManage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products/:id/details"
          element={
            <ProtectedRoute>
              <ProductDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <CustomOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contacts"
          element={
            <ProtectedRoute>
              <Contacts />
            </ProtectedRoute>
          }
        />

        <Route path="/custom-products" element={<CustomProducts />} />
<Route path="/custom-products/new" element={<CustomProductManage />} />
<Route path="/custom-products/edit/:id" element={<CustomProductManage />} />
<Route path="/custom-products/view/:id" element={<CustomProductDetails />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />


      </Routes>
    </BrowserRouter>
  );
}
