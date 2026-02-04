# Prompt para Replicar el Proyecto E-commerce de Auto Parts

## Descripción General del Proyecto

Crea una aplicación e-commerce completa de React para la venta de repuestos y piezas de automóviles. La aplicación debe tener un diseño moderno con Tailwind CSS, animaciones con Framer Motion, y un backend Express.js con SQLite para desarrollo local y soporte para Vercel Blob Storage en producción.

## Stack Tecnológico

### Frontend
- **React 18.2.0** con **React Router DOM 6.20.0** para navegación
- **Vite 5.0.8** como build tool
- **Tailwind CSS 3.3.6** para estilos
- **Framer Motion 10.16.5** para animaciones
- **Lucide React 0.294.0** para iconos
- **React Query (@tanstack/react-query 5.12.0)** para manejo de datos
- **date-fns 4.1.0** para manejo de fechas

### Backend
- **Express.js 4.18.2** como servidor
- **SQLite3 5.1.6** para base de datos local
- **@vercel/blob 2.0.1** para almacenamiento en producción (Vercel)
- **@vercel/postgres 0.10.0** (opcional, deprecado pero incluido)
- **@vercel/node 5.5.28** para funciones serverless

### Desarrollo
- **Nodemon 3.0.1** para hot reload del servidor
- **TypeScript types** para React y React DOM

## Estructura del Proyecto

```
proyecto-ecommerce/
├── api/
│   └── server.js                    # Wrapper serverless para Vercel
├── public/
│   ├── app.js                       # Código vanilla JS legacy
│   ├── index.html
│   └── styles.css
├── src/
│   ├── api/
│   │   └── base44Client.js         # Cliente API mock
│   ├── components/
│   │   ├── shop/
│   │   │   ├── CartDrawer.jsx      # Drawer del carrito
│   │   │   ├── CategoryGrid.jsx     # Grid de categorías
│   │   │   ├── FeaturedProducts.jsx # Productos destacados
│   │   │   ├── Footer.jsx           # Footer
│   │   │   ├── HeroSection.jsx     # Sección hero
│   │   │   ├── NewsletterForm.jsx  # Formulario newsletter
│   │   │   └── ProductCard.jsx     # Tarjeta de producto
│   │   ├── ui/                      # Componentes UI reutilizables
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── radio-group.jsx
│   │   │   ├── select.jsx
│   │   │   ├── sheet.jsx
│   │   │   ├── skeleton.jsx
│   │   │   ├── switch.jsx
│   │   │   ├── table.jsx
│   │   │   ├── tabs.jsx
│   │   │   ├── textarea.jsx
│   │   │   └── toaster.jsx
│   │   └── UserNotRegisteredError.jsx
│   ├── lib/
│   │   ├── AuthContext.jsx          # Context de autenticación
│   │   ├── db.js                    # Adaptador de base de datos
│   │   ├── NavigationTracker.jsx    # Tracker de navegación
│   │   ├── PageNotFound.jsx         # Página 404
│   │   ├── query-client.js          # Configuración React Query
│   │   └── vercel-blob-example.js   # Ejemplo Blob Storage
│   ├── pages/
│   │   ├── Admin.jsx                # Panel de administración
│   │   ├── Checkout.jsx             # Página de checkout
│   │   ├── Home.jsx                  # Página principal
│   │   ├── Login.jsx                 # Página de login
│   │   ├── Register.jsx              # Página de registro
│   │   └── Shop.jsx                  # Página de tienda
│   ├── utils/
│   │   ├── api.js                   # Utilidades de API
│   │   └── index.js                  # Utilidades generales
│   ├── App.jsx                       # Componente principal
│   ├── main.jsx                      # Entry point
│   ├── index.css                    # Estilos globales
│   └── pages.config.js               # Configuración de páginas
├── server.js                         # Servidor Express
├── vercel.json                       # Configuración Vercel
├── vite.config.js                    # Configuración Vite
├── tailwind.config.js                # Configuración Tailwind
├── postcss.config.js                 # Configuración PostCSS
└── package.json                      # Dependencias
```

