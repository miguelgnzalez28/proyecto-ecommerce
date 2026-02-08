import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from io import BytesIO
import json
import re
import random
import string

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, EmailStr
from passlib.context import CryptContext
from jose import jwt, JWTError
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from db_adapter import get_database, IS_VERCEL

# Environment variables
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "autoparts_secret_key_2024")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Database
db = get_database()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# FastAPI app
app = FastAPI(title="AutoParts E-commerce API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== PYDANTIC MODELS ==============

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "customer"

class UserLogin(BaseModel):
    email: str  # Can be email or username
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class ProductCreate(BaseModel):
    name: str
    description: str = ""
    price: float
    price_wholesale: Optional[float] = None
    image_url: str = ""
    category: str = "engine"
    inventory: int = 0
    featured: bool = False
    sale_type: str = "both"
    min_wholesale_qty: int = 10

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    price_wholesale: Optional[float] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    inventory: Optional[int] = None
    featured: Optional[bool] = None
    sale_type: Optional[str] = None
    min_wholesale_qty: Optional[int] = None

class CartItemCreate(BaseModel):
    product_id: str
    product_name: str
    product_image: str = ""
    product_price: float
    quantity: int = 1
    session_id: str
    sale_type: str = "detal"

class CartItemUpdate(BaseModel):
    quantity: int

class ShippingAddress(BaseModel):
    street: str
    city: str
    state: str
    zip: str
    country: str = "Venezuela"
    phone: str = ""

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    sale_type: str = "detal"

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str = ""
    items: List[OrderItem]
    total: float
    shipping_address: ShippingAddress
    payment_method: str = "bank_transfer"
    source: str = "web"
    notes: str = ""

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None

class ExternalOrderCreate(BaseModel):
    platform: str
    external_order_id: str
    customer_name: str
    customer_email: EmailStr = ""
    customer_phone: str = ""
    items: List[OrderItem]
    total: float
    shipping_address: Optional[ShippingAddress] = None
    notes: str = ""

class BankConfigUpdate(BaseModel):
    bank_name: str
    account_number: str
    account_holder: str
    account_type: str
    identification: str = ""
    phone: str = ""

class CompanyConfigUpdate(BaseModel):
    name: str = ""
    address: str = ""
    phone: str = ""
    email: str = ""
    rif: str = ""
    logo_url: str = ""
    whatsapp_number: str = ""

class ChatbotResponseCreate(BaseModel):
    keywords: List[str]
    response: str
    redirect_whatsapp: bool = False
    active: bool = True

class SubscriberCreate(BaseModel):
    email: EmailStr
    source: str = "website"

# ============== HELPER FUNCTIONS ==============

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def get_now():
    return datetime.now(timezone.utc).isoformat()

def generate_order_id(prefix: str = "ORD"):
    return f"{prefix}-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"

# ============== SEED DATA ==============

async def seed_initial_data():
    """Seed initial data if collections are empty"""
    
    # Seed admin user if no admin exists (for AdminLogin page)
    admin_user = await db.find_one('users', {"role": "admin"})
    if not admin_user:
        admin_doc = {
            "name": "Administrador",
            "email": "admin@autoparts.com",
            "password": hash_password("123456789"),
            "role": "admin",
            "created_at": get_now(),
            "updated_at": get_now()
        }
        await db.insert_one('users', admin_doc)
        print("Admin user created for AdminLogin: username='admin', password='123456789'")
    
    # Seed products if empty
    product_count = await db.count_documents('products')
    if product_count == 0:
        products = [
            {
                "name": "Filtro de Aire Premium",
                "description": "Filtro de aire de alto rendimiento para mejor performance del motor",
                "price": 29.99,
                "price_wholesale": 22.99,
                "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500",
                "category": "engine",
                "inventory": 50,
                "featured": True,
                "sale_type": "both",
                "min_wholesale_qty": 10,
                "created_at": get_now(),
                "updated_at": get_now()
            },
            {
                "name": "Juego de Pastillas de Freno",
                "description": "Pastillas de freno cerámicas para una frenada confiable",
                "price": 89.99,
                "price_wholesale": 69.99,
                "image_url": "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=500",
                "category": "brakes",
                "inventory": 30,
                "featured": True,
                "sale_type": "both",
                "min_wholesale_qty": 5,
                "created_at": get_now(),
                "updated_at": get_now()
            },
            {
                "name": "Juego de Bujías (4 unidades)",
                "description": "Bujías de alto rendimiento para óptimo funcionamiento del motor",
                "price": 49.99,
                "price_wholesale": 37.99,
                "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
                "category": "engine",
                "inventory": 100,
                "featured": False,
                "sale_type": "both",
                "min_wholesale_qty": 20,
                "created_at": get_now(),
                "updated_at": get_now()
            },
            {
                "name": "Neumáticos Todo Terreno (Juego de 4)",
                "description": "Neumáticos premium para conducción todo el año",
                "price": 599.99,
                "price_wholesale": 499.99,
                "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500",
                "category": "tires",
                "inventory": 25,
                "featured": True,
                "sale_type": "both",
                "min_wholesale_qty": 4,
                "created_at": get_now(),
                "updated_at": get_now()
            },
            {
                "name": "Filtro de Aceite",
                "description": "Filtro de aceite de alta calidad para protección del motor",
                "price": 12.99,
                "price_wholesale": 8.99,
                "image_url": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500",
                "category": "engine",
                "inventory": 150,
                "featured": True,
                "sale_type": "both",
                "min_wholesale_qty": 50,
                "created_at": get_now(),
                "updated_at": get_now()
            },
            {
                "name": "Batería de Auto 12V",
                "description": "Batería de servicio pesado con garantía de 3 años",
                "price": 129.99,
                "price_wholesale": 99.99,
                "image_url": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500",
                "category": "electrical",
                "inventory": 20,
                "featured": False,
                "sale_type": "both",
                "min_wholesale_qty": 5,
                "created_at": get_now(),
                "updated_at": get_now()
            },
            {
                "name": "Amortiguadores Traseros (Par)",
                "description": "Amortiguadores de alta calidad para una conducción suave",
                "price": 189.99,
                "price_wholesale": 149.99,
                "image_url": "https://images.unsplash.com/photo-1581719795311-a65c33239f8a?w=500",
                "category": "suspension",
                "inventory": 15,
                "featured": True,
                "sale_type": "both",
                "min_wholesale_qty": 4,
                "created_at": get_now(),
                "updated_at": get_now()
            },
            {
                "name": "Kit de Faros LED",
                "description": "Faros LED de alta intensidad para mejor visibilidad",
                "price": 79.99,
                "price_wholesale": 59.99,
                "image_url": "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500",
                "category": "electrical",
                "inventory": 40,
                "featured": False,
                "sale_type": "both",
                "min_wholesale_qty": 10,
                "created_at": get_now(),
                "updated_at": get_now()
            }
        ]
        await db.insert_many('products', products)
        print("Initial products seeded")

    # Seed bank config if empty
    bank_config = await db.find_one('config', {"type": "bank"})
    if not bank_config:
        await db.insert_one('config', {
            "type": "bank",
            "bank_name": "",
            "account_number": "",
            "account_holder": "",
            "account_type": "",
            "identification": "",
            "phone": "",
            "updated_at": get_now()
        })

    # Seed company config if empty
    company_config = await db.find_one('config', {"type": "company"})
    if not company_config:
        await db.insert_one('config', {
            "type": "company",
            "name": "AutoParts Pro",
            "address": "",
            "phone": "",
            "email": "",
            "rif": "",
            "logo_url": "",
            "whatsapp_number": "",
            "updated_at": get_now()
        })

    # Seed chatbot responses if empty
    chatbot_count = await db.count_documents('chatbot_responses')
    if chatbot_count == 0:
        responses = [
            {
                "keywords": ["precio", "costo", "cuanto", "cuánto"],
                "response": "Para consultar precios específicos, por favor contacta a nuestro equipo de ventas.",
                "redirect_whatsapp": True,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["disponible", "stock", "hay", "tienen"],
                "response": "Para verificar disponibilidad de productos, contacta a nuestro equipo de ventas.",
                "redirect_whatsapp": True,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["envio", "envío", "delivery", "entrega"],
                "response": "Realizamos envíos a todo el país. El tiempo de entrega depende de tu ubicación.",
                "redirect_whatsapp": True,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["hola", "buenos dias", "buenas tardes", "saludos"],
                "response": "¡Hola! Bienvenido a AutoParts Pro. ¿En qué podemos ayudarte hoy?",
                "redirect_whatsapp": False,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["mayorista", "mayor", "al mayor", "distribuidor"],
                "response": "¡Tenemos precios especiales para mayoristas! Contacta a nuestro equipo comercial.",
                "redirect_whatsapp": True,
                "active": True,
                "created_at": get_now()
            }
        ]
        await db.insert_many('chatbot_responses', responses)
        print("Initial chatbot responses seeded")

# Startup event
@app.on_event("startup")
async def startup_event():
    await seed_initial_data()

# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserRegister):
    name_regex = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$")
    if not name_regex.match(user.name):
        raise HTTPException(status_code=400, detail="El nombre solo puede contener letras")
    if len(user.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="El nombre debe tener al menos 2 caracteres")
    
    existing = await db.find_one('users', {"email": user.email})
    if existing:
        raise HTTPException(status_code=409, detail="El email ya está registrado")
    
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
    
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "created_at": get_now(),
        "updated_at": get_now()
    }
    result = await db.insert_one('users', user_doc)
    
    user_response = UserResponse(
        id=result['inserted_id'],
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user_doc["created_at"]
    )
    
    token = create_access_token({"sub": user.email, "user_id": result['inserted_id']})
    return TokenResponse(access_token=token, user=user_response)

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    # Try to find by email first, then by name/username
    user = await db.find_one('users', {"email": credentials.email})
    
    # If not found by email, check if it's the admin username shortcut
    if not user and credentials.email.lower() == 'admin':
        user = await db.find_one('users', {"role": "admin"})
    
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email o contraseña inválidos")
    
    user_response = UserResponse(
        id=user.get('id', ''),
        name=user["name"],
        email=user["email"],
        role=user.get("role", "customer"),
        created_at=user.get("created_at", "")
    )
    
    token = create_access_token({"sub": user["email"], "user_id": user.get('id', '')})
    return TokenResponse(access_token=token, user=user_response)

