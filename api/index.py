"""
Vercel Serverless Function Handler for FastAPI
"""
import sys
import os
import json

# Add backend directory to path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

from server import app
from mangum import Mangum

# Create Mangum adapter
adapter = Mangum(app, lifespan="off")

# Vercel Python serverless function handler
# Must be a function that accepts (event, context) or just (event)
async def handler(event, context=None):
    """
    Vercel serverless function handler
    Converts Vercel event to ASGI and back
    """
    try:
        # Convert Vercel event to ASGI scope
        # Mangum handles the conversion internally
        response = await adapter(event, context)
        return response
    except Exception as e:
        print(f"Error in handler: {e}")
        import traceback
        traceback.print_exc()
        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps({"error": str(e)})
        }
