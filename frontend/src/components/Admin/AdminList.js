import React from 'react';
import AdminItem from './AdminItem';

const AdminList = ({ items, onApprove, onReject }) => {
  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
        <div className="text-sm font-semibold text-gray-900">No items</div>
        <p className="mt-1 text-sm text-gray-500">
          Nothing to review right now. Try refreshing later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((toilet) => (
        <AdminItem
          key={toilet._id}
          toilet={toilet}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default AdminList;