# ============== PRODUCTS ENDPOINTS ==============

@app.get("/api/products")
async def get_products(
    category: Optional[str] = None,
    sale_type: Optional[str] = None,
    featured: Optional[bool] = None
):
    query = {}
    if category and category != "all":
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    
    products = await db.find('products', query if query else None)
    
    # Filter by sale_type
    if sale_type and sale_type != "all":
        products = [p for p in products if p.get('sale_type') == sale_type or p.get('sale_type') == 'both']
    
    # Sort by created_at desc
    products.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    
    return {"success": True, "products": products}

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    product = await db.find_one('products', {"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"success": True, "product": product}

@app.post("/api/products")
async def create_product(product: ProductCreate):
    product_doc = product.model_dump()
    product_doc["created_at"] = get_now()
    product_doc["updated_at"] = get_now()
    
    result = await db.insert_one('products', product_doc)
    product_doc["id"] = result['inserted_id']
    
    return {"success": True, "product": product_doc}

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate):
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    update_data["updated_at"] = get_now()
    
    result = await db.update_one('products', {"id": product_id}, {"$set": update_data})
    if result['matched_count'] == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    updated = await db.find_one('products', {"id": product_id})
    return {"success": True, "product": updated}

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    await db.delete_many('cart_items', {"product_id": product_id})
    result = await db.delete_one('products', {"id": product_id})
    if result['deleted_count'] == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"success": True, "message": "Producto eliminado correctamente"}

