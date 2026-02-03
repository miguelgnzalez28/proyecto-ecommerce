// Base44 API Client
// This is a mock implementation - replace with your actual base44 API client

const baseUrl = '/api';

class Base44Client {
  entities = {
    Product: {
      async list() {
        try {
          const response = await fetch(`${baseUrl}/products`);
          if (!response.ok) {
            // Fallback to mock data
            return this._getMockProducts();
          }
          const data = await response.json();
          return data.products || data || [];
        } catch (error) {
          console.error('Error fetching products:', error);
          // Return empty array instead of mock data when API fails
          return [];
        }
      },
      async create(data) {
        try {
          const response = await fetch(`${baseUrl}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.product || result;
        } catch (error) {
          console.error('Error creating product:', error);
          throw error;
        }
      },
      async update(id, data) {
        try {
          const response = await fetch(`${baseUrl}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.product || result;
        } catch (error) {
          console.error('Error updating product:', error);
          throw error;
        }
      },
      async delete(id) {
        try {
          const response = await fetch(`${baseUrl}/products/${id}`, {
            method: 'DELETE',
          });
          return await response.json();
        } catch (error) {
          console.error('Error deleting product:', error);
          throw error;
        }
      },
      _getMockProducts() {
        // Mock products - replace with actual API call
        return [
          {
            id: 1,
            name: 'Premium Headphones',
            price: 299.99,
            image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
            category: 'electronics',
            inventory: 50,
            featured: true,
          },
          {
            id: 2,
            name: 'Smart Watch',
            price: 399.99,
            image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
            category: 'electronics',
            inventory: 30,
            featured: true,
          },
          {
            id: 3,
            name: 'Designer Sunglasses',
            price: 199.99,
            image_url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
            category: 'accessories',
            inventory: 100,
            featured: false,
          },
          {
            id: 4,
            name: 'Leather Jacket',
            price: 599.99,
            image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
            category: 'clothing',
            inventory: 25,
            featured: false,
          },
          {
            id: 5,
            name: 'Luxury Watch',
            price: 1299.99,
            image_url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500',
            category: 'accessories',
            inventory: 15,
            featured: true,
          },
          {
            id: 6,
            name: 'Designer Handbag',
            price: 899.99,
            image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500',
            category: 'accessories',
            inventory: 20,
            featured: false,
          },
        ];
      },
    },
    Order: {
      async list(sort = '-created_date') {
        try {
          const response = await fetch(`${baseUrl}/orders${sort ? `?sort=${sort}` : ''}`);
          if (!response.ok) {
            return this._getMockOrders();
          }
          const data = await response.json();
          return data.orders || data || [];
        } catch (error) {
          console.error('Error fetching orders:', error);
          return this._getMockOrders();
        }
      },
      async create(data) {
        try {
          const response = await fetch(`${baseUrl}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.order || result;
        } catch (error) {
          console.error('Error creating order:', error);
          throw error;
        }
      },
      async update(id, data) {
        try {
          const response = await fetch(`${baseUrl}/orders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.order || result;
        } catch (error) {
          console.error('Error updating order:', error);
          throw error;
        }
      },
      _getMockOrders() {
        return [
          {
            id: 'ord_1234567890',
            customer_name: 'John Doe',
            customer_email: 'john@example.com',
            total: 1299.99,
            status: 'paid',
            payment_method: 'credit_card',
            created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'ord_0987654321',
            customer_name: 'Jane Smith',
            customer_email: 'jane@example.com',
            total: 599.99,
            status: 'shipped',
            payment_method: 'paypal',
            created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
      },
    },
    EmailSubscriber: {
      async list(sort = '-created_date') {
        try {
          const response = await fetch(`${baseUrl}/subscribers${sort ? `?sort=${sort}` : ''}`);
          if (!response.ok) {
            return this._getMockSubscribers();
          }
          const data = await response.json();
          return data.subscribers || data || [];
        } catch (error) {
          console.error('Error fetching subscribers:', error);
          return this._getMockSubscribers();
        }
      },
      async create(data) {
        try {
          const response = await fetch(`${baseUrl}/subscribers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.subscriber || result;
        } catch (error) {
          console.error('Error creating subscriber:', error);
          throw error;
        }
      },
      _getMockSubscribers() {
        return [
          {
            id: 'sub_1',
            email: 'subscriber1@example.com',
            source: 'website',
            is_active: true,
            subscribed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'sub_2',
            email: 'subscriber2@example.com',
            source: 'checkout',
            is_active: true,
            subscribed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ];
      },
    },
    CartItem: {
      async filter({ session_id }) {
        try {
          const response = await fetch(`${baseUrl}/cart?session_id=${session_id}`);
          if (!response.ok) return [];
          const data = await response.json();
          return data.items || [];
        } catch (error) {
          console.error('Error fetching cart items:', error);
          return [];
        }
      },
      async create(data) {
        try {
          const response = await fetch(`${baseUrl}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.item || result;
        } catch (error) {
          console.error('Error creating cart item:', error);
          throw error;
        }
      },
      async update(id, data) {
        try {
          const response = await fetch(`${baseUrl}/cart/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();
          return result.item || result;
        } catch (error) {
          console.error('Error updating cart item:', error);
          throw error;
        }
      },
      async delete(id) {
        try {
          const response = await fetch(`${baseUrl}/cart/${id}`, {
            method: 'DELETE',
          });
          return await response.json();
        } catch (error) {
          console.error('Error deleting cart item:', error);
          throw error;
        }
      },
    },
  };

  auth = {
    async isAuthenticated() {
      // For now, always return true - implement actual auth check later
      // You can check localStorage, cookies, or make an API call
      return true;
    },
    redirectToLogin(returnUrl) {
      // Implement actual login redirect logic
      // For now, just log it
      console.log('Redirect to login with return URL:', returnUrl);
      // window.location.href = `/login?return=${encodeURIComponent(returnUrl)}`;
    },
  };
}

export const base44 = new Base44Client();
