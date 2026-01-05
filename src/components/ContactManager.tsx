import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { TextArea, Select } from './ui/Form';
import { StatusBadge } from './ui/StatusBadge';
import { EmptyState } from './ui/States';
import { Contact } from '../services/contactService';
import contactService from '../services/contactService';

interface ContactManagerProps {
  contacts: Contact[];
  isLoading: boolean;
  onRefresh: () => void;
  pagination?: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export const ContactManager: React.FC<ContactManagerProps> = ({
  contacts,
  isLoading,
  onRefresh,
  pagination,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newStatus, setNewStatus] = useState<Contact['status']>('New');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statuses: Contact['status'][] = [
    'New',
    'In Progress',
    'Resolved',
    'Closed',
  ];

  const handleViewDetail = (contact: Contact) => {
    setSelectedContact(contact);
    setNewStatus(contact.status);
    setNotes(contact.notes || '');
    setIsDetailOpen(true);
  };

  const handleUpdateContact = async () => {
    if (!selectedContact?._id) return;

    setIsUpdating(true);
    try {
      await contactService.updateContact(selectedContact._id, {
        status: newStatus,
        notes,
      });

      setIsDetailOpen(false);
      setSelectedContact(null);
      setNotes('');
      onRefresh();
    } catch (err) {
      console.error('Failed to update contact:', err);
      alert('Failed to update contact');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact?._id) return;

    if (!window.confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    setIsUpdating(true);
    try {
      await contactService.deleteContact(selectedContact._id);
      setIsDetailOpen(false);
      setSelectedContact(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete contact:', err);
      alert('Failed to delete contact');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading contacts...</p>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState message="No contacts yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Inquiry Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {contact.countryCode} {contact.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contact.inquiryType}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contact.status)}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Button
                        onClick={() => handleViewDetail(contact)}
                        size="sm"
                        variant="primary"
                      >
                        View & Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <Button
                disabled={pagination.page === 1}
                size="sm"
                variant="outline"
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                disabled={pagination.page === pagination.pages}
                size="sm"
                variant="outline"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedContact(null);
          setNotes('');
        }}
        title="Contact Details"
      >
        {selectedContact && (
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-gray-900">{selectedContact.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-gray-900">{selectedContact.lastName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{selectedContact.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Phone</label>
                <p className="mt-1 text-gray-900">
                  {selectedContact.countryCode} {selectedContact.phone}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Inquiry Type</label>
                <p className="mt-1 text-gray-900">{selectedContact.inquiryType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="mt-1 text-gray-900">{formatDate(selectedContact.createdAt)}</p>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-gray-700">Message</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">
                {selectedContact.message}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Contact['status'])}
                options={statuses.map((status) => ({
                  value: status,
                  label: status,
                }))}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Notes</label>
              <TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes..."
                rows={4}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={handleUpdateContact}
                disabled={isUpdating}
                variant="primary"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={handleDeleteContact}
                disabled={isUpdating}
                variant="danger"
              >
                Delete
              </Button>
              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedContact(null);
                  setNotes('');
                }}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
