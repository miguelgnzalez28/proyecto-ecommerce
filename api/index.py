"""Vercel entrypoint for FastAPI (ASGI)."""
import os
import sys

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Expose ASGI app directly for Vercel Python runtime
from server import app
