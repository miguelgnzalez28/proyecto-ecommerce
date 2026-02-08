"""
Vercel Serverless Function Handler for FastAPI
"""
import sys
import os

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app

# Vercel can handle ASGI apps directly
# Export the FastAPI app as the handler
handler = app
