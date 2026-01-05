import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading, Error as ErrorState } from '../../components/ui/States';
import customOrderService from '../../services/customOrderService';

interface CustomProduct {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  specifications: string;
  isActive: boolean;
  createdAt: string;
   inquiryCount: number;
}

export const CustomProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const productsData = await customOrderService.getCustomProducts();
      console.log('Fetched custom products:', productsData);
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await customOrderService.deleteCustomProduct(id);
      loadData();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  if (isLoading) return <Loading />;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Custom Products</h1>
          <Button onClick={() => navigate('/custom-products/new')}>
            + Add Custom Product
          </Button>
        </div>

        {error && <ErrorState message={error} />}

        {/* Stats Card */}
        <Card>
          <div className="p-6 text-center">
            <p className="text-gray-600 text-sm mb-1">Total Custom Products</p>
            <p className="text-3xl font-bold text-blue-600">{products.length}</p>
          </div>
        </Card>

        {/* Products Table */}
        <Card>
          <div className="overflow-x-auto">
       <table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Product
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Category
      </th>
      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Inquiries
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Status
      </th>
      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Created
      </th>
      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
        Actions
      </th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {products.length === 0 ? (
      <tr>
        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
          No custom products yet. Click "Add Custom Product" to create one.
        </td>
      </tr>
    ) : (
      products.map((product) => (
        <tr key={product._id} className="hover:bg-gray-50 transition">
          <td className="px-6 py-4">
            <div className="flex items-center gap-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg border"
              />
              <div>
                <p className="font-semibold text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
          <td className="px-6 py-4">
            <div className="flex justify-center">
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                product.inquiryCount > 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {product.inquiryCount}
              </span>
            </div>
          </td>
          <td className="px-6 py-4">
            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
              product.isActive 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {product.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 text-sm text-gray-600">
            {new Date(product.createdAt).toLocaleDateString('en-IN')}
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/custom-products/view/${product._id}`)}
              >
                👁️ View
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate(`/custom-products/edit/${product._id}`)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(product._id)}
              >
                Delete
              </Button>
            </div>
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>

          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};
