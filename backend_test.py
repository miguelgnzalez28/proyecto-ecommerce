#!/usr/bin/env python3
"""
AutoParts E-commerce Backend API Test Suite
Tests all endpoints for the auto parts e-commerce application
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, Optional

class AutoPartsAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.session_id = f"test_session_{int(datetime.now().timestamp())}"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_user = {
            "name": "Test User AutoParts",
            "email": "test@autoparts.com",
            "password": "password123"
        }
        
        self.test_product = {
            "name": "Test Product Filter",
            "description": "Test product for API testing",
            "price": 25.99,
            "price_wholesale": 19.99,
            "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500",
            "category": "engine",
            "inventory": 100,
            "featured": True,
            "sale_type": "both",
            "min_wholesale_qty": 10
        }

    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200, use_auth: bool = False) -> tuple[bool, Dict]:
        """Make HTTP request and return success status and response data"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if use_auth and self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=data)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}
            
            return success, response_data
            
        except Exception as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test health endpoint"""
        success, data = self.make_request('GET', 'health')
        self.log_test("Health Check", success and data.get('status') == 'healthy', 
                     f"Response: {data}")

    def test_user_registration(self):
        """Test user registration"""
        success, data = self.make_request('POST', 'auth/register', self.test_user, 201)
        if success and data.get('access_token'):
            self.token = data['access_token']
            self.user_id = data.get('user', {}).get('id')
            self.log_test("User Registration", True, f"User ID: {self.user_id}")
        else:
            # Try to login if user already exists
            success, data = self.make_request('POST', 'auth/login', {
                "email": self.test_user["email"],
                "password": self.test_user["password"]
            })
            if success and data.get('access_token'):
                self.token = data['access_token']
                self.user_id = data.get('user', {}).get('id')
                self.log_test("User Registration", True, "User already exists, logged in instead")
            else:
                self.log_test("User Registration", False, f"Failed: {data}")

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": self.test_user["email"],
            "password": self.test_user["password"]
        }
        success, data = self.make_request('POST', 'auth/login', login_data)
        if success and data.get('access_token'):
            self.token = data['access_token']
            self.user_id = data.get('user', {}).get('id')
            self.log_test("User Login", True, f"Token received, User: {data.get('user', {}).get('name')}")
        else:
            self.log_test("User Login", False, f"Failed: {data}")

    def test_products_list(self):
        """Test products listing"""
        success, data = self.make_request('GET', 'products')
        products = data.get('products', []) if success else []
        self.log_test("Products List", success and isinstance(products, list), 
                     f"Found {len(products)} products")
        return products

    def test_products_filtering(self):
        """Test product filtering"""
        # Test category filter
        success, data = self.make_request('GET', 'products', {'category': 'engine'})
        engine_products = data.get('products', []) if success else []
        self.log_test("Products Filter by Category", success, 
                     f"Engine products: {len(engine_products)}")
        
        # Test sale type filter
        success, data = self.make_request('GET', 'products', {'sale_type': 'detal'})
        detal_products = data.get('products', []) if success else []
        self.log_test("Products Filter by Sale Type", success, 
                     f"Detal products: {len(detal_products)}")
        
        # Test featured filter
        success, data = self.make_request('GET', 'products', {'featured': True})
        featured_products = data.get('products', []) if success else []
        self.log_test("Products Filter by Featured", success, 
                     f"Featured products: {len(featured_products)}")

    def test_cart_operations(self):
        """Test cart operations"""
        # Get products first
        success, data = self.make_request('GET', 'products')
        products = data.get('products', []) if success else []
        
        if not products:
            self.log_test("Cart Operations", False, "No products available for cart testing")
            return
        
        test_product = products[0]
        
        # Add to cart
        cart_item = {
            "product_id": test_product['id'],
            "product_name": test_product['name'],
            "product_image": test_product.get('image_url', ''),
            "product_price": test_product['price'],
            "quantity": 2,
            "session_id": self.session_id,
            "sale_type": "detal"
        }
        
        success, data = self.make_request('POST', 'cart', cart_item)
        cart_item_id = data.get('item', {}).get('id') if success else None
        self.log_test("Add to Cart", success and cart_item_id, 
                     f"Added item ID: {cart_item_id}")
        
        # Get cart
        success, data = self.make_request('GET', 'cart', {'session_id': self.session_id})
        cart_items = data.get('items', []) if success else []
        self.log_test("Get Cart", success and len(cart_items) > 0, 
                     f"Cart has {len(cart_items)} items")
        
        if cart_item_id:
            # Update cart item
            success, data = self.make_request('PUT', f'cart/{cart_item_id}', {'quantity': 3})
            self.log_test("Update Cart Item", success, f"Updated quantity to 3")
            
            # Remove from cart
            success, data = self.make_request('DELETE', f'cart/{cart_item_id}')
            self.log_test("Remove from Cart", success, "Item removed")

    def test_orders_operations(self):
        """Test order operations"""
        # First add item to cart
        success, data = self.make_request('GET', 'products')
        products = data.get('products', []) if success else []
        
        if not products:
            self.log_test("Orders Operations", False, "No products available for order testing")
            return
        
        test_product = products[0]
        
        # Create order
        order_data = {
            "customer_name": "Test Customer",
            "customer_email": "test@customer.com",
            "customer_phone": "+58424123456",
            "items": [{
                "product_id": test_product['id'],
                "product_name": test_product['name'],
                "quantity": 1,
                "price": test_product['price'],
                "sale_type": "detal"
            }],
            "total": test_product['price'],
            "shipping_address": {
                "street": "Test Street 123",
                "city": "Caracas",
                "state": "Miranda",
                "zip": "1010",
                "country": "Venezuela",
                "phone": "+58424123456"
            },
            "payment_method": "bank_transfer",
            "source": "web",
            "notes": "Test order"
        }
        
        success, data = self.make_request('POST', 'orders', order_data)
        order_id = data.get('order', {}).get('order_id') if success else None
        self.log_test("Create Order", success and order_id, 
                     f"Created order: {order_id}")
        
        # Get orders
        success, data = self.make_request('GET', 'orders')
        orders = data.get('orders', []) if success else []
        self.log_test("Get Orders", success and len(orders) > 0, 
                     f"Found {len(orders)} orders")
        
        if order_id:
            # Get specific order
            success, data = self.make_request('GET', f'orders/{order_id}')
            self.log_test("Get Specific Order", success, f"Retrieved order {order_id}")
            
            # Update order status
            success, data = self.make_request('PUT', f'orders/{order_id}', 
                                            {'status': 'paid', 'payment_status': 'paid'})
            self.log_test("Update Order Status", success, "Order marked as paid")

    def test_external_orders(self):
        """Test external order creation"""
        external_order = {
            "platform": "mercadolibre",
            "external_order_id": "ML123456789",
            "customer_name": "External Customer",
            "customer_email": "external@customer.com",
            "customer_phone": "+58424987654",
            "items": [{
                "product_id": "external",
                "product_name": "External Product",
                "quantity": 1,
                "price": 50.00,
                "sale_type": "detal"
            }],
            "total": 50.00,
            "notes": "Order from MercadoLibre"
        }
        
        success, data = self.make_request('POST', 'orders/external', external_order)
        order_id = data.get('order', {}).get('order_id') if success else None
        self.log_test("Create External Order", success and order_id, 
                     f"Created external order: {order_id}")

    def test_config_operations(self):
        """Test configuration operations"""
        # Test bank config
        bank_config = {
            "bank_name": "Banco Test",
            "account_number": "0123456789",
            "account_holder": "AutoParts Pro C.A.",
            "account_type": "Corriente",
            "identification": "J-12345678-9",
            "phone": "+58212123456"
        }
        
        success, data = self.make_request('PUT', 'config/bank', bank_config)
        self.log_test("Update Bank Config", success, "Bank configuration updated")
        
        success, data = self.make_request('GET', 'config/bank')
        self.log_test("Get Bank Config", success and data.get('config', {}).get('bank_name'), 
                     f"Bank: {data.get('config', {}).get('bank_name', 'Not set')}")
        
        # Test company config
        company_config = {
            "name": "AutoParts Pro Test",
            "address": "Test Address 123, Caracas",
            "phone": "+58212654321",
            "email": "info@autopartstest.com",
            "rif": "J-98765432-1",
            "whatsapp_number": "+58424123456"
        }
        
        success, data = self.make_request('PUT', 'config/company', company_config)
        self.log_test("Update Company Config", success, "Company configuration updated")
        
        success, data = self.make_request('GET', 'config/company')
        self.log_test("Get Company Config", success and data.get('config', {}).get('name'), 
                     f"Company: {data.get('config', {}).get('name', 'Not set')}")

    def test_chatbot_operations(self):
        """Test chatbot operations"""
        # Get existing responses
        success, data = self.make_request('GET', 'chatbot/responses')
        responses = data.get('responses', []) if success else []
        self.log_test("Get Chatbot Responses", success, 
                     f"Found {len(responses)} chatbot responses")
        
        # Test chatbot query
        test_queries = [
            "hola",
            "precio",
            "disponible",
            "envio",
            "pago",
            "garantia",
            "mayorista"
        ]
        
        for query in test_queries:
            success, data = self.make_request('POST', 'chatbot/query', {'message': query})
            response_text = data.get('response', '') if success else ''
            self.log_test(f"Chatbot Query: '{query}'", success and response_text, 
                         f"Response: {response_text[:50]}...")

    def test_stats_endpoint(self):
        """Test statistics endpoint"""
        success, data = self.make_request('GET', 'stats')
        stats = data.get('stats', {}) if success else {}
        self.log_test("Get Statistics", success and 'total_products' in stats, 
                     f"Products: {stats.get('total_products', 0)}, Orders: {stats.get('total_orders', 0)}")

    def test_subscribers_operations(self):
        """Test subscribers operations"""
        # Create subscriber
        subscriber_data = {
            "email": "test.subscriber@autoparts.com",
            "source": "website"
        }
        
        success, data = self.make_request('POST', 'subscribers', subscriber_data)
        self.log_test("Create Subscriber", success, "Subscriber created")
        
        # Get subscribers
        success, data = self.make_request('GET', 'subscribers')
        subscribers = data.get('subscribers', []) if success else []
        self.log_test("Get Subscribers", success, f"Found {len(subscribers)} subscribers")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting AutoParts E-commerce API Tests")
        print("=" * 50)
        
        # Basic connectivity
        self.test_health_check()
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        
        # Product tests
        self.test_products_list()
        self.test_products_filtering()
        
        # Cart tests
        self.test_cart_operations()
        
        # Order tests
        self.test_orders_operations()
        self.test_external_orders()
        
        # Configuration tests
        self.test_config_operations()
        
        # Chatbot tests
        self.test_chatbot_operations()
        
        # Statistics tests
        self.test_stats_endpoint()
        
        # Subscribers tests
        self.test_subscribers_operations()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test runner"""
    tester = AutoPartsAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())