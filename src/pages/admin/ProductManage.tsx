import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Form';
import { Loading, Error as ErrorState } from '../../components/ui/States';
import productService from '../../services/productService';
import apiClient from '../../services/apiClient';

interface SpecItem {
  key: string;
  value: string;
}

interface LinkItem {
  platform: string;
  url: string;
}

export const ProductManage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    featured: false,
    features: [] as string[],
    specifications: [] as SpecItem[],
    links: {} as Record<string, string>,
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
  });

  const [specs, setSpecs] = useState<SpecItem[]>([{ key: '', value: '' }]);
  const [links, setLinks] = useState<LinkItem[]>([
    { platform: 'amazon', url: '' },
    { platform: 'industrybuy', url: '' },
  ]);

  // Load product if editing
  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          const response = await apiClient.get(`/products/${id}`);
          const product = response.data;

          setFormData({
            title: product.title,
            sku: product.sku || '',
            slug: product.slug || '',
            description: product.description,
            price: product.price,
            stock: product.stock,
            featured: product.featured || false,
            features: product.features || [],
            specifications: product.specifications || [],
            links: product.links || {},
            seoTitle: product.seoTitle || '',
            seoDescription: product.seoDescription || '',
            seoKeywords: product.seoKeywords || '',
          });

          setExistingImages(product.images || (product.image ? [product.image] : []));
          setSpecs(product.specifications?.length ? product.specifications : [{ key: '', value: '' }]);

          const linkArray: LinkItem[] = [
            { platform: 'amazon', url: product.links?.amazon || '' },
            { platform: 'industrybuy', url: product.links?.industrybuy || '' },
          ];
          setLinks(linkArray);
        } catch (err) {
          setError('Failed to load product');
        } finally {
          setIsLoading(false);
        }
      };

      loadProduct();
    }
  }, [id, isEditMode]);

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);

      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updatedSpecs = [...specs];
    updatedSpecs[index][field] = value;
    setSpecs(updatedSpecs);
  };

  const removeSpecification = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, value: string) => {
    const updatedLinks = [...links];
    updatedLinks[index].url = value;
    setLinks(updatedLinks);
  };

  const addLink = () => {
    setLinks([...links, { platform: 'amazon', url: '' }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!formData.title.trim()) {
      setError('Product title is required');
      return;
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    if (existingImages.length === 0 && imagePreviews.length === 0) {
      setError('At least one product image is required');
      return;
    }

    setIsSaving(true);

    try {
      const filteredSpecs = specs.filter(s => s.key.trim() && s.value.trim());
      const filteredLinks = links.reduce((acc: Record<string, string>, link) => {
        if (link.url.trim()) {
          acc[link.platform] = link.url;
        }
        return acc;
      }, {});

      const submitData = {
        ...formData,
        specifications: filteredSpecs,
        links: filteredLinks,
        imageFiles: imageFiles,
        existingImages: existingImages,
      };

      if (isEditMode && id) {
        await productService.updateProduct(id, submitData);
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => navigate('/products'), 1500);
      } else {
        await productService.addProduct(submitData);
        setSuccessMessage('Product created successfully!');
        setTimeout(() => navigate('/products'), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading text="Loading product..." />;

  return (
    <AdminLayout>
      <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <Button 
            variant="secondary" 
            onClick={() => navigate('/products')}
          >
            Back to Products
          </Button>
        </div>

        {error && <ErrorState message={error} />}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information - Title & SKU */}
          <Card className="border-l-4 border-l-blue-500">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Product Information</h3>
              <p className="text-sm text-gray-600 mt-1">Core product details</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Product Title *"
                placeholder="Enter product name"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />

              <Input
                label="SKU"
                placeholder="Auto-generated if empty"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>

            <div className="mt-6">
              <TextArea
                label="Description *"
                placeholder="Enter detailed product description, features, and specifications..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>

            <div className="mt-6">
              <label className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
                <span className="text-gray-700 font-medium">Mark as Featured Product ⭐</span>
              </label>
            </div>
          </Card>

          {/* Pricing & Inventory */}
          <Card className="border-l-4 border-l-green-500">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Pricing & Inventory</h3>
              <p className="text-sm text-gray-600 mt-1">Set price and stock levels</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input
                label="Price (₹) *"
                type="number"
                placeholder="0.00"
                value={formData.price.toString()}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.01"
              />

              <Input
                label="Stock Units *"
                type="number"
                placeholder="0"
                value={formData.stock.toString()}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
                min="0"
              />
            </div>
          </Card>

          {/* Product Images */}
          <Card className="border-l-4 border-l-purple-500">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Product Images</h3>
              <p className="text-sm text-gray-600 mt-1">Upload up to 10 images (JPEG, PNG, GIF, WebP - Max 5MB each)</p>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-3">Current Images ({existingImages.length})</p>
                <div className="grid grid-cols-4 gap-3">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`Existing ${idx}`}
                        className="w-full h-24 object-cover rounded-lg border border-gray-200 hover:shadow-md transition"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-8 text-center hover:border-blue-500 hover:bg-blue-100 transition mb-6">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImagesChange}
                className="hidden"
                id="image-input"
              />
              <label htmlFor="image-input" className="cursor-pointer block">
                <svg
                  className="w-12 h-12 mx-auto text-blue-400 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-blue-600 font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-600 mt-1">PNG, JPG, GIF, WebP up to 5MB each</p>
              </label>
            </div>

            {/* New Image Previews */}
            {imagePreviews.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">New Images ({imagePreviews.length})</p>
                <div className="grid grid-cols-4 gap-3">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={preview}
                        alt={`New ${idx}`}
                        className="w-full h-24 object-cover rounded-lg border-2 border-blue-200 hover:shadow-md transition"
                      />
                      <div className="absolute top-1 right-1 text-xs bg-blue-500 text-white px-2 py-1 rounded font-semibold">
                        New
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Product Specifications */}
          <Card className="border-l-4 border-l-green-500">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Specifications</h3>
              <p className="text-sm text-gray-600 mt-1">Add product attributes and technical details</p>
            </div>

            <div className="space-y-4">
              {specs.map((spec, idx) => (
                <div key={idx} className="grid grid-cols-2 gap-4 items-end">
                  <Input
                    label="Attribute"
                    value={spec.key}
                    onChange={(e) => updateSpecification(idx, 'key', e.target.value)}
                    placeholder="e.g., Size, Color, Material"
                  />
                  <div className="flex gap-2">
                    <Input
                      label="Value"
                      value={spec.value}
                      onChange={(e) => updateSpecification(idx, 'value', e.target.value)}
                      placeholder="e.g., Large, Blue, Stainless Steel"
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(idx)}
                      className="mt-6 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addSpecification}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition font-medium"
              >
                + Add Specification
              </button>
            </div>
          </Card>

          {/* External Buy Links */}
          <Card className="border-l-4 border-l-red-500">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">External Buy Links</h3>
              <p className="text-sm text-gray-600 mt-1">Add links where customers can purchase this product</p>
            </div>

            <div className="space-y-4">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {link.platform.charAt(0).toUpperCase() + link.platform.slice(1)} URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={link.url}
                      onChange={(e) => updateLink(idx, e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLink(idx)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addLink}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition font-medium"
              >
                + Add Link
              </button>
            </div>
          </Card>


          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              type="submit"
              variant="primary"
              disabled={isSaving}
              className="flex-1"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {isSaving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </Button>
            <Button 
              type="button"
              variant="secondary" 
              onClick={() => navigate('/products')}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
