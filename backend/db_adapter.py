"""
Database Adapter for AutoParts E-commerce
Supports MongoDB (local) and Vercel Blob Storage (production)
"""
import os
import json
import httpx
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from bson import ObjectId

# Check if running on Vercel
IS_VERCEL = os.environ.get('VERCEL') or os.environ.get('VERCEL_ENV')
BLOB_READ_WRITE_TOKEN = os.environ.get('BLOB_READ_WRITE_TOKEN', '')

class VercelBlobDB:
    """Database adapter using Vercel Blob Storage"""
    
    def __init__(self):
        # Read token from environment variable
        self.token = os.environ.get('BLOB_READ_WRITE_TOKEN', '')
        self.base_url = "https://blob.vercel-storage.com"
        self.cache = {}  # In-memory cache for current request
        
        if not self.token:
            print("WARNING: BLOB_READ_WRITE_TOKEN is not set! Blob storage will not work.")
            print(f"Available env vars: VERCEL={os.environ.get('VERCEL')}, VERCEL_ENV={os.environ.get('VERCEL_ENV')}")
        else:
            print(f"VercelBlobDB initialized with token: {self.token[:20]}...")
            print(f"Token length: {len(self.token)}")
        
    def _get_headers(self):
        return {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
    
    def _generate_id(self):
        """Generate a unique ID similar to MongoDB ObjectId"""
        import random
        import string
        timestamp = hex(int(datetime.now(timezone.utc).timestamp()))[2:]
        random_part = ''.join(random.choices(string.hexdigits.lower(), k=16))
        return f"{timestamp}{random_part}"
    
    async def _get_blob(self, collection: str) -> List[Dict]:
        """Get collection data from Vercel Blob"""
        if collection in self.cache:
            return self.cache[collection]
        
        try:
            filename = f"db/{collection}.json"
            async with httpx.AsyncClient() as client:
                # List blobs to find our collection
                list_response = await client.get(
                    f"{self.base_url}",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                    },
                    params={"prefix": filename}
                )
                
                if list_response.status_code == 200:
                    data = list_response.json()
                    blobs = data.get('blobs', [])
                    
                    if blobs:
                        # Get the blob content using the url from the list
                        blob_url = blobs[0].get('url')
                        if blob_url:
                            content_response = await client.get(blob_url)
                            if content_response.status_code == 200:
                                try:
                                    self.cache[collection] = content_response.json()
                                    return self.cache[collection]
                                except:
                                    # If it's not JSON, try to parse as text
                                    text = content_response.text
                                    self.cache[collection] = json.loads(text) if text else []
                                    return self.cache[collection]
                
                # Return empty list if collection doesn't exist
                self.cache[collection] = []
                return []
        except Exception as e:
            print(f"Error getting blob {collection}: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    async def _save_blob(self, collection: str, data: List[Dict]):
        """Save collection data to Vercel Blob"""
        try:
            if not self.token:
                print(f"ERROR: BLOB_READ_WRITE_TOKEN is not set!")
                return False
                
            filename = f"db/{collection}.json"
            json_data = json.dumps(data, ensure_ascii=False, default=str)
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                # Vercel Blob Storage API REST format
                # Based on: put('pathname', 'content', { access: 'public' })
                # The API expects multipart/form-data with:
                #   - pathname: the file path (string)
                #   - file: the file content (as string or bytes)
                #   - access: 'public' or 'private' (string)
                
                # Create multipart form data
                # httpx will automatically set Content-Type to multipart/form-data with boundary
                # Format: (filename, content, content_type)
                files = {
                    'file': (filename, json_data.encode('utf-8'), 'application/json')
                }
                form_data = {
                    'pathname': filename,
                    'access': 'public'
                }
                
                print(f"Attempting to save blob: {filename}")
                print(f"Token present: {bool(self.token)}")
                print(f"Token prefix: {self.token[:20] if self.token else 'N/A'}...")
                print(f"Data size: {len(json_data)} bytes")
                
                response = await client.post(
                    f"{self.base_url}",
                    headers={
                        "Authorization": f"Bearer {self.token}",
                    },
                    files=files,
                    data=form_data
                )
                
                print(f"Response status: {response.status_code}")
                print(f"Response headers: {dict(response.headers)}")
                
                if response.status_code in [200, 201]:
                    try:
                        response_data = response.json()
                        print(f"Blob saved successfully: {response_data}")
                        self.cache[collection] = data
                        return True
                    except:
                        # If response is not JSON, still consider it success if status is 200/201
                        self.cache[collection] = data
                        return True
                else:
                    error_text = response.text if hasattr(response, 'text') else str(response.content)
                    print(f"ERROR saving blob {collection}:")
                    print(f"  Status: {response.status_code}")
                    print(f"  Response: {error_text}")
                    # Try to get more details from response
                    try:
                        error_json = response.json()
                        print(f"  Error JSON: {error_json}")
                    except:
                        pass
                    return False
        except httpx.TimeoutException as e:
            print(f"Timeout error saving blob {collection}: {e}")
            return False
        except httpx.RequestError as e:
            print(f"Request error saving blob {collection}: {e}")
            import traceback
            traceback.print_exc()
            return False
        except Exception as e:
            print(f"Unexpected error saving blob {collection}: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    async def find(self, collection: str, query: Dict = None) -> List[Dict]:
        """Find documents matching query"""
        data = await self._get_blob(collection)
        
        if not query:
            return data
        
        results = []
        for doc in data:
            match = True
            for key, value in query.items():
                if key == '$or':
                    # Handle $or operator
                    or_match = False
                    for or_query in value:
                        if all(doc.get(k) == v for k, v in or_query.items()):
                            or_match = True
                            break
                    if not or_match:
                        match = False
                elif doc.get(key) != value:
                    match = False
                    break
            if match:
                results.append(doc)
        
        return results
    
    async def find_one(self, collection: str, query: Dict) -> Optional[Dict]:
        """Find single document matching query"""
        results = await self.find(collection, query)
        return results[0] if results else None
    
    async def insert_one(self, collection: str, document: Dict) -> Dict:
        """Insert a single document"""
        data = await self._get_blob(collection)
        
        doc_id = self._generate_id()
        document['_id'] = doc_id
        document['id'] = doc_id
        
        data.append(document)
        success = await self._save_blob(collection, data)
        
        if not success:
            raise Exception(f"Failed to save document to blob storage for collection: {collection}")
        
        return {'inserted_id': doc_id}
    
    async def insert_many(self, collection: str, documents: List[Dict]) -> Dict:
        """Insert multiple documents"""
        data = await self._get_blob(collection)
        
        inserted_ids = []
        for doc in documents:
            doc_id = self._generate_id()
            doc['_id'] = doc_id
            doc['id'] = doc_id
            inserted_ids.append(doc_id)
            data.append(doc)
        
        await self._save_blob(collection, data)
        
        return {'inserted_ids': inserted_ids}
    
    async def update_one(self, collection: str, query: Dict, update: Dict, upsert: bool = False) -> Dict:
        """Update a single document"""
        data = await self._get_blob(collection)
        
        matched_count = 0
        modified_count = 0
        
        for i, doc in enumerate(data):
            match = all(doc.get(k) == v for k, v in query.items())
            if match:
                matched_count = 1
                if '$set' in update:
                    for key, value in update['$set'].items():
                        if doc.get(key) != value:
                            modified_count = 1
                        data[i][key] = value
                else:
                    for key, value in update.items():
                        if doc.get(key) != value:
                            modified_count = 1
                        data[i][key] = value
                break
        
        if matched_count == 0 and upsert:
            new_doc = {**query, **(update.get('$set', update))}
            await self.insert_one(collection, new_doc)
            return {'matched_count': 0, 'modified_count': 0, 'upserted_id': new_doc.get('id')}
        
        await self._save_blob(collection, data)
        
        return {'matched_count': matched_count, 'modified_count': modified_count}
    
    async def delete_one(self, collection: str, query: Dict) -> Dict:
        """Delete a single document"""
        data = await self._get_blob(collection)
        
        deleted_count = 0
        for i, doc in enumerate(data):
            match = all(doc.get(k) == v for k, v in query.items())
            if match:
                data.pop(i)
                deleted_count = 1
                break
        
        await self._save_blob(collection, data)
        
        return {'deleted_count': deleted_count}
    
    async def delete_many(self, collection: str, query: Dict) -> Dict:
        """Delete multiple documents"""
        data = await self._get_blob(collection)
        
        original_len = len(data)
        data = [doc for doc in data if not all(doc.get(k) == v for k, v in query.items())]
        deleted_count = original_len - len(data)
        
        await self._save_blob(collection, data)
        
        return {'deleted_count': deleted_count}
    
    async def count_documents(self, collection: str, query: Dict = None) -> int:
        """Count documents matching query"""
        if query:
            results = await self.find(collection, query)
            return len(results)
        data = await self._get_blob(collection)
        return len(data)
    
    async def aggregate(self, collection: str, pipeline: List[Dict]) -> List[Dict]:
        """Simple aggregation support"""
        data = await self._get_blob(collection)
        
        for stage in pipeline:
            if '$match' in stage:
                data = [doc for doc in data if all(doc.get(k) == v for k, v in stage['$match'].items())]
            elif '$group' in stage:
                group = stage['$group']
                if group.get('_id') is None:
                    result = {'_id': None}
                    for key, op in group.items():
                        if key == '_id':
                            continue
                        if isinstance(op, dict) and '$sum' in op:
                            field = op['$sum'].replace('$', '')
                            result[key] = sum(doc.get(field, 0) for doc in data)
                    return [result]
        
        return data


class MongoDBWrapper:
    """Wrapper to make pymongo sync calls work with our async interface"""
    
    def __init__(self, db):
        self.db = db
    
    async def find(self, collection: str, query: Dict = None) -> List[Dict]:
        cursor = self.db[collection].find(query or {})
        results = []
        for doc in cursor:
            doc['id'] = str(doc.pop('_id'))
            results.append(doc)
        return results
    
    async def find_one(self, collection: str, query: Dict) -> Optional[Dict]:
        # Handle both string ID and ObjectId
        if 'id' in query:
            try:
                query['_id'] = ObjectId(query.pop('id'))
            except:
                pass
        if '_id' in query and isinstance(query['_id'], str):
            try:
                query['_id'] = ObjectId(query['_id'])
            except:
                pass
                
        doc = self.db[collection].find_one(query)
        if doc:
            doc['id'] = str(doc.pop('_id'))
        return doc
    
    async def insert_one(self, collection: str, document: Dict) -> Dict:
        result = self.db[collection].insert_one(document)
        return {'inserted_id': str(result.inserted_id)}
    
    async def insert_many(self, collection: str, documents: List[Dict]) -> Dict:
        result = self.db[collection].insert_many(documents)
        return {'inserted_ids': [str(id) for id in result.inserted_ids]}
    
    async def update_one(self, collection: str, query: Dict, update: Dict, upsert: bool = False) -> Dict:
        # Handle ID conversion
        if 'id' in query:
            try:
                query['_id'] = ObjectId(query.pop('id'))
            except:
                pass
        if '_id' in query and isinstance(query['_id'], str):
            try:
                query['_id'] = ObjectId(query['_id'])
            except:
                pass
                
        result = self.db[collection].update_one(query, update, upsert=upsert)
        return {
            'matched_count': result.matched_count,
            'modified_count': result.modified_count,
            'upserted_id': str(result.upserted_id) if result.upserted_id else None
        }
    
    async def delete_one(self, collection: str, query: Dict) -> Dict:
        if 'id' in query:
            try:
                query['_id'] = ObjectId(query.pop('id'))
            except:
                pass
        if '_id' in query and isinstance(query['_id'], str):
            try:
                query['_id'] = ObjectId(query['_id'])
            except:
                pass
                
        result = self.db[collection].delete_one(query)
        return {'deleted_count': result.deleted_count}
    
    async def delete_many(self, collection: str, query: Dict) -> Dict:
        result = self.db[collection].delete_many(query)
        return {'deleted_count': result.deleted_count}
    
    async def count_documents(self, collection: str, query: Dict = None) -> int:
        return self.db[collection].count_documents(query or {})
    
    async def aggregate(self, collection: str, pipeline: List[Dict]) -> List[Dict]:
        results = list(self.db[collection].aggregate(pipeline))
        for doc in results:
            if '_id' in doc and doc['_id'] is not None:
                doc['id'] = str(doc.pop('_id'))
        return results


def get_database():
    """Get the appropriate database adapter based on environment"""
    if IS_VERCEL and BLOB_READ_WRITE_TOKEN:
        print("Using Vercel Blob Storage for database")
        return VercelBlobDB()
    else:
        print("Using MongoDB for database")
        from pymongo import MongoClient
        MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
        DB_NAME = os.environ.get("DB_NAME", "autoparts_ecommerce")
        client = MongoClient(MONGO_URL)
        return MongoDBWrapper(client[DB_NAME])
