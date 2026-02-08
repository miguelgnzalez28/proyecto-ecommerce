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

# Create Mangum adapter
adapter = Mangum(app, lifespan="off")

# Vercel Python functions expect the handler to be callable
# Export the adapter's __call__ method as the handler
def handler(request):
    """Vercel serverless function handler"""
    return adapter(request)
