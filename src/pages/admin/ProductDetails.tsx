import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loading, Error as ErrorState } from '../../components/ui/States';
import { Product } from '../../types/admin.types';
import apiClient from '../../services/apiClient';

interface SpecItem {
  key: string;
  value: string;
}

export const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!id) throw new Error('Product ID not found');
        
        const response = await apiClient.get(`/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (isLoading) return <Loading text="Loading product details..." />;
  if (error) return <AdminLayout><ErrorState message={error} /></AdminLayout>;
  if (!product) return <AdminLayout><ErrorState message="Product not found" /></AdminLayout>;

  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const displayImage = images[selectedImageIndex];
  const specs = (product as any).specifications as SpecItem[] || [];
  const links = (product as any).links as Record<string, string> || {};

  return (
    <AdminLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Product Details</h1>
          <div className="flex gap-2">
            <Button 
              variant="primary"
              onClick={() => navigate(`/products/manage/${id}`)}
            >
              <svg className="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Product
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate('/products')}
            >
              Back to Products
            </Button>
          </div>
        </div>

        {/* 2-Column Layout: Images Left, Info Right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT COLUMN: Image Gallery (3 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-l-4 border-l-purple-500">
              <div className="space-y-4">
                {/* Main Image */}
                {displayImage && (
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-80 flex items-center justify-center">
                    <img 
                      src={displayImage} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!displayImage && (
                  <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}

                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Images ({images.length})</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`flex-shrink-0 h-16 w-16 rounded-lg border-2 overflow-hidden transition-all ${
                              selectedImageIndex === idx 
                                ? 'border-blue-500 ring-2 ring-blue-300' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img 
                              src={img} 
                              alt={`${product.title}-${idx}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Product Info (2 cols) */}
          <div className="lg:col-span-3 space-y-4">
            
            {/* Product Title & Price Card */}
            <Card className="border-l-4 border-l-blue-500">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{product.title}</h2>
                  {product.featured && (
                    <span className="inline-block text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded font-semibold mt-2">
                      ⭐ Featured Product
                    </span>
                  )}
                </div>

                {/* Price & Stock in grid */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Price</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">₹{product.price.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Stock Status</p>
                    <p className={`text-lg font-bold mt-1 ${
                      product.stock > 10 
                        ? 'text-green-600' 
                        : product.stock > 0 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {product.stock > 10 
                        ? '✓ In Stock' 
                        : product.stock > 0 
                        ? '⚠ Low Stock' 
                        : '✗ Out of Stock'}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{product.stock} units available</p>
                  </div>
                </div>

                {/* SKU and Slug */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {product.sku && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">SKU</p>
                      <p className="font-mono text-sm text-gray-800 mt-1">{product.sku}</p>
                    </div>
                  )}
                  {product.slug && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Slug</p>
                      <p className="font-mono text-sm text-gray-800 mt-1">{product.slug}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Description Card */}
            <Card className="border-l-4 border-l-indigo-500">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-2">Description</p>
                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
              </div>
            </Card>

            {/* Specifications Card */}
            {specs.length > 0 && (
              <Card className="border-l-4 border-l-amber-500">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-3">Specifications</p>
                  <div className="space-y-2">
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm font-semibold text-gray-700">{spec.key}</span>
                        <span className="text-sm text-gray-600">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* External Links Card */}
            {Object.keys(links).length > 0 && (
              <Card className="border-l-4 border-l-red-500">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-3">Where to Buy</p>
                  <div className="space-y-2">
                    {Object.entries(links).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition group"
                      >
                        <span className="font-semibold text-blue-600 capitalize">{platform}</span>
                        <svg className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Features Card */}
            {product.features && product.features.length > 0 && (
              <Card className="border-l-4 border-l-cyan-500">
                <div>
                  <p className="text-sm text-gray-600 font-semibold mb-3">Features</p>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-cyan-500 font-bold text-lg mt-0.5">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            )}

            {/* Metadata Card */}
            {(product.createdAt || product.updatedAt) && (
              <Card className="border-l-4 border-l-gray-400">
                <div className="grid grid-cols-2 gap-4">
                  {product.createdAt && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Created</p>
                      <p className="text-gray-800 text-sm mt-1">{new Date(product.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                  {product.updatedAt && (
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Last Updated</p>
                      <p className="text-gray-800 text-sm mt-1">{new Date(product.updatedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

          </div>

        </div>
      </div>
    </AdminLayout>
  );
};