# ============== CART ENDPOINTS ==============

@app.get("/api/cart")
async def get_cart(session_id: str = Query(...)):
    items = await db.find('cart_items', {"session_id": session_id})
    items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return {"success": True, "items": items}

@app.post("/api/cart")
async def add_to_cart(item: CartItemCreate):
    items = await db.find('cart_items', {
        "session_id": item.session_id,
        "product_id": item.product_id,
        "sale_type": item.sale_type
    })
    existing = items[0] if items else None
    
    if existing:
        new_qty = existing["quantity"] + item.quantity
        await db.update_one(
            'cart_items',
            {"id": existing["id"]},
            {"$set": {"quantity": new_qty, "updated_at": get_now()}}
        )
        updated = await db.find_one('cart_items', {"id": existing["id"]})
        return {"success": True, "item": updated}
    
    item_doc = item.model_dump()
    item_doc["created_at"] = get_now()
    item_doc["updated_at"] = get_now()
    
    result = await db.insert_one('cart_items', item_doc)
    item_doc["id"] = result['inserted_id']
    
    return {"success": True, "item": item_doc}

@app.put("/api/cart/{item_id}")
async def update_cart_item(item_id: str, update: CartItemUpdate):
    if update.quantity <= 0:
        await db.delete_one('cart_items', {"id": item_id})
        return {"success": True, "message": "Item eliminado del carrito"}
    
    result = await db.update_one(
        'cart_items',
        {"id": item_id},
        {"$set": {"quantity": update.quantity, "updated_at": get_now()}}
    )
    
    if result['matched_count'] == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    updated = await db.find_one('cart_items', {"id": item_id})
    return {"success": True, "item": updated}

