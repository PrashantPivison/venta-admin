import React from 'react';

interface StatusBadgeProps {
  status: 'pending' | 'reviewing' | 'quoted' | 'completed' | 'rejected' | 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewing: 'bg-blue-100 text-blue-800',
    quoted: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-orange-100 text-orange-800',
    'Out of Stock': 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
};
