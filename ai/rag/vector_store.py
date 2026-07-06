from sqlalchemy import create_engine, Column, Vector, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Define the base class for SQLAlchemy models
Base = declarative_base()

# Define the VectorStore model
class VectorStore(Base):
    __tablename__ = 'vector_store'

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, index=True)
    team_member_id = Column(Integer, index=True)
    skill_vector = Column(Vector(1536))  # Adjust the dimension based on your model

# Database connection setup
DATABASE_URL = "postgresql://user:password@localhost/dbname"  # Update with your database credentials
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database tables
def init_db():
    Base.metadata.create_all(bind=engine)