@app.delete("/api/cart/{item_id}")
async def remove_from_cart(item_id: str):
    result = await db.delete_one('cart_items', {"id": item_id})
    if result['deleted_count'] == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    return {"success": True, "message": "Item eliminado del carrito"}

@app.delete("/api/cart/session/{session_id}")
async def clear_cart(session_id: str):
    await db.delete_many('cart_items', {"session_id": session_id})
    return {"success": True, "message": "Carrito vaciado"}

# ============== ORDERS ENDPOINTS ==============

@app.get("/api/orders")
async def get_orders(
    status: Optional[str] = None,
    payment_status: Optional[str] = None,
    source: Optional[str] = None
):
    query = {}
    if status:
        query["status"] = status
    if payment_status:
        query["payment_status"] = payment_status
    if source:
        query["source"] = source
    
    orders = await db.find('orders', query if query else None)
    orders.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return {"success": True, "orders": orders}

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.find_one('orders', {"order_id": order_id})
    if not order:
        order = await db.find_one('orders', {"id": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    return {"success": True, "order": order}

@app.post("/api/orders")
async def create_order(order: OrderCreate):
    order_id = generate_order_id("ORD")
    
    order_doc = order.model_dump()
    order_doc["order_id"] = order_id
    order_doc["status"] = "pending"
    order_doc["payment_status"] = "pending"
    order_doc["created_at"] = get_now()
    order_doc["updated_at"] = get_now()
    
    # Convert shipping_address to dict if it's a model
    if hasattr(order_doc.get('shipping_address'), 'model_dump'):
        order_doc['shipping_address'] = order_doc['shipping_address'].model_dump()
    
    # Convert items to dicts
    order_doc['items'] = [
        item.model_dump() if hasattr(item, 'model_dump') else item 
        for item in order_doc.get('items', [])
    ]
    
    result = await db.insert_one('orders', order_doc)
    order_doc["id"] = result['inserted_id']
    
    return {"success": True, "order": order_doc}

@app.post("/api/orders/external")
async def create_external_order(order: ExternalOrderCreate):
    prefix = "ML" if order.platform == "mercadolibre" else "MP"
    order_id = generate_order_id(prefix)
    
    order_doc = order.model_dump()
    order_doc["order_id"] = order_id
    order_doc["source"] = order.platform
    order_doc["status"] = "pending"
    order_doc["payment_status"] = "pending"
    order_doc["created_at"] = get_now()
    order_doc["updated_at"] = get_now()
    
    # Convert items to dicts
    order_doc['items'] = [
        item.model_dump() if hasattr(item, 'model_dump') else item 
        for item in order_doc.get('items', [])
    ]
    
    result = await db.insert_one('orders', order_doc)
    order_doc["id"] = result['inserted_id']
    
    return {"success": True, "order": order_doc}

@app.put("/api/orders/{order_id}")
async def update_order(order_id: str, update: OrderUpdate):
    order = await db.find_one('orders', {"order_id": order_id})
    if not order:
        order = await db.find_one('orders', {"id": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = get_now()
    
    await db.update_one('orders', {"id": order["id"]}, {"$set": update_data})
    
    updated = await db.find_one('orders', {"id": order["id"]})
    return {"success": True, "order": updated}

# ============== PDF GENERATION ==============

@app.get("/api/orders/{order_id}/pdf")
async def generate_order_pdf(order_id: str, doc_type: str = "ticket"):
    order = await db.find_one('orders', {"order_id": order_id})
    if not order:
        order = await db.find_one('orders', {"id": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    company = await db.find_one('config', {"type": "company"}) or {}
    bank = await db.find_one('config', {"type": "bank"}) or {}
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, spaceAfter=12)
    normal_style = styles['Normal']
    bold_style = ParagraphStyle('Bold', parent=styles['Normal'], fontName='Helvetica-Bold')
    
    elements = []
    
    company_name = company.get("name", "AutoParts Pro")
    elements.append(Paragraph(company_name, title_style))
    
    if company.get("address"):
        elements.append(Paragraph(f"Dirección: {company.get('address')}", normal_style))
    if company.get("phone"):
        elements.append(Paragraph(f"Teléfono: {company.get('phone')}", normal_style))
    if company.get("rif"):
        elements.append(Paragraph(f"RIF: {company.get('rif')}", normal_style))
    
    elements.append(Spacer(1, 0.3*inch))
    
    doc_title = "TICKET DE COMPRA" if doc_type == "ticket" else "NOTA DE ENTREGA"
    elements.append(Paragraph(doc_title, title_style))
    elements.append(Paragraph(f"Nº de Pedido: {order.get('order_id', order.get('id', ''))}", bold_style))
    elements.append(Paragraph(f"Fecha: {order.get('created_at', '')[:10]}", normal_style))
    
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph("DATOS DEL CLIENTE", bold_style))
    elements.append(Paragraph(f"Nombre: {order.get('customer_name', '')}", normal_style))
    elements.append(Paragraph(f"Email: {order.get('customer_email', '')}", normal_style))
    if order.get('customer_phone'):
        elements.append(Paragraph(f"Teléfono: {order.get('customer_phone')}", normal_style))
    
    shipping = order.get('shipping_address', {})
    if shipping:
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("DIRECCIÓN DE ENVÍO", bold_style))
        if isinstance(shipping, dict):
            address_parts = [
                shipping.get('street', ''),
                shipping.get('city', ''),
                shipping.get('state', ''),
                shipping.get('zip', ''),
                shipping.get('country', '')
            ]
            elements.append(Paragraph(", ".join([p for p in address_parts if p]), normal_style))
    
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph("PRODUCTOS", bold_style))
    
    items = order.get('items', [])
    table_data = [['Producto', 'Tipo', 'Cant.', 'Precio', 'Subtotal']]
    for item in items:
        if isinstance(item, dict):
            subtotal = item.get('price', 0) * item.get('quantity', 1)
            table_data.append([
                item.get('product_name', ''),
                item.get('sale_type', 'detal').capitalize(),
                str(item.get('quantity', 1)),
                f"${item.get('price', 0):.2f}",
                f"${subtotal:.2f}"
            ])
    
    table_data.append(['', '', '', 'TOTAL:', f"${order.get('total', 0):.2f}"])
    
    table = Table(table_data, colWidths=[2.5*inch, 0.8*inch, 0.6*inch, 1*inch, 1*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -2), 0.5, colors.grey),
        ('FONTNAME', (3, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    elements.append(table)
    
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph("INFORMACIÓN DE PAGO", bold_style))
    elements.append(Paragraph(f"Método: {order.get('payment_method', 'Transferencia bancaria')}", normal_style))
    elements.append(Paragraph(f"Estado: {order.get('payment_status', 'pendiente').upper()}", normal_style))
    
    if bank.get('bank_name'):
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("DATOS BANCARIOS", bold_style))
        elements.append(Paragraph(f"Banco: {bank.get('bank_name')}", normal_style))
        elements.append(Paragraph(f"Cuenta: {bank.get('account_number')}", normal_style))
        elements.append(Paragraph(f"Titular: {bank.get('account_holder')}", normal_style))
        elements.append(Paragraph(f"Tipo: {bank.get('account_type')}", normal_style))
        if bank.get('identification'):
            elements.append(Paragraph(f"Cédula/RIF: {bank.get('identification')}", normal_style))
    
    if order.get('source') and order.get('source') != 'web':
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(f"Origen del pedido: {order.get('source').upper()}", normal_style))
        if order.get('external_order_id'):
            elements.append(Paragraph(f"ID Externo: {order.get('external_order_id')}", normal_style))
    
    if order.get('notes'):
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("NOTAS", bold_style))
        elements.append(Paragraph(order.get('notes'), normal_style))
    
    doc.build(elements)
    buffer.seek(0)
    
    filename = f"{doc_type}_{order.get('order_id', order_id)}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ============== CONFIG ENDPOINTS ==============

