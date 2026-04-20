import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

import { readJsonFile, writeJsonFile } from '../lib/db.js';
import {
  validateItemPayload,
  validateCheckoutPayload
} from '../lib/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const itemsPath = join(__dirname, '../data/items.json');

const readItems = () => readJsonFile(itemsPath, []);
const writeItems = (items) => writeJsonFile(itemsPath, items);

const sortNewestFirst = (items) =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

// Get all active items with search
router.get('/', (req, res) => {
  try {
    let items = readItems().filter((item) => item.status === 'active');

    const search = String(req.query.search || '').trim().toLowerCase();

    if (search) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      );
    }

    res.json(sortNewestFirst(items));
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get seller items
router.get('/seller/:sellerId', (req, res) => {
  try {
    const { sellerId } = req.params;
    const items = readItems().filter((item) => item.sellerId === sellerId);

    res.json(sortNewestFirst(items));
  } catch (error) {
    console.error('Error fetching seller items:', error);
    res.status(500).json({ error: 'Failed to fetch seller items' });
  }
});

// Get one item
router.get('/:id', (req, res) => {
  try {
    const items = readItems();
    const item = items.find((entry) => entry.id === req.params.id);

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create new item
router.post('/', (req, res) => {
  try {
    const validation = validateItemPayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { name, description, price, image, sellerId, sellerName } = validation.data;
    const items = readItems();

    const newItem = {
      id: uuidv4(),
      name,
      description,
      price,
      image: image || 'https://via.placeholder.com/400x300?text=Collectible+Item',
      sellerId,
      sellerName,
      status: 'active',
      highestOffer: null,
      highestOfferBuyer: null,
      agreedPrice: null,
      agreedBuyerId: null,
      paymentStatus: 'unpaid',
      paymentConfirmedBy: null,
      paymentConfirmedAt: null,
      soldAt: null,
      soldTo: null,
      createdAt: new Date().toISOString()
    };

    items.push(newItem);
    writeItems(items);

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item
router.put('/:id', (req, res) => {
  try {
    const items = readItems();
    const itemIndex = items.findIndex((item) => item.id === req.params.id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const allowedFields = [
      'name',
      'description',
      'price',
      'image',
      'status'
    ];

    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    items[itemIndex] = {
      ...items[itemIndex],
      ...updates
    };

    writeItems(items);

    res.json(items[itemIndex]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Remove item completely
router.delete('/:id', (req, res) => {
  try {
    const items = readItems();
    const filtered = items.filter((item) => item.id !== req.params.id);

    writeItems(filtered);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Buyer checks out
router.post('/:id/checkout', (req, res) => {
  try {
    const validation = validateCheckoutPayload(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    const { buyerId } = validation.data;
    const items = readItems();
    const itemIndex = items.findIndex((item) => item.id === req.params.id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = items[itemIndex];

    if (item.status !== 'active') {
      return res.status(400).json({
        error: 'Only active items can be checked out'
      });
    }

    if (!item.agreedBuyerId) {
      return res.status(400).json({
        error: 'Item must have an accepted buyer offer before checkout'
      });
    }

    if (item.agreedBuyerId !== buyerId) {
      return res.status(403).json({
        error: 'Only the agreed buyer can checkout this item'
      });
    }

    item.paymentStatus = 'paid';
    item.paymentConfirmedBy = buyerId;
    item.paymentConfirmedAt = new Date().toISOString();

    writeItems(items);

    res.json({
      success: true,
      message: 'Payment confirmed, awaiting seller confirmation',
      item
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ error: 'Failed to process checkout' });
  }
});

// Seller confirms payment and removes item from active marketplace
router.post('/:id/confirm-sale', (req, res) => {
  try {
    const sellerId = String(req.body.sellerId || '').trim();

    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }

    const items = readItems();
    const itemIndex = items.findIndex((item) => item.id === req.params.id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = items[itemIndex];

    if (item.sellerId !== sellerId) {
      return res.status(403).json({
        error: 'Only the owner of this item can confirm the sale'
      });
    }

    if (item.paymentStatus !== 'paid') {
      return res.status(400).json({
        error: 'Payment must be completed before seller confirmation'
      });
    }

    item.status = 'sold';
    item.soldAt = new Date().toISOString();
    item.soldTo = item.agreedBuyerId || item.paymentConfirmedBy;

    writeItems(items);

    res.json({
      success: true,
      message: 'Item marked as sold and removed from active marketplace',
      item
    });
  } catch (error) {
    console.error('Error confirming sale:', error);
    res.status(500).json({ error: 'Failed to confirm sale' });
  }
});

export default router;