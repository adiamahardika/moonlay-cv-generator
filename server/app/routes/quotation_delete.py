from flask import jsonify, request
from .quotation_routes import quotation_bp
from ..db import get_db_connection

@quotation_bp.route('/delete-quotations', methods=['POST'])
def delete_record():
    try:
        data = request.get_json()
        # Updated to expect 'emails' array from the frontend
        quotation_nos = data.get('quotationno')

        if not quotation_nos or not isinstance(quotation_nos, list):
            return jsonify({"error": "Invalid or missing emails"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Prepare query to update all emails
        query = "UPDATE quotation SET visibility = 0 WHERE quotation_no = %s"
        # Loop through the emails
        cursor.executemany(query, [(quotation_no,)
                           for quotation_no in quotation_nos])
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Records visibility updated successfully."}), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'Failed to update record visibility'}), 500