@app.get("/api/config/bank")
async def get_bank_config():
    config = await db.find_one('config', {"type": "bank"})
    return {"success": True, "config": config or {}}

@app.put("/api/config/bank")
async def update_bank_config(config: BankConfigUpdate):
    update_data = config.model_dump()
    update_data["updated_at"] = get_now()
    update_data["type"] = "bank"
    
    await db.update_one('config', {"type": "bank"}, {"$set": update_data}, upsert=True)
    
    updated = await db.find_one('config', {"type": "bank"})
    return {"success": True, "config": updated}

@app.get("/api/config/company")
async def get_company_config():
    config = await db.find_one('config', {"type": "company"})
    return {"success": True, "config": config or {}}

@app.put("/api/config/company")
async def update_company_config(config: CompanyConfigUpdate):
    update_data = config.model_dump()
    update_data["updated_at"] = get_now()
    update_data["type"] = "company"
    
    await db.update_one('config', {"type": "company"}, {"$set": update_data}, upsert=True)
    
    updated = await db.find_one('config', {"type": "company"})
    return {"success": True, "config": updated}

# ============== CHATBOT ENDPOINTS ==============

@app.get("/api/chatbot/responses")
async def get_chatbot_responses():
    responses = await db.find('chatbot_responses')
    responses.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return {"success": True, "responses": responses}

