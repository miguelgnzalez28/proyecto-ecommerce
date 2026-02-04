// AutoParts API Client

const getBaseUrl = () => {
  // Use environment variable or default to relative path
  return import.meta.env.VITE_API_URL || '';
};

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Request failed');
    }
    return data;
  }
  if (!response.ok) {
    throw new Error('Request failed');
  }
  return response;
};

export const api = {
  // Auth
  auth: {
    async register(data) {
      const response = await fetch(`${getBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
    async login(data) {
      const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },
  },

  // Products
  products: {
    async list(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${getBaseUrl()}/api/products?${queryString}` : `${getBaseUrl()}/api/products`;
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.products || [];
    },
    async get(id) {
      const response = await fetch(`${getBaseUrl()}/api/products/${id}`);
      const data = await handleResponse(response);
      return data.product;
    },
    async create(data) {
      const response = await fetch(`${getBaseUrl()}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.product;
    },
    async update(id, data) {
      const response = await fetch(`${getBaseUrl()}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.product;
    },
    async delete(id) {
      const response = await fetch(`${getBaseUrl()}/api/products/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
  },

  // Cart
  cart: {
    async get(sessionId) {
      const response = await fetch(`${getBaseUrl()}/api/cart?session_id=${sessionId}`);
      const data = await handleResponse(response);
      return data.items || [];
    },
    async add(data) {
      const response = await fetch(`${getBaseUrl()}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.item;
    },
    async update(id, data) {
      const response = await fetch(`${getBaseUrl()}/api/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.item;
    },
    async remove(id) {
      const response = await fetch(`${getBaseUrl()}/api/cart/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
    async clear(sessionId) {
      const response = await fetch(`${getBaseUrl()}/api/cart/session/${sessionId}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
  },

  // Orders
  orders: {
    async list(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${getBaseUrl()}/api/orders?${queryString}` : `${getBaseUrl()}/api/orders`;
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.orders || [];
    },
    async get(id) {
      const response = await fetch(`${getBaseUrl()}/api/orders/${id}`);
      const data = await handleResponse(response);
      return data.order;
    },
    async create(data) {
      const response = await fetch(`${getBaseUrl()}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.order;
    },
    async createExternal(data) {
      const response = await fetch(`${getBaseUrl()}/api/orders/external`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.order;
    },
    async update(id, data) {
      const response = await fetch(`${getBaseUrl()}/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.order;
    },
    getPdfUrl(orderId, docType = 'ticket') {
      return `${getBaseUrl()}/api/orders/${orderId}/pdf?doc_type=${docType}`;
    },
  },

  // Config
  config: {
    async getBank() {
      const response = await fetch(`${getBaseUrl()}/api/config/bank`);
      const data = await handleResponse(response);
      return data.config || {};
    },
    async updateBank(data) {
      const response = await fetch(`${getBaseUrl()}/api/config/bank`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.config;
    },
    async getCompany() {
      const response = await fetch(`${getBaseUrl()}/api/config/company`);
      const data = await handleResponse(response);
      return data.config || {};
    },
    async updateCompany(data) {
      const response = await fetch(`${getBaseUrl()}/api/config/company`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.config;
    },
  },

  // Chatbot
  chatbot: {
    async getResponses() {
      const response = await fetch(`${getBaseUrl()}/api/chatbot/responses`);
      const data = await handleResponse(response);
      return data.responses || [];
    },
    async createResponse(data) {
      const response = await fetch(`${getBaseUrl()}/api/chatbot/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.response;
    },
    async updateResponse(id, data) {
      const response = await fetch(`${getBaseUrl()}/api/chatbot/responses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.response;
    },
    async deleteResponse(id) {
      const response = await fetch(`${getBaseUrl()}/api/chatbot/responses/${id}`, {
        method: 'DELETE',
      });
      return handleResponse(response);
    },
    async query(message) {
      const response = await fetch(`${getBaseUrl()}/api/chatbot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return handleResponse(response);
    },
  },

  // Subscribers
  subscribers: {
    async list() {
      const response = await fetch(`${getBaseUrl()}/api/subscribers`);
      const data = await handleResponse(response);
      return data.subscribers || [];
    },
    async create(data) {
      const response = await fetch(`${getBaseUrl()}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await handleResponse(response);
      return result.subscriber;
    },
  },

  // Stats
  stats: {
    async get() {
      const response = await fetch(`${getBaseUrl()}/api/stats`);
      const data = await handleResponse(response);
      return data.stats || {};
    },
  },

  // Reports
  reports: {
    async getSales(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${getBaseUrl()}/api/reports/sales?${queryString}` : `${getBaseUrl()}/api/reports/sales`;
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.report || {};
    },
  },
};

// Keep backward compatibility with base44
export const base44 = {
  entities: {
    Product: {
      async list() { return api.products.list(); },
      async create(data) { return api.products.create(data); },
      async update(id, data) { return api.products.update(id, data); },
      async delete(id) { return api.products.delete(id); },
    },
    Order: {
      async list(sort) { return api.orders.list(); },
      async create(data) { return api.orders.create(data); },
      async update(id, data) { return api.orders.update(id, data); },
    },
    EmailSubscriber: {
      async list() { return api.subscribers.list(); },
      async create(data) { return api.subscribers.create(data); },
    },
    CartItem: {
      async filter({ session_id }) { return api.cart.get(session_id); },
      async create(data) { return api.cart.add(data); },
      async update(id, data) { return api.cart.update(id, data); },
      async delete(id) { return api.cart.remove(id); },
    },
  },
};

export default api;
