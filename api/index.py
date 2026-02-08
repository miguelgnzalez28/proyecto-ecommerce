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

# Wrap FastAPI app with Mangum for AWS Lambda/Vercel compatibility
# Mangum converts ASGI to AWS Lambda/Vercel format
mangum_handler = Mangum(app, lifespan="off")

# Vercel expects a function handler, not an instance
def handler(event, context):
    """Vercel serverless function handler"""
    return mangum_handler(event, context)
