import express from 'express';
import cors from 'cors';
import session from 'express-session';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import itemsRouter from './routes/items.js';
import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';
import {
  ensureDirectory,
  seedJsonFileIfMissingOrEmpty
} from './lib/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: 'marketplace.sid',
    secret: process.env.SESSION_SECRET || 'dev-marketplace-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

// Ensure data directory exists
const dataDir = join(__dirname, 'data');
ensureDirectory(dataDir);

// Seed data
const sampleItems = [
  {
    id: '1',
    name: 'Vintage Comic Book - Spider-Man #1',
    description: 'Rare collectible comic in mint condition, never opened',
    price: 500,
    image: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400',
    sellerId: 'user1',
    sellerName: 'ComicCollector',
    status: 'active',
    highestOffer: null,
    highestOfferBuyer: null,
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Limited Edition Funko Pop - Batman',
    description: 'Rare convention exclusive, still in original box',
    price: 150,
    image: 'https://images.unsplash.com/photo-1581235725079-7c7783e6a2df?w=400',
    sellerId: 'user2',
    sellerName: 'ToyTrader',
    status: 'active',
    highestOffer: null,
    highestOfferBuyer: null,
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Pokemon Card - Charizard Holo',
    description: 'First edition, graded PSA 9, extremely rare',
    price: 1200,
    image: 'https://images.unsplash.com/photo-1621274403997-37aace184f49?w=400',
    sellerId: 'user3',
    sellerName: 'CardMaster',
    status: 'active',
    highestOffer: null,
    highestOfferBuyer: null,
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString()
  }
];

const sampleUsers = [
  {
    id: 'user1',
    name: 'ComicCollector',
    password: hashPassword('demo123'),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: 'user2',
    name: 'ToyTrader',
    password: hashPassword('demo123'),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  {
    id: 'user3',
    name: 'CardMaster',
    password: hashPassword('demo123'),
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
];

const sampleMessages = [
  {
    id: 'msg1',
    itemId: '1',
    senderId: 'user2',
    senderName: 'ToyTrader',
    content: 'Is this comic still available?',
    type: 'text',
    timestamp: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'msg2',
    itemId: '1',
    senderId: 'user1',
    senderName: 'ComicCollector',
    content: 'Yes, it is. Interested?',
    type: 'text',
    timestamp: new Date(Date.now() - 86000000).toISOString()
  },
  {
    id: 'msg3',
    itemId: '1',
    senderId: 'user2',
    senderName: 'ToyTrader',
    content: 'Would you accept 450?',
    type: 'offer',
    price: 450,
    originalPrice: 500,
    status: 'pending',
    timestamp: new Date(Date.now() - 85000000).toISOString()
  }
];

const initDataFiles = () => {
  seedJsonFileIfMissingOrEmpty(join(dataDir, 'items.json'), sampleItems);
  seedJsonFileIfMissingOrEmpty(join(dataDir, 'users.json'), sampleUsers);
  seedJsonFileIfMissingOrEmpty(join(dataDir, 'messages.json'), sampleMessages);
};

initDataFiles();

// Routes
app.use('/api/items', itemsRouter);
app.use('/api/users', usersRouter);
app.use('/api/messages', messagesRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'marketplace-backend',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data directory: ${dataDir}`);
  console.log('Demo login password for seeded users: demo123');
});