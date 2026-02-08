"""
Vercel Serverless Function Handler for FastAPI
"""
import sys
import os
import asyncio

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app
from mangum import Mangum

# Create Mangum adapter
adapter = Mangum(app, lifespan="off")

# Vercel Python serverless function handler
# Vercel expects a synchronous function that can handle async internally
def handler(event, context=None):
    """
    Vercel serverless function handler
    Wraps async Mangum adapter for synchronous Vercel environment
    """
    try:
        # Run async adapter in event loop
        # Vercel may not support async handlers directly
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            response = loop.run_until_complete(adapter(event, context))
            return response
        finally:
            loop.close()
    except Exception as e:
        print(f"Error in handler: {e}")
        import traceback
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": '{"error": "' + str(e).replace('"', '\\"') + '"}'
        }
