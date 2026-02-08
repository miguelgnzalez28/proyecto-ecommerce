"""Vercel entrypoint for FastAPI - Simple function approach"""
import os
import sys

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Import app after path is set
from server import app

# Vercel may support ASGI apps directly if exported as 'app'
# If this doesn't work, we'll need to use Railway or Render instead
