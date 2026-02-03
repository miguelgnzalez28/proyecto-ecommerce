# AUTOPARTS - Auto Parts Ecommerce

A modern auto parts e-commerce application built with React, featuring a clean UI and seamless shopping experience for car enthusiasts and mechanics.

## Features

- 🚗 Auto parts focused e-commerce platform
- 🛍️ Modern React-based shopping interface
- 🎨 Clean UI with Tailwind CSS and Framer Motion animations
- 🛒 Shopping cart with session persistence
- 📱 Responsive design for all devices
- ⚡ Fast and optimized with Vite
- 🗄️ SQLite database for products, cart, and email storage
- 🔧 Admin panel for managing parts inventory

## Tech Stack

- **Frontend**: React 18, React Router, React Query
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Express.js
- **Database**: SQLite3
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The React app will be available at `http://localhost:5173` (Vite dev server)
The Express API server will be available at `http://localhost:3000`

### Building for Production

1. Build the React app:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Project Structure

```
├── src/
│   ├── api/           # API client (base44Client)
│   ├── components/    # React components
│   │   ├── shop/      # Shop-related components
│   │   └── ui/        # UI components (Tabs, Cards, Buttons, etc.)
│   ├── pages/         # Page components (Home, Shop, Admin)
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main app component
│   ├── main.jsx       # Entry point
│   └── index.css      # Global styles
├── public/             # Static assets
├── server.js          # Express server with SQLite
├── vite.config.js     # Vite configuration
└── tailwind.config.js # Tailwind configuration
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Cart
- `GET /api/cart?session_id=xxx` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove cart item

### Other
- `POST /api/store-email` - Store customer email
- `GET /api/emails` - Get all stored emails (admin)

## Development

The project uses Vite for fast development with hot module replacement. The Express server handles API requests and serves the built React app in production.

## License

ISC
