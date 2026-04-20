# Collectible Trading Post

A hybrid Social Marketplace built for the Inter Intel technical assessment.

## Overview

Collectible Trading Post is a marketplace experience where users can:

- browse collectible item listings
- search items by keyword
- send direct messages per item
- negotiate using offers and counter-offers
- complete buyer checkout
- confirm completed sales as a seller

This project uses a hybrid rendering approach:

- **EJS** for the server-rendered page shell
- **Lit** for interactive UI components
- **Tailwind CSS** for global layout and styling foundations
- **Express** for both the backend API and the frontend shell server

## Core Features

- Keyword item search
- Real item listing grid
- Item detail page with real backend data
- Direct item-level messaging
- Offer submission and counter-offer flow
- Seller accept / reject / counter controls
- Checkout and seller sale confirmation
- Seller dashboard with summary and item management
- Toast feedback for smoother UX
- Server-determined component rendering

## Architecture

The application is split into two main parts:

### `server/`
Backend API and file-based data storage.

Handles:

- items
- users
- messages
- offer actions
- checkout and sale confirmation

### `web/`
Frontend application shell.

Handles:

- EJS page routes
- server-side component planning
- Lit component bootstrapping
- UI rendering and interaction

## Project Structure

```text
social-marketplace/
├── ADR.md
├── README.md
├── package.json
├── server/
│   ├── index.js
│   ├── routes/
│   ├── lib/
│   └── data/
└── web/
    ├── package.json
    └── src/
        ├── server/
        ├── views/
        ├── public/
        ├── styles/
        └── components/