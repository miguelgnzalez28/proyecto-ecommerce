# Despliegue en Vercel

## Variables de Entorno Requeridas

Cuando despliegues en Vercel, configura las siguientes variables de entorno:

### Backend (API)
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
JWT_SECRET_KEY=tu_clave_secreta_segura
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
VERCEL=1
```

### Cómo obtener BLOB_READ_WRITE_TOKEN

1. Ve a tu proyecto en Vercel Dashboard
2. Settings > Storage > Create Database > Blob
3. Crea un nuevo Blob Store
4. Copia el `BLOB_READ_WRITE_TOKEN`
5. Agrégalo como variable de entorno

## Estructura del Proyecto para Vercel

```
/
├── api/
│   └── index.py          # Wrapper para FastAPI (serverless)
├── frontend/
│   ├── dist/             # Build de React (generado por vite build)
│   └── ...
├── backend/
│   ├── server.py         # FastAPI app
│   └── db_adapter.py     # Adaptador MongoDB/Vercel Blob
└── vercel.json           # Configuración de Vercel
```

## vercel.json

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.py" }
  ],
  "functions": {
    "api/index.py": {
      "runtime": "python3.11"
    }
  }
}
```

## api/index.py (Wrapper Serverless)

```python
import sys
sys.path.insert(0, './backend')

from server import app

# Vercel serverless handler
handler = app
```

## Cómo funciona la persistencia

### Desarrollo Local (MongoDB)
- Usa MongoDB local en `mongodb://localhost:27017`
- Los datos se persisten en la base de datos local

### Producción (Vercel Blob)
- Detecta automáticamente el entorno Vercel
- Usa Vercel Blob Storage para persistir datos
- Los datos se guardan como archivos JSON:
  - `db/products.json`
  - `db/users.json`
  - `db/orders.json`
  - `db/config.json`
  - `db/cart_items.json`
  - `db/chatbot_responses.json`
  - `db/subscribers.json`

## Comandos de Build

```bash
# Instalar dependencias frontend
cd frontend && yarn install

# Build del frontend
cd frontend && yarn build

# El backend no necesita build (Python)
```

## Notas Importantes

1. **Primera ejecución**: Los datos iniciales (productos, respuestas de chatbot) se crean automáticamente
2. **Blob Storage**: Es persistente entre deploys
3. **Cold starts**: Las funciones serverless tienen cold starts, primera petición puede ser más lenta
4. **Límites**: Vercel Blob tiene límites de almacenamiento según tu plan
