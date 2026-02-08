"""Vercel entrypoint for FastAPI"""
import os
import sys

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import and export FastAPI app directly
# Vercel supports FastAPI natively and will handle ASGI automatically
from server import app

# Export the app - Vercel will detect it as an ASGI application
# No need for Mangum or wrapper functions
