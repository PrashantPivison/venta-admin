import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  updatedAt: string;
}

interface Inquiry {
  _id: string;
  productId: string;
  productName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  inquiryFor: string;
  message: string;
  status: string;
  adminNotes: string;
  isRead: boolean;
  createdAt: string;
}

export const CustomProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [product, setProduct] = useState<CustomProduct | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadProductDetails();
    }
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      const [productData, inquiriesData] = await Promise.all([
        customOrderService.getCustomProductById(id!),
        customOrderService.getInquiriesByProduct(id!),
      ]);
      setProduct(productData);
      setInquiries(inquiriesData);
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (inquiryId: string, status: string) => {
    try {
      await customOrderService.updateInquiryStatus(inquiryId, { status });
      loadProductDetails();
      if (selectedInquiry?._id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteInquiry = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    try {
      await customOrderService.deleteInquiry(inquiryId);
      setShowInquiryModal(false);
      setSelectedInquiry(null);
      loadProductDetails();
    } catch (err) {
      alert('Failed to delete inquiry');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message={error} />;
  if (!product) return <ErrorState message="Product not found" />;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-gray-600 mt-1">{product.category}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/custom-products')}>
              ← Back to Products
            </Button>
            <Button onClick={() => navigate(`/custom-products/edit/${product._id}`)}>
              ✏️ Edit Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Image */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Image</h3>
                <img
                  src={`${product.image}`}
                  alt={product.name}
                  className="w-full h-auto rounded-lg border-2 border-gray-200"
                />
              </div>
            </Card>
          </div>

          {/* Right Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Product Information</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className="font-semibold text-gray-800">{product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.isActive ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Description</p>
                  <p className="text-gray-800">{product.description}</p>
                </div>

                {product.specifications && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Specifications</p>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-gray-800 whitespace-pre-wrap">{product.specifications}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(product.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm font-medium text-gray-800">
                      {new Date(product.updatedAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Inquiries Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Customer Inquiries ({inquiries.length})
              </h3>
              <span className="text-sm text-gray-600">
                {inquiries.filter(i => !i.isRead).length} unread
              </span>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">📭 No inquiries yet</p>
                <p className="text-sm mt-2">Customer inquiries will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Customer
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Date
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inquiries.map((inquiry) => (
                      <tr key={inquiry._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {!inquiry.isRead && (
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                            <div>
                              <p className="font-medium text-sm text-gray-800">
                                {inquiry.firstName} {inquiry.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">{inquiry.email}</p>
                          <p className="text-xs text-gray-500">{inquiry.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{inquiry.inquiryFor}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.status)}`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-600">
                            {new Date(inquiry.createdAt).toLocaleDateString('en-IN')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(inquiry.createdAt).toLocaleTimeString('en-IN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInquiry(inquiry);
                              setShowInquiryModal(true);
                            }}
                          >
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Inquiry Detail Modal */}
        {showInquiryModal && selectedInquiry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-xl font-bold">Inquiry Details</h3>
                <button
                  onClick={() => setShowInquiryModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="font-medium">{selectedInquiry.firstName} {selectedInquiry.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{selectedInquiry.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{selectedInquiry.countryCode} {selectedInquiry.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inquiry Type</p>
                    <p className="font-medium">{selectedInquiry.inquiryFor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-medium">{selectedInquiry.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium">
                      {new Date(selectedInquiry.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Message</p>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-gray-800">{selectedInquiry.message}</p>
                  </div>
                </div>

                {selectedInquiry.adminNotes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-gray-800">{selectedInquiry.adminNotes}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">Update Status</p>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleUpdateStatus(selectedInquiry._id, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteInquiry(selectedInquiry._id)}
                    className="flex-1"
                  >
                    Delete Inquiry
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowInquiryModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
