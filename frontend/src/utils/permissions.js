import { isAdminByEmail } from '../config/adminConfig';

export const isAdminUser = (user) => {
  if (!user) return false;
  if (!user.email) return false; 

  return isAdminByEmail(user.email);
};
