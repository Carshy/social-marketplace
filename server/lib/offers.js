export const isOfferMessage = (message) => message?.type === 'offer';

export const createOfferMessagePayload = ({
  itemId,
  senderId,
  senderName,
  content,
  price,
  originalPrice,
  parentMessageId = null
}) => {
  return {
    itemId,
    senderId,
    senderName,
    content,
    type: 'offer',
    price,
    originalPrice,
    status: 'pending',
    parentMessageId,
    timestamp: new Date().toISOString()
  };
};

export const createSystemMessagePayload = ({
  itemId,
  content
}) => {
  return {
    itemId,
    senderId: 'system',
    senderName: 'System',
    content,
    type: 'system',
    timestamp: new Date().toISOString()
  };
};

export const markOfferStatus = (message, status) => {
  return {
    ...message,
    status,
    respondedAt: new Date().toISOString()
  };
};