const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Vercel Blob Storage (optional, for production)
let blobStorage = null;
try {
  const { put, get, list } = require('@vercel/blob');
  blobStorage = { put, get, list };
  console.log('Vercel Blob Storage available');
} catch (error) {
  console.log('Vercel Blob Storage not available, using SQLite only');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize database
// In Vercel/serverless, use /tmp for writable filesystem
// Note: /tmp is ephemeral in serverless, data will be lost between cold starts
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
const dbPath = isVercel ? '/tmp/emails.db' : './emails.db';
console.log('Initializing database at:', dbPath, 'Vercel:', !!isVercel);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    console.error('Database path attempted:', dbPath);
    console.error('Current working directory:', process.cwd());
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    // Create users table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating users table:', err.message);
      } else {
        console.log('Users table ready');
      }
    });

    // Create emails table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS emails (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Emails table ready');
      }
    });
    
    // Create cart_items table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS cart_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      product_image TEXT,
      product_price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      session_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating cart_items table:', err.message);
      } else {
        console.log('Cart items table ready');
      }
    });
    
    // Create orders table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      shipping_address TEXT,
      items TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating orders table:', err.message);
      } else {
        console.log('Orders table ready');
      }
    });

    // Create subscribers table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS subscribers (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      source TEXT,
      is_active INTEGER DEFAULT 1,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating subscribers table:', err.message);
      } else {
        console.log('Subscribers table ready');
      }
    });
    
    // Create products table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT 'engine',
      inventory INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Error creating products table:', err.message);
      } else {
        console.log('Products table ready');
        // Update existing products: change "accessories" to car parts categories
        db.run(`UPDATE products SET category = 'engine' WHERE category = 'accessories'`, (err) => {
          if (err) {
            console.error('Error updating accessories category:', err.message);
          } else {
            console.log('Updated accessories products to engine category');
          }
        });
        
        // Insert initial mock products if table is empty
        db.get('SELECT COUNT(*) as count FROM products', [], (err, row) => {
          if (!err && row.count === 0) {
            const initialProducts = [
              ['Air Filter - Premium', 'High-performance air filter for better engine performance', 29.99, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500', 'engine', 50, 1],
              ['Brake Pads Set', 'Ceramic brake pads for reliable stopping power', 89.99, 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=500', 'brakes', 30, 1],
              ['Spark Plugs Set (4)', 'High-performance spark plugs for optimal engine performance', 49.99, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500', 'engine', 100, 0],
              ['All-Season Tires (Set of 4)', 'Premium all-season tires for year-round driving', 599.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', 'tires', 25, 1],
              ['Oil Filter', 'High-quality oil filter for engine protection', 12.99, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500', 'engine', 150, 1],
              ['Car Battery', 'Heavy-duty car battery with 3-year warranty', 129.99, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500', 'engine', 20, 0],
            ];
            const stmt = db.prepare('INSERT INTO products (name, description, price, image_url, category, inventory, featured) VALUES (?, ?, ?, ?, ?, ?, ?)');
            initialProducts.forEach(product => {
              stmt.run(product);
            });
            stmt.finalize();
            console.log('Initial products inserted');
          }
        });
      }
    });
  }
});

// Authentication API endpoints
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
  }

  // Validar nombre: solo letras, espacios, guiones y apóstrofes
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/;
  if (!nameRegex.test(name)) {
    return res.status(400).json({ success: false, message: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes' });
  }

  if (name.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'El nombre debe tener al menos 2 caracteres' });
  }

  // Validar email con regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: 'Por favor ingresa un correo electrónico válido' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Simple password hashing (in production, use bcrypt)
  const hashedPassword = Buffer.from(password).toString('base64');

  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      console.error('Error creating user:', err);
      return res.status(500).json({ success: false, message: 'Error creating account' });
    }

    // Also store email in emails table with proper error handling
    // Use a callback to ensure it completes before responding
    const userId = this.lastID;
    db.run('INSERT OR IGNORE INTO emails (email) VALUES (?)', [email], async function(emailErr) {
      if (emailErr) {
        // Log error but don't fail the registration
        console.error('Error storing email in emails table:', emailErr);
        console.error('Email that failed:', email);
      } else {
        if (this.changes > 0) {
          console.log('Email stored successfully in emails table:', email);
          
          // Also store in Vercel Blob Storage if available (for production backup)
          if (blobStorage) {
            try {
              const emailData = {
                email,
                name,
                userId: userId,
                createdAt: new Date().toISOString(),
              };
              const filename = `emails/${email.replace('@', '_at_')}_${Date.now()}.json`;
              await blobStorage.put(filename, JSON.stringify(emailData), {
                access: 'public',
                contentType: 'application/json',
              });
              console.log('Email also stored in Vercel Blob Storage:', filename);
            } catch (blobError) {
              console.error('Error storing email in Blob Storage (non-critical):', blobError);
            }
          }
        } else {
          console.log('Email already exists in emails table:', email);
        }
      }
    });

    const user = {
      id: this.lastID,
      name,
      email,
      created_at: new Date().toISOString(),
    };

    res.json({ success: true, message: 'Account created successfully', user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const hashedPassword = Buffer.from(password).toString('base64');

  db.get('SELECT id, name, email, created_at FROM users WHERE email = ? AND password = ?', [email, hashedPassword], (err, row) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error during login' });
    }

    if (!row) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = {
      id: row.id,
      name: row.name,
      email: row.email,
      created_at: row.created_at,
    };

    res.json({ success: true, message: 'Login successful', user });
  });
});

