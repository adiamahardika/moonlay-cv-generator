
from flask import jsonify, request
from app.db import get_db_connection
from app.routes.quotation_routes import quotation_bp
from datetime import datetime
import json



@quotation_bp.route('/create_quotation', methods=['POST'])

def create_quotation():
    
    from app.utils import generate_quotation_file
    
    data = request.get_json()
    print(f"Received data: {json.dumps(data)}")

    # Extract relevant fields
    quotation_type = data.get('quotation_type')
    quotation_solution = data.get('quotation_solution')
    quotation_pic = data.get('quotation_pic')
    quotation_pt = data.get('quotation_pt')
    quotation_customer = data.get('quotation_customer')
    quotation_customeraddress = data.get('quotation_customeraddress')
    quotation_subtotal = data.get('quotation_subtotal')
    quotation_managementfee = data.get('quotation_managementfee')
    quotation_ppn = data.get('quotation_ppn')
    quotation_grandtotal = data.get('quotation_grandtotal')
    quotation_createdate = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    quotation_validdate = data.get('quotation_validdate')
    quotation_email = data.get('quotation_email')
    vat_rate = data.get('vat_rate')
    currency_type= data.get('currency_type')

    connection = get_db_connection()
    if connection is None:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = connection.cursor()

    try:
        # Generate quotation code
        cursor.execute(
            "SELECT COALESCE(MAX(quotation_no), 0) + 1 FROM quotation")
        next_quotation_no = cursor.fetchone()[0]
        next_number_str = str(next_quotation_no).zfill(3)
        month_roman = ["I", "II", "III", "IV", "V", "VI", "VII",
                       "VIII", "IX", "X", "XI", "XII"][datetime.now().month - 1]
        year_part = datetime.now().year
        type_code = {'BR': 'BR', 'VMS': 'VMS',
                     'PR': 'PR'}.get(quotation_type, 'XX')
        quotation_code = f"{next_number_str}/{type_code}/{month_roman}/{year_part}"

        # Insert main quotation
        cursor.execute("""
            INSERT INTO quotation (quotation_no, quotation_type, quotation_solution, quotation_code,
                                   quotation_pic, quotation_pt, quotation_customer, quotation_customeraddress,
                                   quotation_subtotal, quotation_managementfee, quotation_ppn, quotation_grandtotal,
                                   quotation_createdate, quotation_validdate, quotation_email, vatrate, currency)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s )
        """, (next_quotation_no, quotation_type, quotation_solution, quotation_code, quotation_pic,
              quotation_pt, quotation_customer, quotation_customeraddress, quotation_subtotal,
              quotation_managementfee, quotation_ppn, quotation_grandtotal, quotation_createdate, quotation_validdate, quotation_email, vat_rate, currency_type))

        connection.commit()
        quotation_id = cursor.lastrowid

        # Insert expenses
        expenses_data = data.get('expenses', [])
        for expense in expenses_data:
            expense_description = expense.get('expense_description')
            expense_total = expense.get('expense_total')
            expense_discount = expense.get('expense_discount')
            expense_linecount = expense.get('expense_linecount')

            cursor.execute("""
                INSERT INTO quotation_expense (quotation_no, expense_description, expense_total,
                                               expense_discount, expense_linecount)
                VALUES (%s, %s, %s, %s, %s)
            """, (quotation_id, expense_description, expense_total, expense_discount, expense_linecount))

        # Insert terms and conditions
        tos_data = data.get('terms_and_conditions', [])
        for tos in tos_data:
            tos_description = tos.get('tos_description')

            cursor.execute("""
                INSERT INTO quotation_tos (quotation_no, tos_description)
                VALUES (%s, %s)
            """, (quotation_id, tos_description))

        connection.commit()

        # Generate Excel file
        file_path = generate_quotation_file(
            data, quotation_code, quotation_type)

        return jsonify({
            'xlsxUrl': f'{quotation_code.replace("/", "_")}.xlsx',
            'pdfUrl': f'{quotation_code.replace("/", "_")}.pdf'
        }), 200

    except mysql.connector.Error as err:
        connection.rollback()
        print(f"Database error: {err}")
        return jsonify({"error": str(err)}), 500

    finally:
        cursor.close()
        connection.close()
