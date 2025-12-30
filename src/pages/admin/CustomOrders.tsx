import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea, Select } from '../../components/ui/Form';
import { Modal } from '../../components/ui/Modal';
import { Loading, EmptyState, Error } from '../../components/ui/States';
import { InquiryManager } from '../../components/InquiryManager';
import { CustomProduct, CustomOrder } from '../../types/admin.types';
import customOrderService from '../../services/customOrderService';

interface CreateCustomProductData {
  title: string;
  description: string;
  category: string;
  image?: string;
}

export const CustomOrders: React.FC = () => {
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<CustomProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CustomProduct | null>(null);
  const [inquiries, setInquiries] = useState<CustomOrder[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateCustomProductData>({
    title: '',
    description: '',
    category: '',
    image: '',
  });

  // Load products and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, cats] = await Promise.all([
          customOrderService.getCustomProducts(),
          customOrderService.getCategories(),
        ]);
        setProducts(prods);
        setFilteredProducts(prods);
        setCategories(cats as string[]);
      } catch (err) {
        setError('Failed to load custom products');
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
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, products]);

  // Product Management
  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      image: '',
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: CustomProduct) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      category: product.category,
      image: product.images?.[0] || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await customOrderService.updateCustomProduct(editingProduct._id, formData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? { ...p, ...formData } : p))
        );
      } else {
        const newProduct = await customOrderService.addCustomProduct(formData);
        setProducts((prev) => [...prev, newProduct]);
      }
      setIsProductModalOpen(false);
      setError('');
    } catch (err) {
      setError('Failed to save custom product');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await customOrderService.deleteCustomProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setError('');
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  // Inquiry Management
  const handleViewInquiries = async (product: CustomProduct) => {
    try {
      setSelectedProduct(product);
      const productInquiries = await customOrderService.getProductInquiries(product._id);
      setInquiries(productInquiries);
      setIsInquiryModalOpen(true);
    } catch (err) {
      setError('Failed to load inquiries');
    }
  };

  if (isLoading) return <Loading text="Loading custom products..." />;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Custom Order Products</h1>
            <p className="text-gray-600 mt-1">Manage custom products and customer inquiries</p>
          </div>
          <Button variant="primary" onClick={handleAddProduct}>
            <svg
              className="w-5 h-5 inline-block mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Custom Product
          </Button>
        </div>

        {error && <Error message={error} />}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{products.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Inquiries</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {products.reduce((sum, p) => sum + (p.inquiryCount || 0), 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {products.reduce((sum, p) => {
                  const pending = p.inquiries?.filter((i) => i.status === 'pending').length || 0;
                  return sum + pending;
                }, 0)}
              </p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {products.reduce((sum, p) => {
                  const completed = p.inquiries?.filter((i) => i.status === 'completed').length || 0;
                  return sum + completed;
                }, 0)}
              </p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Search Products"
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
        </Card>

        {/* Products Table */}
        <Card title={`Custom Products (${filteredProducts.length})`}>
          {filteredProducts.length === 0 ? (
            <EmptyState message="No custom products found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Product Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">Description</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Inquiries</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-800">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">{product.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {product.description}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewInquiries(product)}
                          className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            />
                          </svg>
                          {product.inquiryCount || 0}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="inline-flex items-center justify-center px-3 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                            title="Edit Product"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                handleDeleteProduct(product._id);
                              }
                            }}
                            className="inline-flex items-center justify-center px-3 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                            title="Delete Product"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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

      {/* Add/Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Custom Product' : 'Add Custom Product'}
      >
        <div className="space-y-4">
          <Input
            label="Product Title"
            placeholder="e.g., Cuplock Scaffolding System"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <TextArea
            label="Description"
            placeholder="Describe the custom product..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
          />

          <Input
            label="Category"
            placeholder="e.g., Pipe Clamps, Base Jacks, etc."
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />

          <Input
            label="Image URL (Optional)"
            placeholder="https://example.com/image.jpg"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="primary" onClick={handleSaveProduct} className="flex-1">
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Product
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsProductModalOpen(false)}
              className="flex-1"
            >
              <svg
                className="w-5 h-5 inline-block mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Inquiry Manager Component */}
      <InquiryManager
        isOpen={isInquiryModalOpen}
        selectedProduct={selectedProduct}
        inquiries={inquiries}
        onClose={() => setIsInquiryModalOpen(false)}
        onInquiriesUpdate={setInquiries}
      />
    </AdminLayout>
  );
};
