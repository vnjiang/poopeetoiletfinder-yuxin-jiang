import { useAuth } from '../context/authContext';

export const useAdminAccess = () => {
  const { user, loading } = useAuth();

  const isAdmin =
    user?.email === 'jiangyuxin0326@gmail.com' ||
    user?.email === '735576596@qq.com';

  return { isAdmin, loading };
};
