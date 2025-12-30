import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { TextArea, Select } from './ui/Form';
import { StatusBadge } from './ui/StatusBadge';
import { EmptyState } from './ui/States';
import { CustomOrder, CustomProduct } from '../types/admin.types';
import customOrderService from '../services/customOrderService';

interface InquiryManagerProps {
  isOpen: boolean;
  selectedProduct: CustomProduct | null;
  inquiries: CustomOrder[];
  onClose: () => void;
  onInquiriesUpdate: (updatedInquiries: CustomOrder[]) => void;
}

export const InquiryManager: React.FC<InquiryManagerProps> = ({
  isOpen,
  selectedProduct,
  inquiries,
  onClose,
  onInquiriesUpdate,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<CustomOrder | null>(null);
  const [newStatus, setNewStatus] = useState<CustomOrder['status']>('pending');
  const [notes, setNotes] = useState('');

  const statuses: CustomOrder['status'][] = [
    'pending',
    'reviewing',
    'quoted',
    'completed',
    'rejected',
  ];

  const handleViewDetail = (inquiry: CustomOrder) => {
    setSelectedInquiry(inquiry);
    setNewStatus(inquiry.status);
    setNotes(inquiry.notes || '');
    setIsDetailOpen(true);
  };

  const handleUpdateInquiry = async () => {
    if (!selectedInquiry) return;

    try {
      await customOrderService.updateCustomOrderStatus(selectedInquiry._id, {
        status: newStatus,
        notes,
      });

      const updatedInquiries = inquiries.map((i) =>
        i._id === selectedInquiry._id ? { ...i, status: newStatus, notes } : i
      );
      onInquiriesUpdate(updatedInquiries);
      setIsDetailOpen(false);
    } catch (err) {
      console.error('Failed to update inquiry');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Inquiries List Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Inquiries for ${selectedProduct?.title || 'Product'}`}
      >
        <div className="space-y-4">
          {inquiries.length === 0 ? (
            <EmptyState message="No inquiries yet for this product" />
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleViewDetail(inquiry)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{inquiry.name}</h4>
                      <p className="text-sm text-gray-600">{inquiry.email}</p>
                    </div>
                    <StatusBadge status={inquiry.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {inquiry.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>📞 {inquiry.phone}</span>
                    <span>{formatDate(inquiry.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Inquiry Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Inquiry Details"
      >
        {selectedInquiry && (
          <div className="space-y-4">
            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{selectedInquiry.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{selectedInquiry.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-semibold">{selectedInquiry.phone}</span>
                </div>
                {selectedInquiry.company && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-semibold">{selectedInquiry.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inquiry Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">Inquiry Details</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-600 block mb-1">Description:</span>
                  <p className="font-semibold text-gray-800 bg-white p-2 rounded">
                    {selectedInquiry.description}
                  </p>
                </div>
                {selectedInquiry.quantity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-semibold">{selectedInquiry.quantity} units</span>
                  </div>
                )}
                {selectedInquiry.budget && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-semibold">{selectedInquiry.budget}</span>
                  </div>
                )}
                {selectedInquiry.timeline && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeline:</span>
                    <span className="font-semibold">{selectedInquiry.timeline}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-semibold">{formatDate(selectedInquiry.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Status Update */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Update Status</h3>

              <Select
                label="Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as CustomOrder['status'])}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </Select>

              <div className="mt-3">
                <TextArea
                  label="Admin Notes"
                  placeholder="Add notes about this inquiry..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button variant="primary" onClick={handleUpdateInquiry} className="flex-1">
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
                Update Inquiry
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsDetailOpen(false)}
                className="flex-1"
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