## Funcionalidades Principales

### 1. Autenticación
- **Registro de usuarios**: Formulario con validaciones
  - Nombre: solo letras, espacios, guiones y apóstrofes (mínimo 2 caracteres)
  - Email: formato válido con regex
  - Contraseña: mínimo 6 caracteres
  - Confirmación de contraseña: debe coincidir
- **Login**: Autenticación con email y contraseña
- **Sesión persistente**: Usa localStorage
- **Rutas protegidas**: Solo usuarios autenticados pueden acceder
- **Logout**: Limpia sesión y redirige a login

### 2. Gestión de Productos
- Listado de productos con categorías (engine, brakes, tires, etc.)
- Productos destacados (featured)
- CRUD completo en panel de administración:
  - Crear productos
  - Leer/Listar productos
  - Actualizar productos
  - Eliminar productos (con confirmación)
- Categorías: engine, brakes, tires, suspension, electrical, body

### 3. Carrito de Compras
- Agregar productos al carrito
- Modificar cantidades
- Eliminar productos del carrito
- Persistencia por sesión (session_id)
- Drawer lateral para visualizar carrito
- Cálculo automático de totales

### 4. Checkout
- Formulario de información de contacto
- Dirección de envío
- Selección de método de pago (tarjeta, PayPal, transferencia)
- Resumen de pedido
- Confirmación de pedido
- Almacenamiento de pedidos en base de datos

### 5. Panel de Administración
- Gestión de productos (CRUD)
- Visualización de pedidos
- Gestión de suscriptores de email
- Estadísticas básicas

### 6. Newsletter
- Formulario de suscripción
- Almacenamiento de emails
- Integración con base de datos

## Base de Datos

### Tablas SQLite

1. **users**
   - id (INTEGER PRIMARY KEY)
   - name (TEXT NOT NULL)
   - email (TEXT NOT NULL UNIQUE)
   - password (TEXT NOT NULL) - hash base64
   - created_at (DATETIME)
   - updated_at (DATETIME)

2. **emails**
   - id (INTEGER PRIMARY KEY)
   - email (TEXT NOT NULL UNIQUE)
   - created_at (DATETIME)

3. **products**
   - id (INTEGER PRIMARY KEY)
   - name (TEXT NOT NULL)
   - description (TEXT)
   - price (REAL NOT NULL)
   - image_url (TEXT)
   - category (TEXT DEFAULT 'engine')
   - inventory (INTEGER DEFAULT 0)
   - featured (INTEGER DEFAULT 0)
   - created_at (DATETIME)
   - updated_at (DATETIME)

4. **cart_items**
   - id (INTEGER PRIMARY KEY)
   - product_id (INTEGER NOT NULL)
   - product_name (TEXT NOT NULL)
   - product_image (TEXT)
   - product_price (REAL NOT NULL)
   - quantity (INTEGER NOT NULL DEFAULT 1)
   - session_id (TEXT NOT NULL)
   - created_at (DATETIME)
   - updated_at (DATETIME)

5. **orders**
   - id (TEXT PRIMARY KEY) - formato: ord_timestamp_random
   - customer_name (TEXT NOT NULL)
   - customer_email (TEXT NOT NULL)
   - total (REAL NOT NULL)
   - status (TEXT DEFAULT 'pending')
   - payment_method (TEXT)
   - payment_status (TEXT DEFAULT 'pending')
   - shipping_address (TEXT) - JSON string
   - items (TEXT) - JSON string
   - created_at (DATETIME)
   - updated_at (DATETIME)

6. **subscribers**
   - id (TEXT PRIMARY KEY) - formato: sub_timestamp_random
   - email (TEXT NOT NULL UNIQUE)
   - source (TEXT)
   - is_active (INTEGER DEFAULT 1)
   - subscribed_at (DATETIME)

