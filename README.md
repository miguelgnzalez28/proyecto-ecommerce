# Ecommerce Store with Google Pay Integration

A modern ecommerce application with Google Pay integration and email storage functionality.

## Features

- 🛍️ Product catalog with shopping cart
- 💳 Google Pay integration for seamless payments
- 📧 Email storage in SQLite database
- 🎨 Modern, responsive UI
- ⚡ Fast and lightweight

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
.
├── server.js          # Express server with API endpoints
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html    # Main ecommerce page
│   ├── styles.css    # Styling
│   └── app.js        # Frontend JavaScript
└── emails.db         # SQLite database (created automatically)
```

## API Endpoints

- `POST /api/store-email` - Store customer email in database
  - Body: `{ "email": "customer@example.com" }`
  - Returns: `{ "success": true, "message": "Email stored successfully" }`

- `GET /api/emails` - Get all stored emails (for admin purposes)
  - Returns: `{ "success": true, "emails": [...] }`

## Google Pay Setup

The current implementation uses Google Pay in TEST mode. To use it in production:

1. Register your merchant account with Google Pay
2. Update the `merchantId` in `app.js`
3. Configure your payment gateway
4. Change `environment: 'TEST'` to `environment: 'PRODUCTION'` in `app.js`

## Database

The application uses SQLite to store customer emails. The database file (`emails.db`) is created automatically on first run.

## Notes

- The Google Pay integration is currently in test mode
- For production use, you'll need to configure a real payment gateway
- Email addresses are stored uniquely (duplicates are prevented)
