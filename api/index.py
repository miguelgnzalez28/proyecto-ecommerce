"""Vercel entrypoint for FastAPI (ASGI)."""
import os
import sys

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app
from mangum import Mangum

# Create Mangum adapter for Vercel/Lambda compatibility
# Mangum wraps the ASGI app to work with serverless functions
handler = Mangum(app, lifespan="off")
