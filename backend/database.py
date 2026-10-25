import os
import pymysql
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = int(os.getenv("DB_PORT", "3306"))
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD")
    db_name = os.getenv("DB_NAME", "hydroniq_db")

    # SSL certificate is needed for the hosted Aiven database.
    ca_path = os.getenv("DB_SSL_CA")

    connection_options = {
        "host": db_host,
        "port": db_port,
        "user": db_user,
        "password": db_password,
        "database": db_name,
        "cursorclass": pymysql.cursors.DictCursor,
        "connect_timeout": 10,
    }

    if ca_path:
        connection_options["ssl"] = {"ca": ca_path}

    return pymysql.connect(**connection_options)
