from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from .utils import generate_cv_as_pdf, get_applicant_data

cv_generate_blueprint = Blueprint('cv_generate', __name__)

@cv_generate_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        data = request.get_json()
        applicant_id = data.get('applicant_id')

        if not applicant_id:
            return jsonify({"error": "applicant_id is required"}), 400

        # Ambil data dari DB
        cv_data = get_applicant_data(applicant_id)

        # Validasi minimal
        if not cv_data.get("applicant_name"):
            return jsonify({"error": "Applicant data not found"}), 404

        safe_name = cv_data['applicant_name'].replace(' ', '_')
        template_path = os.path.join(current_app.static_folder, 'word', 'CV_template.docx')
        output_docx = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.docx")
        output_pdf = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.pdf")

        os.makedirs(os.path.dirname(output_docx), exist_ok=True)

        generate_cv_as_pdf(template_path, output_docx, output_pdf, cv_data)

        return jsonify({
            "message": "CV berhasil dibuat",
            "preview_url": f"/static/pdf/{safe_name}.pdf",
            "download_url": f"/static/pdf/{safe_name}.pdf"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_generate_blueprint.route('/download/<filename>', methods=['GET'])
def download_cv(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)
