from flask import Blueprint, jsonify, request, send_from_directory, abort, current_app
import os
import re
from docxtpl import DocxTemplate
import mysql.connector
import subprocess
from werkzeug.utils import secure_filename
from .utils import get_db_connection, parse_job_experience, parse_customer_experience, parse_education

# Konfigurasi upload
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

cv_blueprint = Blueprint('cv', __name__, static_folder='../static')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@cv_blueprint.route('/upload-manual', methods=['POST'])
def upload_manual():
    try:
        # Cek jika request tidak mengandung file
        if 'file' not in request.files:
            return jsonify({'error': 'Tidak ada file yang diunggah'}), 400
        
        file = request.files['file']
        
        # Jika user tidak memilih file
        if file.filename == '':
            return jsonify({'error': 'Tidak ada file yang dipilih'}), 400
        
        # Cek ekstensi file
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipe file tidak diizinkan'}), 400
        
        # Cek ukuran file
        if request.content_length > MAX_FILE_SIZE:
            return jsonify({'error': 'Ukuran file terlalu besar (maksimal 5MB)'}), 400
        
        if file and allowed_file(file.filename):
            # Buat folder upload_manuals jika belum ada
            upload_folder = os.path.join(current_app.static_folder, 'upload_manuals')
            os.makedirs(upload_folder, exist_ok=True)
            
            # Secure filename dan buat nama unik
            filename = secure_filename(file.filename)
            base, ext = os.path.splitext(filename)
            unique_filename = f"{base}_{os.urandom(4).hex()}{ext}"
            
            # Simpan file
            file_path = os.path.join(upload_folder, unique_filename)
            file.save(file_path)
            
            return jsonify({
                'message': 'File berhasil diunggah',
                'filename': unique_filename,
                'path': f'/static/upload_manuals/{unique_filename}'
            }), 200
    
    except Exception as e:
        current_app.logger.error(f'Error saat upload: {str(e)}')
        return jsonify({'error': 'Terjadi kesalahan saat mengunggah file'}), 500

@cv_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        # Extract the applicant's ID from the request
        data = request.get_json()
        print(f"Received data: {data}")

        # Make sure to use the correct key
        applicant_id = data.get('applicantid')
        applicant_name = data.get('applicantname')

        # Check if applicant_id is provided
        if not applicant_id:
            return jsonify({'error': 'Applicant ID is required'}), 400

        # Base query
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

        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        try:
            # Execute the query with the applicant_id parameter
            cursor.execute(query, (applicant_id,))
            applicant = cursor.fetchone()
        finally:
            cursor.close()
            conn.close()

        if not applicant:
            return jsonify({'error': 'Applicant not found'}), 404

        # Extracting applicant data with None checks
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

        # Prepare languages with a default value
        default_languages = ["English"]

        print(f"Debug: applicant_knownlanguage raw value = {applicant_knownlanguage}")

        languages = default_languages.copy()

        if isinstance(applicant_knownlanguage, str) and applicant_knownlanguage:
            split_languages = [
                lang.strip() for lang in applicant_knownlanguage.split(',') if lang.strip()]

            unique_languages = set(split_languages)
            languages.extend(unique_languages)
            languages = list(dict.fromkeys(languages))

            print(f"Debug: Parsed languages = {languages}")
        else:
            print("Debug: applicant_knownlanguage is not a valid string or is None, defaulting to English.")

        print(f"Debug: Length of languages list = {len(languages)}")

        first_language = languages[0] if languages else 'English'
        print(f"Debug: First language = {first_language}")

        second_language = languages[1] if len(languages) > 1 else None
        if second_language:
            print(f"Debug: Second language = {second_language}")
        else:
            print("Debug: Second language not available.")

        # Parse experiences
        job_experience_df = parse_job_experience(applicant_job_experience)
        customer_experience_df = parse_customer_experience(applicant_customer_experience)
        education_parsed = parse_education(applicant_education)

        # Define the path to the template
        static_folder = "static"
        template_filename = "CV_template.docx"
        template_path = os.path.join(static_folder, template_filename)

        if not os.path.exists(template_path):
            return jsonify({'error': 'Template file not found'}), 404

        # Load the DOCX template and render
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

        # Save the rendered document
        output_path = os.path.join('static', 'word', f"{applicant_name}_CV.docx")
        doc.render(context)
        doc.save(output_path)

        # Convert DOCX to PDF using LibreOffice
        pdf_path = os.path.join('static', 'pdf', f"{applicant_name}_CV.pdf")
        os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

        try:
            subprocess.run([
                'soffice',
                '--headless',
                '--convert-to', 'pdf',
                '--outdir', os.path.dirname(pdf_path),
                os.path.abspath(output_path)
            ], check=True)
        except subprocess.CalledProcessError as e:
            return jsonify({'error': 'Conversion to PDF failed', 'details': str(e)}), 500

        if not os.path.exists(pdf_path):
            return jsonify({'error': 'PDF file not created'}), 500

        return jsonify({
            'docxUrl': f'/download/word/{applicant_name}_CV.docx',
            'pdfUrl': f'/download/pdf/{applicant_name}_CV.pdf'
        }), 200

    except Exception as e:
        current_app.logger.error(f'Error generating CV: {str(e)}')
        return jsonify({'error': str(e)}), 500

@cv_blueprint.route('/download/upload_manuals/<path:filename>', methods=['GET'])
def download_uploaded_file(filename):
    try:
        upload_folder = os.path.join(current_app.static_folder, 'upload_manuals')
        return send_from_directory(upload_folder, filename, as_attachment=True)
    except FileNotFoundError:
        abort(404)

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