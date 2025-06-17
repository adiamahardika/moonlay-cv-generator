from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from .utils import generate_cv_as_pdf

cv_generate_blueprint = Blueprint('cv_generate', __name__)

@cv_generate_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        data = request.get_json()

        applicant_name = data.get('applicant_name')
        applicant_email = data.get('applicant_email')
        applicant_dob = data.get('applicant_dob', '-')
        applicant_city = data.get('applicant_city', '-')
        applicant_gender = data.get('applicant_gender', '-')
        applicant_nationality = data.get('applicant_nationality', '-')

        if not applicant_name or not applicant_email:
            return jsonify({"error": "Name and email are required"}), 400

        # Buat nama file yang aman
        safe_name = applicant_name.replace(' ', '_')

        # Path file
        template_path = os.path.join(current_app.static_folder, 'word', 'CV_template.docx')
        output_docx = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.docx")
        output_pdf = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.pdf")  # Not used now

        # Buat folder output kalau belum ada
        os.makedirs(os.path.dirname(output_docx), exist_ok=True)

        # Data lengkap untuk template Word
        generate_cv_as_pdf(template_path, output_docx, output_pdf, {
            "applicant_name": applicant_name,
            "applicant_email": applicant_email,
            "applicant_dob": applicant_dob,
            "applicant_city": applicant_city,
            "applicant_gender": applicant_gender,
            "applicant_nationality": applicant_nationality,

            "applicant_education": data.get('applicant_education', []),
            "jobexperiences": data.get('jobexperiences', []),
            "customerexperiences": data.get('customerexperiences', []),
            "applicant_certification": data.get('applicant_certification', '-'),
            "programming_skills": data.get('programming_skills', '-'),
            "product_knowledge": data.get('product_knowledge', '-'),
            "technology_knowledge": data.get('technology_knowledge', '-'),
            "operating_system": data.get('operating_system', '-'),
            "project_methodology": data.get('project_methodology', '-'),
            "other_skills": data.get('other_skills', '-'),
            "known_languages": data.get('known_languages', []),
        })

        return jsonify({
            "message": "CV berhasil dibuat",
            "preview_url": f"/static/pdf/{safe_name}.docx",  # sementara pakai .docx
            "download_url": f"/static/pdf/{safe_name}.docx"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_generate_blueprint.route('/download/<filename>', methods=['GET'])
def download_cv(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)