@app.post("/api/chatbot/responses")
async def create_chatbot_response(response: ChatbotResponseCreate):
    doc = response.model_dump()
    doc["created_at"] = get_now()
    
    result = await db.insert_one('chatbot_responses', doc)
    doc["id"] = result['inserted_id']
    
    return {"success": True, "response": doc}

@app.put("/api/chatbot/responses/{response_id}")
async def update_chatbot_response(response_id: str, response: ChatbotResponseCreate):
    update_data = response.model_dump()
    update_data["updated_at"] = get_now()
    
    result = await db.update_one('chatbot_responses', {"id": response_id}, {"$set": update_data})
    if result['matched_count'] == 0:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    
    updated = await db.find_one('chatbot_responses', {"id": response_id})
    return {"success": True, "response": updated}

@app.delete("/api/chatbot/responses/{response_id}")
async def delete_chatbot_response(response_id: str):
    result = await db.delete_one('chatbot_responses', {"id": response_id})
    if result['deleted_count'] == 0:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    return {"success": True, "message": "Respuesta eliminada"}

@app.post("/api/chatbot/query")
async def query_chatbot(message: dict):
    user_message = message.get("message", "").lower()
    
    company = await db.find_one('config', {"type": "company"}) or {}
    whatsapp = company.get("whatsapp_number", "")
    
    responses = await db.find('chatbot_responses', {"active": True})
    
    for resp in responses:
        keywords = resp.get("keywords", [])
        if any(kw.lower() in user_message for kw in keywords):
            return {
                "success": True,
                "response": resp.get("response", ""),
                "redirect_whatsapp": resp.get("redirect_whatsapp", False),
                "whatsapp_number": whatsapp if resp.get("redirect_whatsapp") else ""
            }
    
    return {
        "success": True,
        "response": "No entendí tu consulta. ¿Podrías ser más específico?",
        "redirect_whatsapp": True,
        "whatsapp_number": whatsapp
    }

# ============== SUBSCRIBERS ENDPOINTS ==============

@app.get("/api/subscribers")
async def get_subscribers():
    subscribers = await db.find('subscribers')
    subscribers.sort(key=lambda x: x.get('created_at', ''), reverse=True)
    return {"success": True, "subscribers": subscribers}

@app.post("/api/subscribers")
async def create_subscriber(subscriber: SubscriberCreate):
    existing = await db.find_one('subscribers', {"email": subscriber.email})
    if existing:
        return {"success": True, "message": "Ya estás suscrito"}
    
    doc = subscriber.model_dump()
    doc["is_active"] = True
    doc["created_at"] = get_now()
    
    result = await db.insert_one('subscribers', doc)
    doc["id"] = result['inserted_id']
    
    return {"success": True, "subscriber": doc}

# ============== STATS ENDPOINTS ==============

@app.get("/api/stats")
async def get_stats():
    total_products = await db.count_documents('products')
    total_orders = await db.count_documents('orders')
    total_subscribers = await db.count_documents('subscribers', {"is_active": True})
    
    # Calculate revenue
    paid_orders = await db.find('orders', {"payment_status": "paid"})
    total_revenue = sum(o.get('total', 0) for o in paid_orders)
    
    # Orders by status
    orders_by_status = {}
    for status in ["pending", "paid", "shipped", "delivered", "cancelled"]:
        orders_by_status[status] = await db.count_documents('orders', {"status": status})
    
    # Orders by source
    orders_by_source = {}
    for source in ["web", "mercadolibre", "marketplace"]:
        orders_by_source[source] = await db.count_documents('orders', {"source": source})
    
    return {
        "success": True,
        "stats": {
            "total_products": total_products,
            "total_orders": total_orders,
            "total_subscribers": total_subscribers,
            "total_revenue": total_revenue,
            "orders_by_status": orders_by_status,
            "orders_by_source": orders_by_source
        }
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": get_now(), "database": "vercel_blob" if IS_VERCEL else "mongodb"}
