# backend/app/db/base.py

from sqlalchemy.orm import declarative_base

# We create a Base class using declarative_base().
# Any model class that we create in our application (like our upcoming Submission model)
# will inherit from this Base class. This is how SQLAlchemy's ORM system
# connects our Python classes to the database tables.
Base = declarative_base()