import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, TextArea } from '../../components/ui/Form';
import { Loading, Error as ErrorState } from '../../components/ui/States';
import customOrderService from '../../services/customOrderService';

export const CustomProductManage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImage, setExistingImage] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    specifications: '',
    isActive: true,
  });

  // Load product if editing
  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        try {
          const product = await customOrderService.getCustomProductById(id);
          setFormData({
            name: product.name,
            description: product.description,
            category: product.category || '',
            specifications: product.specifications || '',
            isActive: product.isActive ?? true,
          });
          setExistingImage(product.image || '');
        } catch (err) {
          setError('Failed to load product');
        } finally {
          setIsLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeNewImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const removeExistingImage = () => {
    setExistingImage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      return;
    }

    if (!existingImage && !imagePreview) {
      setError('Product image is required');
      return;
    }

    setIsSaving(true);
    try {
      const submitData = {
        ...formData,
        imageFile: imageFile,
      };

      if (isEditMode && id) {
        await customOrderService.updateCustomProduct(id, submitData);
        setSuccessMessage('Product updated successfully!');
        setTimeout(() => navigate('/custom-products'), 1500);
      } else {
        await customOrderService.addCustomProduct(submitData);
        setSuccessMessage('Product created successfully!');
        setTimeout(() => navigate('/custom-products'), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'Edit Custom Product' : 'Add New Custom Product'}
          </h1>
          <Button variant="outline" onClick={() => navigate('/custom-products')}>
            ← Back to Products
          </Button>
        </div>

        {error && <ErrorState message={error} />}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Information */}
          <Card>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Product Information</h3>
                <p className="text-sm text-gray-600">Core product details</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Product Title *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product title..."
                  required
                />

                <Input
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Auto-generated or custom"
                />
              </div>

              <TextArea
                label="Description *"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                placeholder="Enter detailed product descriptions, features, and specifications..."
                required
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                />
                <label className="text-gray-700 font-medium">Mark as Active Product ⭐</label>
              </div>
            </div>
          </Card>

          {/* Product Images */}
          <Card>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Product Images</h3>
                <p className="text-sm text-gray-600">Upload up to 10 images (JPEG, PNG, GIF, WebP - Max 5MB each)</p>
              </div>

              {/* Existing Images */}
              {existingImage && !imagePreview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Current Images (1)</p>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="relative group">
                      <img
                        src={`${existingImage}`}
                        alt="Current"
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeExistingImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center text-gray-600">
                    <svg className="w-16 h-16 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-base font-medium mb-1">Click to upload or drag and drop</p>
                    <p className="text-sm">PNG, JPG, GIF, WebP up to 5MB each</p>
                  </div>
                </label>
              </div>

              {/* New Image Previews */}
              {imagePreview && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">New Images (1)</p>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="relative group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border-2 border-blue-500"
                      />
                      <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        New
                      </span>
                      <button
                        type="button"
                        onClick={removeNewImage}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-md"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Specifications */}
          <Card>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Specifications</h3>
                <p className="text-sm text-gray-600">Add product attributes and technical details</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technical Details
                </label>
                <textarea
                  value={formData.specifications}
                  onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                  rows={6}
                  placeholder="e.g., Size, Color, Material&#10;&#10;Enter each specification on a new line or use bullet points"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/custom-products')}
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
