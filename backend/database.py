from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client: AsyncIOMotorClient = None
db = None


async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.db_name]
    print(f"[DB] Connected → {settings.db_name}")


async def close_db():
    global client
    if client:
        client.close()
        print("[DB] Connection closed")


def users():
    return db["users"]


def sessions():
    return db["sessions"]


def notes():
    return db["notes"]


def mcq_scores():
    return db["mcq_scores"]


def chat_history():
    return db["chat_history"]
