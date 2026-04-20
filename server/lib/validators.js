const normalizeString = (value) =>
  typeof value === 'string' ? value.trim() : '';

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
};

export const buildValidationResult = (errors, data = {}) => ({
  valid: errors.length === 0,
  errors,
  data
});

export const validateLoginPayload = (body = {}) => {
  const errors = [];
  const name = normalizeString(body.name);
  const password = normalizeString(body.password);

  if (!name) {
    errors.push('Username is required');
  }

  if (!password) {
    errors.push('Password is required');
  }

  return buildValidationResult(errors, { name, password });
};

export const validateRegistrationPayload = (body = {}) => {
  const errors = [];
  const name = normalizeString(body.name);
  const password = normalizeString(body.password);

  if (!name) {
    errors.push('Username is required');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 3) {
    errors.push('Password must be at least 3 characters');
  }

  return buildValidationResult(errors, { name, password });
};

export const validateItemPayload = (body = {}) => {
  const errors = [];
  const name = normalizeString(body.name);
  const description = normalizeString(body.description) || 'No description provided';
  const image = normalizeString(body.image);
  const sellerId = normalizeString(body.sellerId);
  const sellerName = normalizeString(body.sellerName) || 'Anonymous';
  const price = toNumber(body.price);

  if (!name) {
    errors.push('Item name is required');
  }

  if (!sellerId) {
    errors.push('Seller ID is required');
  }

  if (!Number.isFinite(price) || price <= 0) {
    errors.push('Price must be a valid number greater than 0');
  }

  return buildValidationResult(errors, {
    name,
    description,
    image,
    sellerId,
    sellerName,
    price
  });
};

export const validateMessagePayload = (body = {}) => {
  const errors = [];
  const itemId = normalizeString(body.itemId);
  const senderId = normalizeString(body.senderId);
  const senderName = normalizeString(body.senderName);
  const content = normalizeString(body.content);
  const type = normalizeString(body.type) || 'text';
  const price = body.price === undefined ? undefined : toNumber(body.price);
  const originalPrice =
    body.originalPrice === undefined ? undefined : toNumber(body.originalPrice);

  if (!itemId) {
    errors.push('Item ID is required');
  }

  if (!senderId) {
    errors.push('Sender ID is required');
  }

  if (!senderName) {
    errors.push('Sender name is required');
  }

  if (!['text', 'offer', 'system'].includes(type)) {
    errors.push('Message type must be text, offer, or system');
  }

  if (!content) {
    errors.push('Message content is required');
  }

  if (type === 'offer') {
    if (!Number.isFinite(price) || price <= 0) {
      errors.push('Offer price must be greater than 0');
    }

    if (
      originalPrice !== undefined &&
      (!Number.isFinite(originalPrice) || originalPrice <= 0)
    ) {
      errors.push('Original price must be greater than 0 when provided');
    }
  }

  return buildValidationResult(errors, {
    itemId,
    senderId,
    senderName,
    content,
    type,
    price,
    originalPrice
  });
};

export const validateCheckoutPayload = (body = {}) => {
  const errors = [];
  const buyerId = normalizeString(body.buyerId);

  if (!buyerId) {
    errors.push('Buyer ID is required');
  }

  return buildValidationResult(errors, { buyerId });
};

export const validatePasswordChangePayload = (body = {}) => {
  const errors = [];
  const oldPassword = normalizeString(body.oldPassword);
  const newPassword = normalizeString(body.newPassword);

  if (!oldPassword) {
    errors.push('Old password is required');
  }

  if (!newPassword) {
    errors.push('New password is required');
  } else if (newPassword.length < 3) {
    errors.push('New password must be at least 3 characters');
  }

  return buildValidationResult(errors, { oldPassword, newPassword });
};