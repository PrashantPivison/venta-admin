import apiClient from './apiClient';

class CustomOrderService {
  // ====== CUSTOM PRODUCTS ======

  /**
   * Get all custom products (Admin)
   */
  async getCustomProducts() {
    try {
      const response = await apiClient.get('/custom-products');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch custom products');
    }
  }

  /**
   * Get custom product by ID (Admin)
   */
  async getCustomProductById(id: string) {
    try {
      const response = await apiClient.get(`/custom-products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Custom product not found');
    }
  }

  /**
   * Create custom product (Admin)
   */
  async addCustomProduct(data: any) {
    try {
      const response = await apiClient.post('/custom-products', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create custom product');
    }
  }

  /**
   * Update custom product (Admin)
   */
  async updateCustomProduct(id: string, data: any) {
    try {
      const response = await apiClient.put(`/custom-products/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update custom product');
    }
  }

  /**
   * Delete custom product (Admin)
   */
  async deleteCustomProduct(id: string) {
    try {
      await apiClient.delete(`/custom-products/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete custom product');
    }
  }

  /**
   * Get categories
   */
  async getCategories() {
    try {
      const products = await this.getCustomProducts();
      const categories = [...new Set(products.map((p: any) => p.category))];
      return categories;
    } catch (error) {
      return [];
    }
  }

  // ====== INQUIRIES ======

  /**
   * Get all inquiries (Admin)
   */
  async getInquiries() {
    try {
      const response = await apiClient.get('/inquiries');
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch inquiries');
    }
  }

  /**
   * Get inquiry by ID (Admin)
   */
  async getInquiryById(id: string) {
    try {
      const response = await apiClient.get(`/inquiries/${id}`);
      return response.data;
    } catch (error) {
      throw new Error('Inquiry not found');
    }
  }

  /**
   * Create inquiry (Public - no token needed)
   */
  async createInquiry(data: any) {
    try {
      const response = await apiClient.post('/inquiries', data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to create inquiry');
    }
  }

  /**
   * Update inquiry status (Admin)
   */
  async updateCustomOrderStatus(id: string, data: any) {
    try {
      const response = await apiClient.put(`/inquiries/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error('Failed to update inquiry');
    }
  }

  /**
   * Delete inquiry (Admin)
   */
  async deleteInquiry(id: string) {
    try {
      await apiClient.delete(`/inquiries/${id}`);
      return true;
    } catch (error) {
      throw new Error('Failed to delete inquiry');
    }
  }

  /**
   * Get inquiries for a specific product
   */
  async getProductInquiries(productId: string) {
    try {
      const inquiries = await this.getInquiries();
      return inquiries.filter((i: any) => i.productId === productId);
    } catch (error) {
      throw new Error('Failed to fetch product inquiries');
    }
  }

  // Legacy methods for backward compatibility
  async getCustomOrders() {
    return this.getInquiries();
  }

  async deleteCustomOrder(id: string) {
    return this.deleteInquiry(id);
  }

  async getOrderStats() {
    try {
      const inquiries = await this.getInquiries();
      return {
        total: inquiries.length,
        pending: inquiries.filter((i: any) => i.status === 'pending').length,
        reviewing: inquiries.filter((i: any) => i.status === 'reviewing').length,
        quoted: inquiries.filter((i: any) => i.status === 'quoted').length,
        completed: inquiries.filter((i: any) => i.status === 'completed').length,
      };
    } catch (error) {
      return { total: 0, pending: 0, reviewing: 0, quoted: 0, completed: 0 };
    }
  }
}

export default new CustomOrderService();
