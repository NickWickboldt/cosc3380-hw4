import psycopg2
from psycopg2 import sql

def execute_script_on_database(database_name, file_path):
    try:
        # Connect to the default PostgreSQL database (usually "postgres")
        connection = psycopg2.connect(
            user="postgres",
            password="8508",
            host="localhost",
            port="5432",
            database="postgres"  # Connecting to default database first
        )
        connection.autocommit = True

        # Create a cursor to execute database-level commands
        with connection.cursor() as cursor:
            # Drop the database if it exists and create a new one
            cursor.execute(sql.SQL(f"DROP DATABASE IF EXISTS {database_name}"))
            cursor.execute(sql.SQL(f"CREATE DATABASE {database_name}"))

        # Close the connection to default database and connect to the new database
        connection.close()
        connection = psycopg2.connect(
            user="postgres",
            password="8508",
            host="localhost",
            port="5432",
            database=database_name  # Connecting to the newly created database
        )
        connection.autocommit = True

        # Open the SQL file
        with open(file_path, 'r') as file:
            sql_script = file.read()

        # Create a cursor and execute the SQL script on the new database
        with connection.cursor() as cursor:
            cursor.execute(sql.SQL(sql_script))

        print(f"Database '{database_name}' and table created successfully!")

    except (Exception, psycopg2.Error) as error:
        print("Error executing the PostgreSQL script:", error)
    
    finally:
        if connection:
            connection.close()

if __name__ == "__main__":
    # Path to your SQL file
    sql_file_path = "setup.sql"
    # Name of your database
    database_name = "phone_company"
    
    execute_script_on_database(database_name, sql_file_path)
