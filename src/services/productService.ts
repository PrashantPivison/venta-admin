import apiClient from './apiClient';

class ProductService {
  /**
   * Get all products (Admin)
   */
  async getProducts(filters?: { search?: string }) {
    try {
      const response = await apiClient.get('/products', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch products');
    }
  }

  /**
   * Get product by slug (Admin)
   */
  async getProductBySlug(slug: string) {
    try {
      const response = await apiClient.get(`/products/${slug}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product by slug:', error);
      throw new Error(error.response?.data?.error || 'Product not found');
    }
  }

  /**
   * Get product by ID (Admin)
   */
  async getProductById(id: string) {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching product by ID:', error);
      throw new Error(error.response?.data?.error || 'Product not found');
    }
  }

  /**
   * Create new product with multiple image uploads (Admin)
   */
  async addProduct(data: any) {
    try {
      const formData = new FormData();
      
      // Append form fields
      formData.append('title', data.title);
      formData.append('sku', data.sku || '');
      formData.append('slug', data.slug || '');
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('stock', data.stock);
      formData.append('featured', data.featured ? 'true' : 'false');
      
      // Append specifications
      if (data.specifications && data.specifications.length > 0) {
        formData.append('specifications', JSON.stringify(data.specifications));
      }
      
      // Append links
      if (data.links && Object.keys(data.links).length > 0) {
        formData.append('links', JSON.stringify(data.links));
      }
      
      // Append SEO fields - removed since they're no longer used in the form
      // (kept for backward compatibility if needed later)
      
      // Append multiple image files if provided
      if (data.imageFiles && data.imageFiles.length > 0) {
        data.imageFiles.forEach((file: File) => {
          formData.append('images', file);
        });
      }

      const response = await apiClient.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new Error(error.response?.data?.error || 'Failed to create product');
    }
  }

  /**
   * Update product with optional multiple image uploads (Admin)
   */
  async updateProduct(id: string, data: any) {
    try {
      const formData = new FormData();
      
      // Append form fields
      formData.append('title', data.title);
      formData.append('sku', data.sku || '');
      formData.append('slug', data.slug || '');
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('stock', data.stock);
      formData.append('featured', data.featured ? 'true' : 'false');
      
      // Append specifications
      if (data.specifications && data.specifications.length > 0) {
        formData.append('specifications', JSON.stringify(data.specifications));
      }
      
      // Append links
      if (data.links && Object.keys(data.links).length > 0) {
        formData.append('links', JSON.stringify(data.links));
      }
      
      // Append SEO fields - removed since they're no longer used in the form
      // (kept for backward compatibility if needed later)
      
      // Append existing images to keep
      if (data.existingImages && data.existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(data.existingImages));
      }
      
      // Append multiple image files if provided
      if (data.imageFiles && data.imageFiles.length > 0) {
        data.imageFiles.forEach((file: File) => {
          formData.append('images', file);
        });
      }

      const response = await apiClient.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating product:', error);
      throw new Error(error.response?.data?.error || 'Failed to update product');
    }
  }

  /**
   * Delete product (Admin)
   */
  async deleteProduct(id: string) {
    try {
      await apiClient.delete(`/products/${id}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete product');
    }
  }
}

export default new ProductService();
