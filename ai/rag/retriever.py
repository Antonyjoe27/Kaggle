from typing import List, Dict
from sqlalchemy.orm import Session
from ..core.db import get_db
from ..core.models import Document

class Retriever:
    def __init__(self, db: Session):
        self.db = db

    def retrieve_documents(self, query: str, top_k: int = 5) -> List[Dict]:
        results = self.db.query(Document).filter(Document.content.contains(query)).limit(top_k).all()
        return [{"id": doc.id, "content": doc.content} for doc in results]

def get_retriever() -> Retriever:
    db = get_db()
    return Retriever(db)