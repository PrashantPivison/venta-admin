import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Form';
import { Loading, EmptyState, Error } from '../../components/ui/States';
import { Product } from '../../types/admin.types';
import productService from '../../services/productService';

export const ProductsListing: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Load products
  useEffect(() => {
    const loadData = async () => {
      try {
        const prods = await productService.getProducts();
        setProducts(prods);
        setFilteredProducts(prods);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter products
  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(result);
  }, [searchTerm, products]);

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await productService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  if (isLoading) return <Loading text="Loading products..." />;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <Button 
            variant="primary" 
            onClick={() => navigate('/products/manage')}
          >
            <svg
              className="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Product
          </Button>
        </div>

        {error && <Error message={error} />}

        {/* Search Filter */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search by Title or SKU"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Products Table */}
        <Card title={`Products (${filteredProducts.length})`}>
          {filteredProducts.length === 0 ? (
            <EmptyState 
              message={searchTerm ? "No products match your search" : "No products yet. Create your first product!"}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SKU</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Stock</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-800">{product.title}</p>
                        {product.featured && (
                          <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded mt-1">
                            ⭐ Featured
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm font-mono">{product.sku || '-'}</td>
                      <td className="py-3 px-4 text-right text-gray-800 font-semibold">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          product.stock > 10 
                            ? 'bg-green-100 text-green-700' 
                            : product.stock > 0 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/products/${product._id}/details`)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-md transition-colors"
                            title="View Details"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => navigate(`/products/manage/${product._id}`)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Product"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Product"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};
