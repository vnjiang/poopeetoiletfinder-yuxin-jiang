import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAccess } from '../../hooks/useAdminAccess';
import {
  fetchPendingToilets,
  approveToilet,
  rejectToilet,
} from '../../services/adminService';
import AdminList from '../../components/Admin/AdminList';

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAdminAccess();

  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAdmin, navigate]);


  useEffect(() => {
    fetchPendingToilets()
      .then((data) => setItems(data))
      .catch(() => setError('Failed to load data'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleApprove = async (toilet) => {
    await approveToilet(toilet._id);
    setItems((prev) =>
      prev.filter((item) => item._id !== toilet._id)
    );
  };

  const handleReject = async (id) => {
    await rejectToilet(id);
    setItems((prev) =>
      prev.filter((item) => item._id !== id)
    );
  };

  if (loading || isLoading) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center mt-20 text-red-600">
        {error}
      </p>
    );
  }

  return (
    <div className="pt-24 px-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Admin Review Panel
      </h1>

      <AdminList
        items={items}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default Admin;
