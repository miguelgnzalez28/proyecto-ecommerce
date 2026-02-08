"""
Vercel Serverless Function Handler for FastAPI
"""
import sys
import os
from mangum import Mangum

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app

# Wrap FastAPI app with Mangum for AWS Lambda/Vercel compatibility
handler = Mangum(app, lifespan="off")
