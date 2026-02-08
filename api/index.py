"""Vercel entrypoint for FastAPI (ASGI)."""
import os
import sys
import asyncio

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app
from mangum import Mangum

# Create Mangum adapter
mangum_handler = Mangum(app, lifespan="off")

# Vercel expects a function, not an instance
# Create a wrapper function that Vercel can recognize
def handler(event, context=None):
    """
    Vercel serverless function handler
    Wraps Mangum adapter in a function that Vercel can recognize
    """
    # Run async handler in event loop
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        result = loop.run_until_complete(mangum_handler(event, context))
        return result
    finally:
        loop.close()
