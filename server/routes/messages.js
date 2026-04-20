import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { readJsonFile, writeJsonFile } from '../lib/db.js';
import { validateMessagePayload } from '../lib/validators.js';
import {
  isOfferMessage,
  createOfferMessagePayload,
  createSystemMessagePayload,
  markOfferStatus
} from '../lib/offers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const messagesPath = join(__dirname, '../data/messages.json');
const itemsPath = join(__dirname, '../data/items.json');

const readMessages = () => readJsonFile(messagesPath, []);
const writeMessages = (messages) => writeJsonFile(messagesPath, messages);

const readItems = () => readJsonFile(itemsPath, []);
const writeItems = (items) => writeJsonFile(itemsPath, items);

const sortMessagesByTime = (messages) =>
  [...messages].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

const findItemById = (itemId) => {
  const items = readItems();
  return items.find((item) => item.id === itemId);
};

const updateItemHighestOffer = ({ itemId, price, buyerId }) => {
  if (!Number.isFinite(price)) return;

  const items = readItems();
  const itemIndex = items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) return;

  const currentHighest = Number(items[itemIndex].highestOffer);

  if (!Number.isFinite(currentHighest) || price > currentHighest) {
    items[itemIndex].highestOffer = price;
    items[itemIndex].highestOfferBuyer = buyerId;
    writeItems(items);
  }
};

const appendSystemMessage = (messages, itemId, content) => {
  messages.push({
    id: uuidv4(),
    ...createSystemMessagePayload({ itemId, content })
  });
};

// Get full thread for an item
router.get('/item/:itemId', (req, res) => {
  try {
    const { itemId } = req.params;
    const item = findItemById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const messages = readMessages().filter((message) => message.itemId === itemId);

    res.json({
      itemId,
      messages: sortMessagesByTime(messages)
    });
  } catch (error) {
    console.error('Error fetching item messages:', error);
    res.status(500).json({ error: 'Failed to fetch item messages' });
  }
});

// Get new messages after timestamp (for real-time polling)
router.get('/item/:itemId/poll/:timestamp', (req, res) => {
  try {
    const messages = readMessages();
    const since = new Date(req.params.timestamp);
    const itemId = req.params.itemId;

    if (isNaN(since.getTime())) {
      return res.status(400).json({ error: 'Invalid timestamp format' });
    }

    const newMessages = sortMessagesByTime(
      messages.filter(
        (message) =>
          message.itemId === itemId &&
          new Date(message.timestamp).getTime() > since.getTime()
      )
    );

    res.json({
      messages: newMessages,
      lastTimestamp:
        newMessages.length > 0
          ? newMessages[newMessages.length - 1].timestamp
          : req.params.timestamp,
      hasNew: newMessages.length > 0,
      pollAgainAfter: 2000
    });
  } catch (error) {
    console.error('Error in polling:', error);
    res.status(500).json({ error: 'Failed to fetch new messages' });
  }
});

