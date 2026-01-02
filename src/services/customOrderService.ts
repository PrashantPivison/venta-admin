import apiClient from './apiClient';

class CustomOrderService {
  // ====== CUSTOM PRODUCTS ======

  async getCustomProducts() {
    try {
      const response = await apiClient.get('/custom/products');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch custom products');
    }
  }

  async getCustomProductById(id: string) {
    try {
      const response = await apiClient.get(`/custom/products/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Custom product not found');
    }
  }

  async addCustomProduct(data: any) {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category || 'Custom');
      formData.append('specifications', data.specifications || '');
      
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      }

      const response = await apiClient.post('/custom/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create custom product');
    }
  }

  async updateCustomProduct(id: string, data: any) {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('category', data.category || 'Custom');
      formData.append('specifications', data.specifications || '');
      if (data.isActive !== undefined) formData.append('isActive', String(data.isActive));
      
      if (data.imageFile) {
        formData.append('image', data.imageFile);
      }

      const response = await apiClient.put(`/custom/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update custom product');
    }
  }

  async deleteCustomProduct(id: string) {
    try {
      await apiClient.delete(`/custom/products/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete custom product');
    }
  }

  // ====== INQUIRIES ======

  async getInquiries() {
    try {
      const response = await apiClient.get('/custom/inquiries');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch inquiries');
    }
  }

  async getInquiriesByProduct(productId: string) {
    try {
      const response = await apiClient.get(`/custom/inquiries/product/${productId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product inquiries');
    }
  }

  async getInquiryById(id: string) {
    try {
      const response = await apiClient.get(`/custom/inquiries/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Inquiry not found');
    }
  }

  async updateInquiryStatus(id: string, data: { status?: string; adminNotes?: string }) {
    try {
      const response = await apiClient.put(`/custom/inquiries/${id}`, data);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update inquiry');
    }
  }

  async deleteInquiry(id: string) {
    try {
      await apiClient.delete(`/custom/inquiries/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete inquiry');
    }
  }
}

export default new CustomOrderService();