### Productos Iniciales (Seed Data)
- Air Filter - Premium ($29.99) - engine, featured
- Brake Pads Set ($89.99) - brakes, featured
- Spark Plugs Set (4) ($49.99) - engine
- All-Season Tires (Set of 4) ($599.99) - tires, featured
- Oil Filter ($12.99) - engine, featured
- Car Battery ($129.99) - engine

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Carrito
- `GET /api/cart?session_id=xxx` - Obtener items del carrito
- `POST /api/cart` - Agregar item al carrito
- `PUT /api/cart/:id` - Actualizar cantidad
- `DELETE /api/cart/:id` - Eliminar item

### Pedidos
- `GET /api/orders` - Listar pedidos
- `POST /api/orders` - Crear pedido
- `PUT /api/orders/:id` - Actualizar pedido

### Emails y Suscriptores
- `POST /api/store-email` - Almacenar email
- `GET /api/emails` - Listar emails
- `GET /api/subscribers` - Listar suscriptores
- `POST /api/subscribers` - Crear suscriptor

## Configuración de Vercel

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/server.js"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### api/server.js
Wrapper serverless que exporta el servidor Express:
```javascript
const app = require('../server.js');
module.exports = app;
```

### Variables de Entorno en Vercel
- `VITE_API_URL` (opcional): URL del backend si está en servidor separado
- `BLOB_READ_WRITE_TOKEN`: Token para Vercel Blob Storage (auto-configurado)
- `VERCEL` o `VERCEL_ENV`: Detectado automáticamente

## Configuración del Servidor

### server.js Características
- Middleware CORS habilitado
- Body parser para JSON y URL encoded
- Servir archivos estáticos desde `dist` (producción) o `public` (fallback)
- Base de datos SQLite en `./emails.db` (local) o `/tmp/emails.db` (Vercel)
- Integración con Vercel Blob Storage para backup de emails
- Manejo de errores con respuestas JSON consistentes
- Exporta app para Vercel serverless, solo ejecuta `app.listen()` en local

### Rutas Especiales
- `GET *` - Sirve la app React (SPA routing)
- `GET /api/*` - 404 handler para rutas API no encontradas
- Error handler middleware al final

## Componentes UI Principales

### Componentes de Tienda
- **HeroSection**: Sección principal con CTA
- **CategoryGrid**: Grid de categorías con iconos
- **FeaturedProducts**: Lista de productos destacados
- **ProductCard**: Tarjeta individual de producto
- **CartDrawer**: Drawer lateral del carrito
- **NewsletterForm**: Formulario de suscripción
- **Footer**: Footer con links y información

### Componentes de Autenticación
- **Login**: Formulario de login con validación
- **Register**: Formulario de registro con validaciones completas
- **AuthContext**: Context API para estado de autenticación global

### Componentes de Administración
- **Admin**: Panel con tabs para productos, pedidos, suscriptores
- Tabla de productos con acciones CRUD
- Dialog de confirmación para eliminar
- Formularios para crear/editar productos

## Validaciones Implementadas

### Registro
- Nombre: Regex `/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/`, mínimo 2 caracteres
- Email: Regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Contraseña: Mínimo 6 caracteres
- Confirmación: Debe coincidir con contraseña

### Servidor
- Validación de nombre en backend
- Validación de email en backend
- Validación de longitud de contraseña
- Manejo de emails duplicados (409 Conflict)

## Manejo de Errores

### Cliente
- Validación de Content-Type antes de parsear JSON
- Manejo de respuestas no-JSON
- Logging detallado de errores (status, texto, content-type)
- Mensajes de error específicos para diferentes tipos de errores
- Toast notifications para feedback al usuario

### Servidor
- Middleware de error handling que siempre devuelve JSON
- 404 handler para rutas API
- Logging de errores en consola
- Respuestas consistentes con formato `{ success: boolean, message: string, ...data }`

## Temática y Diseño

