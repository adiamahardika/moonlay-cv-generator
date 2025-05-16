from flask import Blueprint, jsonify, request, send_from_directory, abort, current_app
import os
import re
from docxtpl import DocxTemplate
import mysql.connector
import subprocess
from werkzeug.utils import secure_filename
from datetime import datetime
from .utils import parse_job_experience, parse_customer_experience, parse_education

cv_blueprint = Blueprint('cv', __name__, static_folder='../static')

# ============================
# == [ROUTE] Generate CV ==
# ============================
@cv_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        data = request.get_json()
        applicant_id = data.get('applicantid')
        applicant_name = data.get('applicantname')

        if not applicant_id:
            return jsonify({'error': 'Applicant ID is required'}), 400

        query = """
        SELECT 
            a.applicant_name,
            a.applicant_city,
            a.applicant_dateofbirth,
            a.applicant_gender,
            a.applicant_nationality,
            GROUP_CONCAT(DISTINCT j.position, '|', j.company_name, ':', j.start_date, '-', j.end_date) AS job_experiences,
            GROUP_CONCAT(DISTINCT c.position, '|', c.company_name, ':', c.start_date, '/', c.end_date, '*', c.project_name) AS customer_experiences,
            GROUP_CONCAT(DISTINCT e.institution_name, ' - ', e.degree_title , ' (', e.start_date, ' / ', e.end_date, ')') AS education,
            GROUP_CONCAT(DISTINCT CONCAT(cert.certification_name, ' : ', cert.issued_by, ' | ', cert.issue_date, ')') SEPARATOR '\n') AS certifications,
            GROUP_CONCAT(DISTINCT s.programming_skill SEPARATOR '|') AS programming_skills,
            GROUP_CONCAT(DISTINCT s.knownlanguage_skill SEPARATOR '|') AS known_languages,
            GROUP_CONCAT(DISTINCT s.technologyknowledge_skill SEPARATOR '|') AS technology_skills,
            GROUP_CONCAT(DISTINCT s.productknowledge_skill SEPARATOR '|') AS product_knowledge_skills,
            GROUP_CONCAT(DISTINCT s.operatingsystem_skill SEPARATOR '|') AS operating_systems,
            GROUP_CONCAT(DISTINCT s.projectmethodology_skill SEPARATOR '|') AS project_methodologies,
            GROUP_CONCAT(DISTINCT s.other_skill SEPARATOR '|') AS other_skills
        FROM applicant a
        LEFT JOIN jobexperience j ON a.applicant_id = j.applicant_id
        LEFT JOIN customerexperience c ON a.applicant_id = c.applicant_id
        LEFT JOIN education e ON a.applicant_id = e.applicant_id
        LEFT JOIN certification cert ON a.applicant_id = cert.applicant_id
        LEFT JOIN skills s ON a.applicant_id = s.applicant_id
        WHERE a.applicant_id = %s
        """

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            cursor.execute(query, (applicant_id,))
            applicant = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

        if not applicant:
            return jsonify({'error': 'Applicant not found'}), 404

        # Data parsing
        applicant_job_experience = applicant.get('job_experiences', '')
        applicant_customer_experience = applicant.get('customer_experiences', '')
        applicant_city = applicant.get('applicant_city', '')
        applicant_dob = applicant.get('applicant_dateofbirth', '')
        applicant_gender = applicant.get('applicant_gender', '')
        applicant_certification = applicant.get('certifications', '')
        applicant_education = applicant.get('education', '')
        programming_skills = applicant.get('programming_skills', '')
        product_knowledge_skills = applicant.get('product_knowledge_skills', '')
        technology_knowledge_skills = applicant.get('technology_skills', '')
        operating_systems = applicant.get('operating_systems', '')
        project_methodologies = applicant.get('project_methodologies', '')
        other_skills = applicant.get('other_skills', '')
        applicant_knownlanguage = applicant.get('known_languages', '')
        applicant_nationality = applicant.get('applicant_nationality', '')

        default_languages = ["English"]
        languages = default_languages.copy()

        if isinstance(applicant_knownlanguage, str) and applicant_knownlanguage:
            split_languages = [lang.strip() for lang in applicant_knownlanguage.split(',') if lang.strip()]
            unique_languages = set(split_languages)
            languages.extend(unique_languages)
            languages = list(dict.fromkeys(languages))

        first_language = languages[0] if languages else 'English'
        second_language = languages[1] if len(languages) > 1 else None

        job_experience_df = parse_job_experience(applicant_job_experience)
        customer_experience_df = parse_customer_experience(applicant_customer_experience)
        education_parsed = parse_education(applicant_education)

        template_path = os.path.join("static", "CV_template.docx")
        if not os.path.exists(template_path):
            return jsonify({'error': 'Template file not found'}), 404

        doc = DocxTemplate(template_path)
        context = {
            'jobexperiences': job_experience_df.to_dict(orient='records'),
            'customerexperiences': customer_experience_df.to_dict(orient='records'),
            'applicant_name': applicant_name,
            'applicant_city': applicant_city,
            'applicant_dob': applicant_dob,
            'applicant_gender': applicant_gender,
            'applicant_certification': applicant_certification,
            'applicant_education': education_parsed,
            'programming_skills': programming_skills,
            'technology_knowledge': technology_knowledge_skills,
            'project_methodology': project_methodologies,
            'product_knowledge': product_knowledge_skills,
            'operating_system': operating_systems,
            'other_skills': other_skills,
            'known_languages': languages,
            'applicant_nationality': applicant_nationality,
        }

        output_path = os.path.join('static', 'word', f"{applicant_name}_CV.docx")
        doc.render(context)
        doc.save(output_path)

        pdf_path = os.path.join('static', 'pdf', f"{applicant_name}_CV.pdf")
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

        subprocess.run([
            'soffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', os.path.dirname(pdf_path),
            os.path.abspath(output_path)
        ], check=True)

        if not os.path.exists(pdf_path):
            return jsonify({'error': 'PDF file not created'}), 500

        return jsonify({
            'docxUrl': f'{applicant_name}_CV.docx',
            'pdfUrl': f'{applicant_name}_CV.pdf'
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================
# == [ROUTE] Embed / Download ==
# ============================
@cv_blueprint.route('/embed/pdf/<path:filename>', methods=['GET'])
def embed_pdf(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename)


@cv_blueprint.route('/download/pdf/<path:filename>', methods=['GET'])
def download_pdf(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)


@cv_blueprint.route('/download/word/<path:filename>', methods=['GET'])
def download_docx(filename):
    word_folder = os.path.join(current_app.static_folder, 'word')
    return send_from_directory(word_folder, filename, as_attachment=True)


# ============================
# == [ROUTE] Upload Manual ==
# ============================
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx'}
UPLOAD_FOLDER = os.path.join('static', 'manual_uploads')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@cv_blueprint.route('/upload/manual', methods=['POST'])
def upload_manual_cv():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename_with_time = f"{timestamp}_{filename}"

        save_path = os.path.join(UPLOAD_FOLDER, filename_with_time)
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        file.save(save_path)

        file_url = f'/static/manual_uploads/{filename_with_time}'
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename_with_time,
            'url': file_url
        }), 200

    return jsonify({'error': 'Invalid file type'}), 400
