import apiClient from './apiClient';

export interface Contact {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  inquiryType: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Closed';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactFilters {
  status?: string;
  search?: string;
  sortBy?: string;
  order?: string;
  limit?: number;
  page?: number;
}

/**
 * Contact Service - Admin side
 * Handles all contact-related API calls for the admin panel
 */
class ContactService {
  /**
   * Get all contacts with filters
   */
  async getContacts(filters?: ContactFilters) {
    try {
      const response = await apiClient.get('/contacts', {
        params: filters,
      });
      return {
        success: true,
        data: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error: any) {
      console.error('Error fetching contacts:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch contacts');
    }
  }

  /**
   * Get single contact by ID
   */
  async getContactById(id: string) {
    try {
      const response = await apiClient.get(`/contacts/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error fetching contact:', error);
      throw new Error(error.response?.data?.error || 'Contact not found');
    }
  }

  /**
   * Update contact status and notes
   */
  async updateContact(id: string, updates: { status?: string; notes?: string }) {
    try {
      const response = await apiClient.put(`/contacts/${id}`, updates);
      return {
        success: true,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error updating contact:', error);
      throw new Error(error.response?.data?.error || 'Failed to update contact');
    }
  }

  /**
   * Delete a contact
   */
  async deleteContact(id: string) {
    try {
      const response = await apiClient.delete(`/contacts/${id}`);
      return {
        success: true,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Error deleting contact:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete contact');
    }
  }

  /**
   * Get contact statistics
   */
  async getContactStats() {
    try {
      const response = await apiClient.get('/contacts/stats');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Error fetching contact stats:', error);
      throw new Error(error.response?.data?.error || 'Failed to fetch contact statistics');
    }
  }
}

const contactService = new ContactService();
export default contactService;
