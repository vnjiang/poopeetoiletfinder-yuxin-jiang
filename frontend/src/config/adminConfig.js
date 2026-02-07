// src/config/adminConfig.js

export const ADMIN_EMAIL_WHITELIST = [
  'jiangyuxin0326@gmail.com',
  '735576596@qq.com',
];

export const isAdminByEmail = (email) => {
  if (!email) return false;
  return ADMIN_EMAIL_WHITELIST.includes(email.toLowerCase());
};
