import os
from logging.config import fileConfig

from sqlalchemy import pool
from alembic import context

# Load .env (important if using env variables)
from dotenv import load_dotenv
load_dotenv()

# Import your engine
from app.db.session import engine

# Import Base + ALL models
from app.models.base import Base
from app.models import user, chat, knowledge

# Alembic config
config = context.config

# Optional: override DB URL from .env
DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata
target_metadata = Base.metadata


# -------------------------
# OFFLINE MODE
# -------------------------
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,   
    )

    with context.begin_transaction():
        context.run_migrations()


# -------------------------
# ONLINE MODE
# -------------------------
def run_migrations_online() -> None:
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,   
        )

        with context.begin_transaction():
            context.run_migrations()


# -------------------------
# ENTRY
# -------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()