// Send a new message or offer
router.post('/', (req, res) => {
  try {
    const validation = validateMessagePayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const {
      itemId,
      senderId,
      senderName,
      content,
      type,
      price,
      originalPrice
    } = validation.data;

    const item = findItemById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const messages = readMessages();

    let newMessage;

    if (type === 'offer') {
      newMessage = {
        id: uuidv4(),
        ...createOfferMessagePayload({
          itemId,
          senderId,
          senderName,
          content,
          price,
          originalPrice: Number.isFinite(originalPrice) ? originalPrice : item.price
        })
      };

      updateItemHighestOffer({
        itemId,
        price,
        buyerId: senderId
      });
    } else {
      newMessage = {
        id: uuidv4(),
        itemId,
        senderId,
        senderName,
        content,
        type,
        timestamp: new Date().toISOString()
      };
    }

    messages.push(newMessage);
    writeMessages(messages);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Accept an offer
router.post('/:id/accept', (req, res) => {
  try {
    const messages = readMessages();
    const messageIndex = messages.findIndex((message) => message.id === req.params.id);

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Offer message not found' });
    }

    const targetMessage = messages[messageIndex];

    if (!isOfferMessage(targetMessage)) {
      return res.status(400).json({ error: 'Only offer messages can be accepted' });
    }

    if (targetMessage.status && targetMessage.status !== 'pending') {
      return res.status(400).json({
        error: `Offer is already ${targetMessage.status}`
      });
    }

    messages[messageIndex] = markOfferStatus(targetMessage, 'accepted');

    const items = readItems();
    const itemIndex = items.findIndex((item) => item.id === targetMessage.itemId);

    if (itemIndex !== -1) {
      items[itemIndex].agreedPrice = targetMessage.price;
      items[itemIndex].agreedBuyerId = targetMessage.senderId;
      items[itemIndex].paymentStatus = 'awaiting_checkout';
      writeItems(items);
    }

    appendSystemMessage(
      messages,
      targetMessage.itemId,
      `${targetMessage.senderName}'s offer of $${targetMessage.price} was accepted.`
    );

    writeMessages(messages);

    res.json({
      success: true,
      message: 'Offer accepted successfully',
      offer: messages[messageIndex]
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// Reject an offer
router.post('/:id/reject', (req, res) => {
  try {
    const messages = readMessages();
    const messageIndex = messages.findIndex((message) => message.id === req.params.id);

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Offer message not found' });
    }

    const targetMessage = messages[messageIndex];

    if (!isOfferMessage(targetMessage)) {
      return res.status(400).json({ error: 'Only offer messages can be rejected' });
    }

    if (targetMessage.status && targetMessage.status !== 'pending') {
      return res.status(400).json({
        error: `Offer is already ${targetMessage.status}`
      });
    }

    messages[messageIndex] = markOfferStatus(targetMessage, 'rejected');

    appendSystemMessage(
      messages,
      targetMessage.itemId,
      `${targetMessage.senderName}'s offer of $${targetMessage.price} was rejected.`
    );

    writeMessages(messages);

    res.json({
      success: true,
      message: 'Offer rejected successfully',
      offer: messages[messageIndex]
    });
  } catch (error) {
    console.error('Error rejecting offer:', error);
    res.status(500).json({ error: 'Failed to reject offer' });
  }
});

// Counter an offer with a new offer
router.post('/:id/counter', (req, res) => {
  try {
    const messages = readMessages();
    const messageIndex = messages.findIndex((message) => message.id === req.params.id);

    if (messageIndex === -1) {
      return res.status(404).json({ error: 'Offer message not found' });
    }

    const targetMessage = messages[messageIndex];

    if (!isOfferMessage(targetMessage)) {
      return res.status(400).json({ error: 'Only offer messages can be countered' });
    }

    if (targetMessage.status && targetMessage.status !== 'pending') {
      return res.status(400).json({
        error: `Offer is already ${targetMessage.status}`
      });
    }

    const senderId = String(req.body.senderId || '').trim();
    const senderName = String(req.body.senderName || '').trim();
    const counterPrice = Number(req.body.counterPrice);
    const content =
      String(req.body.content || '').trim() ||
      `Counter offer: ${counterPrice}`;

    if (!senderId) {
      return res.status(400).json({ error: 'Sender ID is required' });
    }

    if (!senderName) {
      return res.status(400).json({ error: 'Sender name is required' });
    }

    if (!Number.isFinite(counterPrice) || counterPrice <= 0) {
      return res.status(400).json({
        error: 'Counter price must be a valid number greater than 0'
      });
    }

    messages[messageIndex] = markOfferStatus(targetMessage, 'countered');

    const counterOffer = {
      id: uuidv4(),
      ...createOfferMessagePayload({
        itemId: targetMessage.itemId,
        senderId,
        senderName,
        content,
        price: counterPrice,
        originalPrice: targetMessage.originalPrice || targetMessage.price,
        parentMessageId: targetMessage.id
      })
    };

    messages.push(counterOffer);

    appendSystemMessage(
      messages,
      targetMessage.itemId,
      `${senderName} made a counter offer of $${counterPrice}.`
    );

    writeMessages(messages);

    res.status(201).json({
      success: true,
      message: 'Counter offer created successfully',
      offer: counterOffer
    });
  } catch (error) {
    console.error('Error countering offer:', error);
    res.status(500).json({ error: 'Failed to create counter offer' });
  }
});

// Get unread message count for a user
router.get('/unread/:userId', (req, res) => {
  try {
    const messages = readMessages();
    const userId = req.params.userId;

    const unreadMessages = messages.filter(
      (message) =>
        message.senderId !== userId &&
        message.senderId !== 'system' &&
        !message.readBy?.includes(userId)
    );

    const unreadByItem = {};
    unreadMessages.forEach((message) => {
      if (!unreadByItem[message.itemId]) {
        unreadByItem[message.itemId] = 0;
      }
      unreadByItem[message.itemId] += 1;
    });

    res.json({
      total: unreadMessages.length,
      byItem: unreadByItem
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// Mark messages as read
router.post('/read', (req, res) => {
  try {
    const { userId, itemId } = req.body;

    if (!userId || !itemId) {
      return res.status(400).json({
        error: 'userId and itemId are required'
      });
    }

    const messages = readMessages();

    messages.forEach((message) => {
      if (message.itemId === itemId && message.senderId !== userId) {
        if (!message.readBy) message.readBy = [];
        if (!message.readBy.includes(userId)) {
          message.readBy.push(userId);
        }
      }
    });

    writeMessages(messages);

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Delete a message
router.delete('/:id', (req, res) => {
  try {
    const messages = readMessages();
    const filtered = messages.filter((message) => message.id !== req.params.id);

    writeMessages(filtered);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

export default router;