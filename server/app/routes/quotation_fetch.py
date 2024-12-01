from flask import jsonify
from app.db import get_db_connection
from app.routes.quotation_routes import quotation_bp


@quotation_bp.route('/quotations', methods=['GET'])
def get_quotations():
    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute("""
            SELECT q.quotation_no, q.quotation_type, q.quotation_solution, q.quotation_code,
                   q.quotation_pic, q.quotation_pt, q.quotation_customer, q.quotation_customeraddress,
                   q.quotation_subtotal, q.quotation_managementfee, q.quotation_ppn, q.quotation_grandtotal,
                   q.quotation_createdate, q.quotation_validdate, q.quotation_email
            FROM quotation q
            WHERE q.visibility = 1
        """)
        quotations = cursor.fetchall()

        for quotation in quotations:
            cursor.execute("""
                SELECT e.expense_no, e.expense_description, e.expense_total,
                       e.expense_discount, e.expense_linecount
                FROM quotation_expense e
                WHERE e.quotation_no = %s
            """, (quotation['quotation_no'],))
            expenses = cursor.fetchall()
            quotation['expenses'] = expenses

        return jsonify({"quotations": quotations}), 200

    except mysql.connector.Error as err:
        print(f"Database error: {err}")
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        connection.close()


@quotation_bp.route('/get-quotation/<quotation_no>', methods=['GET'])
def get_quotation(quotation_no):
    try:
        print(f"Received quotation_no: {quotation_no}")

        # Query the database for the quotation, expenses, and TOS
        conn = get_db_connection()
        cursor = conn.cursor()

        # Fetch quotation data
        cursor.execute(
            "SELECT * FROM quotation WHERE quotation_no = %s", (quotation_no,))
        quotation = cursor.fetchone()
        print(f"Quotation fetched: {quotation}")
        
        print 

        # Fetch expenses data
        cursor.execute(
            "SELECT * FROM quotation_expense WHERE quotation_no = %s", (quotation_no,))
        expenses = cursor.fetchall()
        print(f"Expenses fetched: {expenses}")

        # Fetch terms of service data
        cursor.execute(
            "SELECT * FROM quotation_tos WHERE quotation_no = %s", (quotation_no,))
        tos = cursor.fetchall()
        print(f"TOS fetched: {tos}")

        cursor.close()
        conn.close()

        if not quotation:
            return jsonify({"error": "Quotation not found"}), 404

        # Return the data in the desired format
        return jsonify({
                "quotation": quotation,
                "expenses": expenses,
                "tos": tos
        }), 200
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({"error": str(e)}), 500


