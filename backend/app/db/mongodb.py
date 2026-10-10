import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db = None
    is_connected: bool = False
    
    # In-memory storage fallback if MongoDB is not running locally
    in_memory_users: dict = {}
    in_memory_scans: list = []

db_manager = DatabaseManager()

async def seed_default_admin():
    """Seed default administrator accounts for both in-memory and MongoDB storage."""
    created_at = datetime.now(timezone.utc).isoformat()
    default_accounts = [
        {
            "email": "admin@security.io",
            "name": "SOC Administrator",
            "hashed_password": get_password_hash("admin"),
            "created_at": created_at
        },
        {
            "email": "operator@security.io",
            "name": "SOC Operator",
            "hashed_password": get_password_hash("operator123"),
            "created_at": created_at
        }
    ]

    for acc in default_accounts:
        # Seed in-memory
        db_manager.in_memory_users[acc["email"]] = acc

        # Seed MongoDB if connected
        if db_manager.is_connected:
            try:
                existing = await db_manager.db.users.find_one({"email": acc["email"]})
                if not existing:
                    await db_manager.db.users.insert_one(acc)
                    logger.info(f"Seeded default account '{acc['email']}' into MongoDB.")
            except Exception as e:
                logger.warning(f"Could not seed account into MongoDB ({e}).")

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

    # Seed default accounts
    await seed_default_admin()

async def close_mongo_connection():
    """Close async MongoDB connection."""
    if db_manager.client:
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