### Tema: Auto Parts / Repuestos de Automóviles
- Colores principales: Rojo (#DC2626), Negro, Blanco, Grises neutros
- Branding: Logo con letra "A" en círculo rojo
- Imágenes: Unsplash con temática de autos
- Categorías: Motor, Frenos, Llantas, Suspensión, Eléctrico, Carrocería

### Estilo Visual
- Diseño minimalista y moderno
- Gradientes sutiles (stone-50, white, amber-50/30)
- Sombras suaves y bordes redondeados
- Animaciones suaves con Framer Motion
- Responsive design (mobile-first)

## Scripts NPM

```json
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "dev:client": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

## Configuración de Vite

- Proxy para `/api` → `http://localhost:3000` en desarrollo
- Alias `@` para `./src`
- Output directory: `dist`
- Plugin React

## Configuración de Tailwind

- Content: `["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]`
- Theme extendido con colores personalizados
- Plugins: typography, forms (si aplica)

## Características Especiales

1. **Detección de Entorno**: 
   - Local: SQLite en `./emails.db`
   - Vercel: SQLite en `/tmp/emails.db` + Blob Storage backup

2. **URLs Dinámicas de API**:
   - Desarrollo: rutas relativas (proxy Vite)
   - Producción: detecta Vercel y usa rutas relativas o `VITE_API_URL`

3. **Persistencia de Sesión**:
   - Carrito: session_id en localStorage
   - Usuario: user object en localStorage
   - Autenticación: flag `isAuthenticated` en localStorage

4. **Protección de Rutas**:
   - Componente `ProtectedRoute` que verifica autenticación
   - Redirección automática a `/login` si no autenticado
   - Estado de carga durante verificación

## Archivos de Configuración Clave

### package.json
- `type: "module"` NO debe estar (usa CommonJS)
- Dependencias exactas como se especificó arriba

### vite.config.js
- Proxy configurado para desarrollo
- Alias `@` para imports absolutos

### tailwind.config.js
- Configuración estándar con content paths

### .gitignore
- `node_modules/`
- `dist/`
- `*.db`
- `.env`
- `.env.local`
- `*.log`

## Pasos de Implementación Sugeridos

1. **Setup Inicial**
   - Crear estructura de carpetas
   - Instalar dependencias
   - Configurar Vite, Tailwind, PostCSS

2. **Base de Datos**
   - Crear esquema SQLite
   - Implementar seed data
   - Configurar rutas de base de datos (local/Vercel)

3. **Backend API**
   - Configurar Express
   - Implementar todos los endpoints
   - Agregar validaciones
   - Manejo de errores

4. **Frontend Base**
   - Configurar React Router
   - Crear estructura de páginas
   - Implementar AuthContext
   - Configurar React Query

5. **Componentes UI**
   - Crear componentes base (Button, Card, Input, etc.)
   - Implementar componentes de tienda
   - Crear componentes de autenticación

6. **Funcionalidades**
   - Implementar autenticación completa
   - Carrito de compras
   - Checkout
   - Panel de administración

7. **Integración Vercel**
   - Crear `vercel.json`
   - Crear `api/server.js`
   - Configurar variables de entorno
   - Probar deployment

8. **Optimizaciones**
   - Manejo de errores mejorado
   - Validaciones completas
   - Logging y debugging
   - Testing básico

## Notas Importantes

- El servidor debe exportar el app Express al final del archivo para Vercel
- Solo ejecutar `app.listen()` cuando NO esté en Vercel
- Usar `INSERT OR IGNORE` para evitar duplicados en emails
- Las contraseñas se hashean con base64 (simple, mejorar en producción)
- SQLite en Vercel es efímero (usar Blob Storage o Postgres para persistencia real)
- Todas las respuestas API deben ser JSON, incluso errores
- El frontend debe manejar errores de red y parsing de JSON

## Estado Actual del Proyecto

✅ Autenticación completa (login/register)
✅ CRUD de productos
✅ Carrito de compras
✅ Checkout funcional
✅ Panel de administración
✅ Integración con Vercel Blob Storage
✅ Configuración para deployment en Vercel
✅ Validaciones de formularios
✅ Manejo de errores robusto
✅ Diseño responsive
✅ Temática de auto parts completa

Este prompt contiene toda la información necesaria para replicar el proyecto desde cero.