// API endpoint to store email
app.post('/api/store-email', (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Invalid email address' });
  }

  db.run('INSERT OR IGNORE INTO emails (email) VALUES (?)', [email], function(err) {
    if (err) {
      console.error('Error storing email:', err);
      console.error('Email that failed:', email);
      return res.status(500).json({ success: false, message: 'Error storing email', error: err.message });
    }
    
    if (this.changes > 0) {
      console.log('Email stored successfully:', email, 'ID:', this.lastID);
      res.json({ success: true, message: 'Email stored successfully', id: this.lastID });
    } else {
      console.log('Email already exists (ignored):', email);
      res.json({ success: true, message: 'Email already exists', id: null });
    }
  });
});

// API endpoint to get all emails (for admin purposes)
app.get('/api/emails', (req, res) => {
  db.all('SELECT * FROM emails ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching emails' });
    }
    res.json({ success: true, emails: rows });
  });
});

// Cart API endpoints
app.get('/api/cart', (req, res) => {
  const { session_id } = req.query;
  
  if (!session_id) {
    return res.status(400).json({ success: false, message: 'Session ID required' });
  }
  
  db.all('SELECT * FROM cart_items WHERE session_id = ? ORDER BY created_at DESC', [session_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching cart items' });
    }
    res.json({ success: true, items: rows });
  });
});

app.post('/api/cart', (req, res) => {
  const { product_id, product_name, product_image, product_price, quantity, session_id } = req.body;
  
  if (!product_id || !product_name || !product_price || !session_id) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  db.run(
    'INSERT INTO cart_items (product_id, product_name, product_image, product_price, quantity, session_id) VALUES (?, ?, ?, ?, ?, ?)',
    [product_id, product_name, product_image || '', product_price, quantity || 1, session_id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating cart item' });
      }
      db.get('SELECT * FROM cart_items WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching created cart item' });
        }
        res.json({ success: true, item: row });
      });
    }
  );
});

app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  if (quantity === undefined) {
    return res.status(400).json({ success: false, message: 'Quantity required' });
  }
  
  db.run(
    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating cart item' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }
      db.get('SELECT * FROM cart_items WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching updated cart item' });
        }
        res.json({ success: true, item: row });
      });
    }
  );
});

app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM cart_items WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error deleting cart item' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }
    res.json({ success: true, message: 'Cart item deleted' });
  });
});

// Products API endpoints
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching products' });
    }
    // Convert featured from integer to boolean
    const products = rows.map(row => ({
      ...row,
      featured: row.featured === 1
    }));
    res.json({ success: true, products });
  });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, image_url, category, inventory, featured } = req.body;
  
  if (!name || price === undefined) {
    return res.status(400).json({ success: false, message: 'Name and price are required' });
  }
  
  db.run(
    'INSERT INTO products (name, description, price, image_url, category, inventory, featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, description || '', price, image_url || '', category || 'engine', inventory || 0, featured ? 1 : 0],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating product' });
      }
      db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching created product' });
        }
        res.json({ success: true, product: { ...row, featured: row.featured === 1 } });
      });
    }
  );
});

