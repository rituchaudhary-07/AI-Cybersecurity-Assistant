import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False
    
    # In-memory storage fallback if MongoDB is not running locally
    in_memory_users: dict = {}
    in_memory_scans: list = []

db_manager = DatabaseManager()

async def connect_to_mongo():
    """Establish async MongoDB connection or initialize fallback."""
    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URL, 
            serverSelectionTimeoutMS=2000
        )
        # Test connection
        await db_manager.client.admin.command('ping')
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        db_manager.is_connected = True
        logger.info("Connected to MongoDB Atlas / Local MongoDB instance successfully.")
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB at {settings.MONGODB_URL} ({e}). Using in-memory database fallback for development.")
        db_manager.is_connected = False

async def close_mongo_connection():
    """Close async MongoDB connection."""
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")
