import crypto from 'crypto';

export const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

export const storeSessionUser = (req, user) => {
  req.session.user = sanitizeUser(user);
};

export const clearSessionUser = (req) =>
  new Promise((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) return reject(error);
      resolve();
    });
  });

export const getSessionUser = (req) => req.session?.user || null;