app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, image_url, category, inventory, featured } = req.body;
  
  db.run(
    'UPDATE products SET name = ?, description = ?, price = ?, image_url = ?, category = ?, inventory = ?, featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [name, description || '', price, image_url || '', category || 'engine', inventory || 0, featured ? 1 : 0, id],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating product' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching updated product' });
        }
        res.json({ success: true, product: { ...row, featured: row.featured === 1 } });
      });
    }
  );
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const productId = parseInt(id, 10);
  
  if (isNaN(productId)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID' });
  }
  
  // First, delete any cart items that reference this product
  db.run('DELETE FROM cart_items WHERE product_id = ?', [productId], function(err) {
    if (err) {
      console.error('Error deleting cart items:', err);
      // Continue with product deletion even if cart items deletion fails
    }
    
    // Then delete the product
    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
      if (err) {
        console.error('Error deleting product:', err);
        return res.status(500).json({ success: false, message: 'Error deleting product: ' + err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.json({ success: true, message: 'Product deleted successfully' });
    });
  });
});

// Orders API endpoints
app.get('/api/orders', (req, res) => {
  const { sort } = req.query;
  const orderBy = sort === '-created_date' ? 'ORDER BY created_at DESC' : 'ORDER BY created_at ASC';
  
  db.all(`SELECT * FROM orders ${orderBy}`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching orders' });
    }
    res.json({ success: true, orders: rows });
  });
});

app.post('/api/orders', (req, res) => {
  const { customer_name, customer_email, total, status, payment_method, payment_status, shipping_address, items } = req.body;
  
  if (!customer_name || !customer_email || total === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  db.run(
    'INSERT INTO orders (id, customer_name, customer_email, total, status, payment_method, payment_status, shipping_address, items) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [orderId, customer_name, customer_email, total, status || 'pending', payment_method || 'card', payment_status || 'pending', JSON.stringify(shipping_address), JSON.stringify(items)],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error creating order' });
      }
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching created order' });
        }
        res.json({ success: true, order: row });
      });
    }
  );
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status, payment_status } = req.body;
  
  const updates = [];
  const values = [];
  
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (payment_status !== undefined) {
    updates.push('payment_status = ?');
    values.push(payment_status);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ success: false, message: 'No fields to update' });
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(id);
  
  db.run(
    `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating order' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching updated order' });
        }
        res.json({ success: true, order: row });
      });
    }
  );
});

// Subscribers API endpoints
app.get('/api/subscribers', (req, res) => {
  const { sort } = req.query;
  const orderBy = sort === '-created_date' ? 'ORDER BY subscribed_at DESC' : 'ORDER BY subscribed_at ASC';
  
  db.all(`SELECT * FROM subscribers ${orderBy}`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error fetching subscribers' });
    }
    const subscribers = rows.map(row => ({
      ...row,
      is_active: row.is_active === 1
    }));
    res.json({ success: true, subscribers });
  });
});

app.post('/api/subscribers', (req, res) => {
  const { email, source, is_active, subscribed_at } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }
  
  const subscriberId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  db.run(
    'INSERT INTO subscribers (id, email, source, is_active, subscribed_at) VALUES (?, ?, ?, ?, ?)',
    [subscriberId, email, source || 'website', is_active ? 1 : 0, subscribed_at || new Date().toISOString()],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ success: false, message: 'Email already subscribed' });
        }
        return res.status(500).json({ success: false, message: 'Error creating subscriber' });
      }
      db.get('SELECT * FROM subscribers WHERE id = ?', [subscriberId], (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Error fetching created subscriber' });
        }
        res.json({ success: true, subscriber: { ...row, is_active: row.is_active === 1 } });
      });
    }
  );
});

// 404 handler for API routes (must be after all other API routes)
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Serve static files from dist (production) or public (fallback)
app.use(express.static('dist'));
app.use(express.static('public'));

// Serve the main page (React app)
app.get('*', (req, res) => {
  // Try to serve from dist first (production build), then fallback to public
  const distPath = path.join(__dirname, 'dist', 'index.html');
  const publicPath = path.join(__dirname, 'public', 'index.html');
  
  if (fs.existsSync(distPath)) {
    res.sendFile(distPath);
  } else if (fs.existsSync(publicPath)) {
    res.sendFile(publicPath);
  } else {
    res.status(404).send('Page not found');
  }
});

// Error handling middleware (must be last, after all routes)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  // Only send JSON for API routes
  if (req.path.startsWith('/api')) {
    res.status(err.status || 500).json({ 
      success: false, 
      message: err.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } else {
    res.status(err.status || 500).send('Internal server error');
  }
});

// Graceful shutdown

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Only start the server if not in Vercel (serverless)
// In Vercel, the app is exported and handled by @vercel/node
if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless (must be at the end after all routes are configured)
module.exports = app;
