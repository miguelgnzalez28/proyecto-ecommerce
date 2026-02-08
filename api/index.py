"""
Vercel Serverless Function Handler for FastAPI
"""
import sys
import os
import asyncio
from typing import Any, Dict

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app
from mangum import Mangum

# Create Mangum adapter for Vercel/Lambda compatibility
# Mangum wraps the ASGI app to work with serverless functions
mangum_app = Mangum(app, lifespan="off")

# Vercel Python serverless function handler
# Vercel expects a function that takes (request) and returns a response
def handler(request: Any) -> Dict[str, Any]:
    """
    Vercel serverless function handler
    Wraps async Mangum adapter for synchronous Vercel environment
    """
    try:
        # Convert Vercel request to ASGI event
        # Vercel passes a request object, Mangum expects an event dict
        if hasattr(request, 'method'):
            # Vercel request object
            event = {
                'httpMethod': request.method,
                'path': request.path,
                'headers': dict(request.headers) if hasattr(request, 'headers') else {},
                'queryStringParameters': dict(request.args) if hasattr(request, 'args') else {},
                'body': request.body if hasattr(request, 'body') else b'',
                'isBase64Encoded': False,
            }
        elif isinstance(request, dict):
            # Already in event format
            event = request
        else:
            # Try to convert to event format
            event = {
                'httpMethod': getattr(request, 'method', 'GET'),
                'path': getattr(request, 'path', '/'),
                'headers': dict(getattr(request, 'headers', {})),
                'queryStringParameters': dict(getattr(request, 'args', {})) if hasattr(request, 'args') else {},
                'body': getattr(request, 'body', b''),
                'isBase64Encoded': False,
            }
        
        # Run async Mangum adapter in event loop
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            response = loop.run_until_complete(mangum_app(event, {}))
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
