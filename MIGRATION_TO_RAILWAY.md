# Migración a Railway para FastAPI

Vercel no soporta FastAPI directamente en Python serverless functions. Railway es una excelente alternativa que soporta FastAPI nativamente.

## Por qué Railway?

- ✅ Soporte nativo para FastAPI (ASGI)
- ✅ Plan gratuito generoso
- ✅ Configuración simple
- ✅ Variables de entorno fáciles de configurar
- ✅ Deploy automático desde GitHub
- ✅ Logs en tiempo real

## Pasos para migrar

### 1. Crear cuenta en Railway

1. Ve a https://railway.app
2. Crea una cuenta (puedes usar GitHub)
3. Crea un nuevo proyecto

### 2. Conectar GitHub

1. En Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio: `miguelgnzalez28/proyecto-ecommerce`

### 3. Configurar el proyecto

Railway detectará automáticamente que es un proyecto Python. Necesitas:

#### 3.1 Crear `Procfile` en la raíz del proyecto:

```
web: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
```

#### 3.2 Configurar variables de entorno en Railway:

En Railway Dashboard > Variables, agrega:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_8hHkh3rj3JSWc8Gd_ykNNa9JJiTXv6376HNywIv1ufYuuCk
JWT_SECRET_KEY=tu_clave_secreta_segura
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
VERCEL=0
```

#### 3.3 Actualizar `backend/db_adapter.py`:

Cambiar la detección de Vercel para que funcione con Railway:

```python
# Check if running on Vercel or Railway
IS_VERCEL = os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV')
IS_RAILWAY = os.environ.get('RAILWAY_ENVIRONMENT') or os.environ.get('RAILWAY')
USE_BLOB = IS_VERCEL or IS_RAILWAY  # Use Blob Storage on Vercel or Railway
```

### 4. Configurar el frontend en Vercel

El frontend puede seguir en Vercel, solo necesitas actualizar la URL de la API:

1. En Vercel, agrega variable de entorno:
   ```
   VITE_API_URL=https://tu-proyecto.railway.app
   ```

2. O actualiza `frontend/src/utils/api.js` para usar la URL de Railway

### 5. Deploy

1. Railway hará deploy automáticamente cuando hagas push a GitHub
2. Obtendrás una URL como: `https://tu-proyecto.railway.app`
3. Actualiza el frontend para usar esta URL

## Alternativa: Render.com

Si prefieres Render.com:

1. Ve a https://render.com
2. Crea cuenta y nuevo "Web Service"
3. Conecta GitHub
4. Configuración:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Environment: Python 3

## Ventajas sobre Vercel para FastAPI

- ✅ No necesitas Mangum ni adaptadores
- ✅ FastAPI funciona directamente
- ✅ Mejor soporte para aplicaciones Python completas
- ✅ Más fácil de debuggear
- ✅ Logs más completos

## Costo

- Railway: Plan gratuito con $5 de crédito mensual
- Render: Plan gratuito (puede ser lento, pero funciona)

## Siguiente paso

¿Quieres que te ayude a configurar Railway o prefieres intentar otra solución con Vercel?
