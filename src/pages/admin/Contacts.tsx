import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Form';
import { ContactManager } from '../../components/ContactManager';
import { Contact, ContactFilters } from '../../services/contactService';
import contactService from '../../services/contactService';

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
    limit: 20,
  });
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    inProgress: 0,
    resolved: 0,
  });

  const statuses = ['All', 'New', 'In Progress', 'Resolved', 'Closed'];

  // Load contacts
  const loadContacts = async () => {
    setIsLoading(true);
    setError('');
    try {
      const filters: ContactFilters = {
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: searchTerm || undefined,
        sortBy,
        order: sortOrder,
        limit: 20,
        page: currentPage,
      };

      const result = await contactService.getContacts(filters);
      setContacts(result.data);
      setPagination(result.pagination);

      // Load stats
      const statsResult = await contactService.getContactStats();
      setStats(statsResult.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
      console.error('Error loading contacts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load contacts on mount and when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    loadContacts();
  }, [searchTerm, selectedStatus, sortBy, sortOrder, currentPage]);

  const handleRefresh = () => {
    loadContacts();
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Inquiries</h1>
          <p className="mt-2 text-gray-600">Manage and respond to customer inquiries</p>
        </div>

        {/* Statistics */}
      

        {/* Filters */}
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <Input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  options={statuses.map((status) => ({
                    value: status,
                    label: status,
                  }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  options={[
                    { value: 'createdAt', label: 'Date' },
                    { value: 'firstName', label: 'Name' },
                    { value: 'email', label: 'Email' },
                  ]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order
                </label>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  options={[
                    { value: 'desc', label: 'Newest First' },
                    { value: 'asc', label: 'Oldest First' },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleRefresh} variant="primary" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Contacts Table */}
        <ContactManager
          contacts={contacts}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          pagination={pagination}
        />
      </div>
    </AdminLayout>
  );
};
