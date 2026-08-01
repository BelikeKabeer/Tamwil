from flask import Flask, request, jsonify
import mysql.connector
import os
import logging

app = Flask(__name__)

# ✅ Configure logging for better debugging
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s: %(message)s')

# ✅ Database configuration from environment variables with sane defaults
db_config = {
    'host': os.environ.get('MYSQL_HOST', 'mysql-db'),
    'user': os.environ.get('MYSQL_USER', 'root'),
    'password': os.environ.get('MYSQL_PASSWORD', 'admin123'),
    'database': os.environ.get('MYSQL_DATABASE', 'bluevault_db'),
    'port': int(os.environ.get('MYSQL_PORT', '3306'))
}

def get_db_connection():
    """ ✅ Helper function to get a new DB connection """
    return mysql.connector.connect(**db_config)

def init_db():
    """ ✅ Automatically create table if it does not exist """
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS loan_applications (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        contact VARCHAR(255) NOT NULL,
                        uid VARCHAR(255) NOT NULL,
                        loan_type VARCHAR(255) NOT NULL,
                        employment VARCHAR(255) NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                conn.commit()
        logging.info("✅ Database table ensured")
    except Exception as e:
        logging.error(f"❌ Failed to init database table: {e}")

@app.route('/submit-loan', methods=['POST'])
def submit_loan():
    try:
        data = request.get_json(force=True)
        if not data:
            return jsonify({'error': 'Invalid or empty JSON payload'}), 400

        name = data.get('name', '').strip()
        contact = data.get('contact', '').strip()
        uid = data.get('uid', '').strip()
        loan_type = data.get('loanType', '').strip()
        employment = data.get('employment', '').strip()

        if not all([name, contact, uid, loan_type, employment]):
            return jsonify({'error': 'All fields are required'}), 400

        logging.info(f"Received loan application: name={name}, contact={contact}, uid={uid}, loan_type={loan_type}, employment={employment}")

        init_db()

        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO loan_applications (name, contact, uid, loan_type, employment)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (name, contact, uid, loan_type, employment)
                )
                conn.commit()

        logging.info("✅ Application inserted successfully")
        return jsonify({'message': 'Application submitted successfully'}), 200

    except mysql.connector.Error as db_err:
        logging.error(f"❌ Database error: {db_err}")
        return jsonify({'error': 'Database error occurred'}), 500

    except Exception as e:
        logging.error(f"❌ Unexpected error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health():
    return 'OK', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
