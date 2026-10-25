from database import get_db_connection

try:
    connection = get_db_connection()

    with connection.cursor() as cursor:
        cursor.execute("SELECT DATABASE() AS database_name")
        result = cursor.fetchone()

    print("MySQL connection successful!")
    print("Connected database:", result["database_name"])

    connection.close()

except Exception as error:
    print("MySQL connection failed!")
    print("Error:", error)
