import os
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from io import BytesIO
import json

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, EmailStr
from pymongo import MongoClient
from passlib.context import CryptContext
from jose import jwt, JWTError
from bson import ObjectId
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

# Environment variables
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "autoparts_ecommerce")
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "autoparts_secret_key_2024")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# MongoDB connection
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

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
    email: EmailStr
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
    sale_type: str = "both"  # detal, mayor, both
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
    source: str = "web"  # web, mercadolibre, marketplace
    notes: str = ""

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None

class ExternalOrderCreate(BaseModel):
    platform: str  # mercadolibre, marketplace
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

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable dict"""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc

def get_now():
    return datetime.now(timezone.utc).isoformat()

# ============== SEED DATA ==============

def seed_initial_data():
    # Seed products if empty
    if db.products.count_documents({}) == 0:
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
        db.products.insert_many(products)
        print("Initial products seeded")

    # Seed bank config if empty
    if db.config.find_one({"type": "bank"}) is None:
        db.config.insert_one({
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
    if db.config.find_one({"type": "company"}) is None:
        db.config.insert_one({
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
    if db.chatbot_responses.count_documents({}) == 0:
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
                "response": "Realizamos envíos a todo el país. El tiempo de entrega depende de tu ubicación. ¿Necesitas más información?",
                "redirect_whatsapp": True,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["pago", "transferencia", "deposito", "depósito"],
                "response": "Aceptamos transferencias bancarias. Puedes ver los datos de nuestra cuenta en la sección de checkout.",
                "redirect_whatsapp": False,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["hola", "buenos dias", "buenas tardes", "buenas noches", "saludos"],
                "response": "¡Hola! Bienvenido a AutoParts Pro. ¿En qué podemos ayudarte hoy?",
                "redirect_whatsapp": False,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["garantia", "garantía", "devolucion", "devolución"],
                "response": "Todos nuestros productos tienen garantía. Para información sobre devoluciones, contacta a nuestro equipo.",
                "redirect_whatsapp": True,
                "active": True,
                "created_at": get_now()
            },
            {
                "keywords": ["mayorista", "mayor", "al mayor", "distribuidor"],
                "response": "¡Tenemos precios especiales para mayoristas! Contacta a nuestro equipo comercial para más información.",
                "redirect_whatsapp": True,
                "active": True,
                "created_at": get_now()
            }
        ]
        db.chatbot_responses.insert_many(responses)
        print("Initial chatbot responses seeded")

# Run seed on startup
seed_initial_data()

# ============== AUTH ENDPOINTS ==============

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user: UserRegister):
    # Validate name
    import re
    name_regex = re.compile(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$")
    if not name_regex.match(user.name):
        raise HTTPException(status_code=400, detail="El nombre solo puede contener letras, espacios, guiones y apóstrofes")
    if len(user.name.strip()) < 2:
        raise HTTPException(status_code=400, detail="El nombre debe tener al menos 2 caracteres")
    
    # Check if email exists
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=409, detail="El email ya está registrado")
    
    # Validate password
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres")
    
    # Create user
    user_doc = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role,
        "created_at": get_now(),
        "updated_at": get_now()
    }
    result = db.users.insert_one(user_doc)
    
    user_response = UserResponse(
        id=str(result.inserted_id),
        name=user.name,
        email=user.email,
        role=user.role,
        created_at=user_doc["created_at"]
    )
    
    token = create_access_token({"sub": user.email, "user_id": str(result.inserted_id)})
    
    return TokenResponse(access_token=token, user=user_response)

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Email o contraseña inválidos")
    
    user_response = UserResponse(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        role=user.get("role", "customer"),
        created_at=user.get("created_at", "")
    )
    
    token = create_access_token({"sub": user["email"], "user_id": str(user["_id"])})
    
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
    if sale_type and sale_type != "all":
        query["$or"] = [{"sale_type": sale_type}, {"sale_type": "both"}]
    if featured is not None:
        query["featured"] = featured
    
    products = list(db.products.find(query).sort("created_at", -1))
    return {"success": True, "products": [serialize_doc(p) for p in products]}

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    try:
        product = db.products.find_one({"_id": ObjectId(product_id)})
    except:
        raise HTTPException(status_code=400, detail="ID de producto inválido")
    
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"success": True, "product": serialize_doc(product)}

@app.post("/api/products")
async def create_product(product: ProductCreate):
    product_doc = product.model_dump()
    product_doc["created_at"] = get_now()
    product_doc["updated_at"] = get_now()
    
    result = db.products.insert_one(product_doc)
    product_doc["id"] = str(result.inserted_id)
    if "_id" in product_doc:
        del product_doc["_id"]
    
    return {"success": True, "product": product_doc}

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate):
    try:
        obj_id = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="ID de producto inválido")
    
    update_data = {k: v for k, v in product.model_dump().items() if v is not None}
    update_data["updated_at"] = get_now()
    
    result = db.products.update_one({"_id": obj_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    updated = db.products.find_one({"_id": obj_id})
    return {"success": True, "product": serialize_doc(updated)}

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str):
    try:
        obj_id = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="ID de producto inválido")
    
    # Delete related cart items
    db.cart_items.delete_many({"product_id": product_id})
    
    result = db.products.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    return {"success": True, "message": "Producto eliminado correctamente"}

# ============== CART ENDPOINTS ==============

@app.get("/api/cart")
async def get_cart(session_id: str = Query(...)):
    items = list(db.cart_items.find({"session_id": session_id}).sort("created_at", -1))
    return {"success": True, "items": [serialize_doc(item) for item in items]}

@app.post("/api/cart")
async def add_to_cart(item: CartItemCreate):
    # Check if item already in cart
    existing = db.cart_items.find_one({
        "session_id": item.session_id,
        "product_id": item.product_id,
        "sale_type": item.sale_type
    })
    
    if existing:
        # Update quantity
        new_qty = existing["quantity"] + item.quantity
        db.cart_items.update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_qty, "updated_at": get_now()}}
        )
        updated = db.cart_items.find_one({"_id": existing["_id"]})
        return {"success": True, "item": serialize_doc(updated)}
    
    item_doc = item.model_dump()
    item_doc["created_at"] = get_now()
    item_doc["updated_at"] = get_now()
    
    result = db.cart_items.insert_one(item_doc)
    item_doc["id"] = str(result.inserted_id)
    if "_id" in item_doc:
        del item_doc["_id"]
    
    return {"success": True, "item": item_doc}

@app.put("/api/cart/{item_id}")
async def update_cart_item(item_id: str, update: CartItemUpdate):
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="ID de item inválido")
    
    if update.quantity <= 0:
        db.cart_items.delete_one({"_id": obj_id})
        return {"success": True, "message": "Item eliminado del carrito"}
    
    result = db.cart_items.update_one(
        {"_id": obj_id},
        {"$set": {"quantity": update.quantity, "updated_at": get_now()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    updated = db.cart_items.find_one({"_id": obj_id})
    return {"success": True, "item": serialize_doc(updated)}

@app.delete("/api/cart/{item_id}")
async def remove_from_cart(item_id: str):
    try:
        obj_id = ObjectId(item_id)
    except:
        raise HTTPException(status_code=400, detail="ID de item inválido")
    
    result = db.cart_items.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    return {"success": True, "message": "Item eliminado del carrito"}

@app.delete("/api/cart/session/{session_id}")
async def clear_cart(session_id: str):
    db.cart_items.delete_many({"session_id": session_id})
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
    
    orders = list(db.orders.find(query).sort("created_at", -1))
    return {"success": True, "orders": [serialize_doc(o) for o in orders]}

@app.get("/api/orders/{order_id}")
async def get_order(order_id: str):
    order = db.orders.find_one({"order_id": order_id})
    if not order:
        try:
            order = db.orders.find_one({"_id": ObjectId(order_id)})
        except:
            pass
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    return {"success": True, "order": serialize_doc(order)}

@app.post("/api/orders")
async def create_order(order: OrderCreate):
    import random
    import string
    
    # Generate order ID
    order_id = f"ORD-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
    
    order_doc = order.model_dump()
    order_doc["order_id"] = order_id
    order_doc["status"] = "pending"
    order_doc["payment_status"] = "pending"
    order_doc["created_at"] = get_now()
    order_doc["updated_at"] = get_now()
    
    result = db.orders.insert_one(order_doc)
    order_doc["id"] = str(result.inserted_id)
    if "_id" in order_doc:
        del order_doc["_id"]
    
    return {"success": True, "order": order_doc}

@app.post("/api/orders/external")
async def create_external_order(order: ExternalOrderCreate):
    import random
    import string
    
    # Generate order ID
    prefix = "ML" if order.platform == "mercadolibre" else "MP"
    order_id = f"{prefix}-{datetime.now().strftime('%Y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=6))}"
    
    order_doc = order.model_dump()
    order_doc["order_id"] = order_id
    order_doc["source"] = order.platform
    order_doc["status"] = "pending"
    order_doc["payment_status"] = "pending"
    order_doc["created_at"] = get_now()
    order_doc["updated_at"] = get_now()
    
    result = db.orders.insert_one(order_doc)
    order_doc["id"] = str(result.inserted_id)
    
    return {"success": True, "order": order_doc}

@app.put("/api/orders/{order_id}")
async def update_order(order_id: str, update: OrderUpdate):
    # Try to find by order_id first
    order = db.orders.find_one({"order_id": order_id})
    if not order:
        try:
            order = db.orders.find_one({"_id": ObjectId(order_id)})
        except:
            pass
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    update_data["updated_at"] = get_now()
    
    db.orders.update_one({"_id": order["_id"]}, {"$set": update_data})
    
    updated = db.orders.find_one({"_id": order["_id"]})
    return {"success": True, "order": serialize_doc(updated)}

# ============== PDF GENERATION ==============

@app.get("/api/orders/{order_id}/pdf")
async def generate_order_pdf(order_id: str, doc_type: str = "ticket"):
    # Find order
    order = db.orders.find_one({"order_id": order_id})
    if not order:
        try:
            order = db.orders.find_one({"_id": ObjectId(order_id)})
        except:
            pass
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Get company config
    company = db.config.find_one({"type": "company"}) or {}
    bank = db.config.find_one({"type": "bank"}) or {}
    
    # Create PDF
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=18, spaceAfter=12)
    normal_style = styles['Normal']
    bold_style = ParagraphStyle('Bold', parent=styles['Normal'], fontName='Helvetica-Bold')
    
    elements = []
    
    # Header
    company_name = company.get("name", "AutoParts Pro")
    elements.append(Paragraph(company_name, title_style))
    
    if company.get("address"):
        elements.append(Paragraph(f"Dirección: {company.get('address')}", normal_style))
    if company.get("phone"):
        elements.append(Paragraph(f"Teléfono: {company.get('phone')}", normal_style))
    if company.get("rif"):
        elements.append(Paragraph(f"RIF: {company.get('rif')}", normal_style))
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Document type
    doc_title = "TICKET DE COMPRA" if doc_type == "ticket" else "NOTA DE ENTREGA"
    elements.append(Paragraph(doc_title, title_style))
    elements.append(Paragraph(f"Nº de Pedido: {order.get('order_id', str(order['_id']))}", bold_style))
    elements.append(Paragraph(f"Fecha: {order.get('created_at', '')[:10]}", normal_style))
    
    elements.append(Spacer(1, 0.2*inch))
    
    # Customer info
    elements.append(Paragraph("DATOS DEL CLIENTE", bold_style))
    elements.append(Paragraph(f"Nombre: {order.get('customer_name', '')}", normal_style))
    elements.append(Paragraph(f"Email: {order.get('customer_email', '')}", normal_style))
    if order.get('customer_phone'):
        elements.append(Paragraph(f"Teléfono: {order.get('customer_phone')}", normal_style))
    
    shipping = order.get('shipping_address', {})
    if shipping:
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph("DIRECCIÓN DE ENVÍO", bold_style))
        address_parts = [
            shipping.get('street', ''),
            shipping.get('city', ''),
            shipping.get('state', ''),
            shipping.get('zip', ''),
            shipping.get('country', '')
        ]
        elements.append(Paragraph(", ".join([p for p in address_parts if p]), normal_style))
    
    elements.append(Spacer(1, 0.2*inch))
    
    # Products table
    elements.append(Paragraph("PRODUCTOS", bold_style))
    
    items = order.get('items', [])
    table_data = [['Producto', 'Tipo', 'Cant.', 'Precio', 'Subtotal']]
    for item in items:
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
    
    # Payment info
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
    
    # Source info
    if order.get('source') and order.get('source') != 'web':
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(f"Origen del pedido: {order.get('source').upper()}", normal_style))
        if order.get('external_order_id'):
            elements.append(Paragraph(f"ID Externo: {order.get('external_order_id')}", normal_style))
    
    # Notes
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
    config = db.config.find_one({"type": "bank"})
    if config:
        config = serialize_doc(config)
    return {"success": True, "config": config or {}}

@app.put("/api/config/bank")
async def update_bank_config(config: BankConfigUpdate):
    update_data = config.model_dump()
    update_data["updated_at"] = get_now()
    
    db.config.update_one(
        {"type": "bank"},
        {"$set": update_data},
        upsert=True
    )
    
    updated = db.config.find_one({"type": "bank"})
    return {"success": True, "config": serialize_doc(updated)}

@app.get("/api/config/company")
async def get_company_config():
    config = db.config.find_one({"type": "company"})
    if config:
        config = serialize_doc(config)
    return {"success": True, "config": config or {}}

@app.put("/api/config/company")
async def update_company_config(config: CompanyConfigUpdate):
    update_data = config.model_dump()
    update_data["updated_at"] = get_now()
    
    db.config.update_one(
        {"type": "company"},
        {"$set": update_data},
        upsert=True
    )
    
    updated = db.config.find_one({"type": "company"})
    return {"success": True, "config": serialize_doc(updated)}

# ============== CHATBOT ENDPOINTS ==============

@app.get("/api/chatbot/responses")
async def get_chatbot_responses():
    responses = list(db.chatbot_responses.find().sort("created_at", -1))
    return {"success": True, "responses": [serialize_doc(r) for r in responses]}

@app.post("/api/chatbot/responses")
async def create_chatbot_response(response: ChatbotResponseCreate):
    doc = response.model_dump()
    doc["created_at"] = get_now()
    
    result = db.chatbot_responses.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    
    return {"success": True, "response": doc}

@app.put("/api/chatbot/responses/{response_id}")
async def update_chatbot_response(response_id: str, response: ChatbotResponseCreate):
    try:
        obj_id = ObjectId(response_id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    update_data = response.model_dump()
    update_data["updated_at"] = get_now()
    
    result = db.chatbot_responses.update_one({"_id": obj_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    
    updated = db.chatbot_responses.find_one({"_id": obj_id})
    return {"success": True, "response": serialize_doc(updated)}

@app.delete("/api/chatbot/responses/{response_id}")
async def delete_chatbot_response(response_id: str):
    try:
        obj_id = ObjectId(response_id)
    except:
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = db.chatbot_responses.delete_one({"_id": obj_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Respuesta no encontrada")
    
    return {"success": True, "message": "Respuesta eliminada"}

@app.post("/api/chatbot/query")
async def query_chatbot(message: dict):
    user_message = message.get("message", "").lower()
    
    # Get company config for WhatsApp number
    company = db.config.find_one({"type": "company"}) or {}
    whatsapp = company.get("whatsapp_number", "")
    
    # Find matching response
    responses = list(db.chatbot_responses.find({"active": True}))
    
    for resp in responses:
        keywords = resp.get("keywords", [])
        if any(kw.lower() in user_message for kw in keywords):
            return {
                "success": True,
                "response": resp.get("response", ""),
                "redirect_whatsapp": resp.get("redirect_whatsapp", False),
                "whatsapp_number": whatsapp if resp.get("redirect_whatsapp") else ""
            }
    
    # Default response
    return {
        "success": True,
        "response": "No entendí tu consulta. ¿Podrías ser más específico? También puedes contactar a nuestro equipo de ventas directamente.",
        "redirect_whatsapp": True,
        "whatsapp_number": whatsapp
    }

# ============== SUBSCRIBERS ENDPOINTS ==============

@app.get("/api/subscribers")
async def get_subscribers():
    subscribers = list(db.subscribers.find().sort("created_at", -1))
    return {"success": True, "subscribers": [serialize_doc(s) for s in subscribers]}

@app.post("/api/subscribers")
async def create_subscriber(subscriber: SubscriberCreate):
    # Check if already subscribed
    if db.subscribers.find_one({"email": subscriber.email}):
        return {"success": True, "message": "Ya estás suscrito"}
    
    doc = subscriber.model_dump()
    doc["is_active"] = True
    doc["created_at"] = get_now()
    
    result = db.subscribers.insert_one(doc)
    doc["id"] = str(result.inserted_id)
    
    return {"success": True, "subscriber": doc}

# ============== STATS ENDPOINTS ==============

@app.get("/api/stats")
async def get_stats():
    total_products = db.products.count_documents({})
    total_orders = db.orders.count_documents({})
    total_subscribers = db.subscribers.count_documents({"is_active": True})
    
    # Calculate revenue
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total"}}}
    ]
    revenue_result = list(db.orders.aggregate(pipeline))
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Orders by status
    orders_by_status = {}
    for status in ["pending", "paid", "shipped", "delivered", "cancelled"]:
        orders_by_status[status] = db.orders.count_documents({"status": status})
    
    # Orders by source
    orders_by_source = {}
    for source in ["web", "mercadolibre", "marketplace"]:
        orders_by_source[source] = db.orders.count_documents({"source": source})
    
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

# ============== REPORTS ENDPOINTS ==============

@app.get("/api/reports/sales")
async def get_sales_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    query = {}
    if start_date:
        query["created_at"] = {"$gte": start_date}
    if end_date:
        if "created_at" in query:
            query["created_at"]["$lte"] = end_date
        else:
            query["created_at"] = {"$lte": end_date}
    
    orders = list(db.orders.find(query).sort("created_at", -1))
    
    total_sales = sum(o.get("total", 0) for o in orders if o.get("payment_status") == "paid")
    total_orders = len(orders)
    paid_orders = len([o for o in orders if o.get("payment_status") == "paid"])
    pending_orders = len([o for o in orders if o.get("payment_status") == "pending"])
    
    return {
        "success": True,
        "report": {
            "total_sales": total_sales,
            "total_orders": total_orders,
            "paid_orders": paid_orders,
            "pending_orders": pending_orders,
            "orders": [serialize_doc(o) for o in orders]
        }
    }

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": get_now()}
