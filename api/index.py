"""
Vercel Serverless Function Handler for FastAPI
"""
import sys
import os

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app
from mangum import Mangum

# Create Mangum adapter for Vercel/Lambda compatibility
# Mangum wraps the ASGI app to work with serverless functions
mangum_app = Mangum(app, lifespan="off")

# Vercel expects a callable handler
# The Mangum instance is callable and handles the conversion
handler = mangum_app
