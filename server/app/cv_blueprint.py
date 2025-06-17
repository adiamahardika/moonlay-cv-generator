from flask import Blueprint, jsonify, request, current_app, send_from_directory
import os
from werkzeug.utils import secure_filename
from datetime import datetime
from .utils import parse_job_experience, parse_customer_experience, parse_education
from .utils import db_session
from sqlalchemy import text


cv_blueprint = Blueprint('cv', __name__)

# === Konfigurasi Upload ===
ALLOWED_UPLOAD_EXTENSIONS = {'pdf', 'doc', 'docx'}
ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB

# === Path Folder OneDrive (tanpa subfolder) ===
ONEDRIVE_FOLDER = r'C:\Users\HP\OneDrive - MOONLAY TECHNOLOGIES, PT\CV-Files-sementara'

# === Helper Functions ===
def allowed_file(filename, allowed_extensions):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

def validate_file(file, allowed_extensions):
    if file.filename == '':
        return "Tidak ada file yang dipilih"
    if not allowed_file(file.filename, allowed_extensions):
        return "Tipe file tidak diizinkan"
    if request.content_length > MAX_UPLOAD_SIZE:
        return "Ukuran file terlalu besar (maksimal 5MB)"
    return None

# === Upload Manual Document ===
@cv_blueprint.route('/upload-manual', methods=['POST'])
def upload_manual_document():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Tidak ada file yang diunggah'}), 400

        file = request.files['file']
        error = validate_file(file, ALLOWED_UPLOAD_EXTENSIONS.union(ALLOWED_IMAGE_EXTENSIONS))
        if error:
            return jsonify({'error': error}), 400

        os.makedirs(ONEDRIVE_FOLDER, exist_ok=True)

        filename = secure_filename(file.filename)
        base, ext = os.path.splitext(filename)
        unique_filename = f"{base}_{os.urandom(4).hex()}{ext}"
        file_path = os.path.join(ONEDRIVE_FOLDER, unique_filename)
        file.save(file_path)

        return jsonify({
            'message': 'File berhasil diunggah',
            'filename': unique_filename,
            'path': file_path
        }), 200

    except Exception as e:
        current_app.logger.error(f'Error saat upload: {str(e)}')
        return jsonify({'error': 'Terjadi kesalahan saat mengunggah file'}), 500

# === Upload Manual CV ===
@cv_blueprint.route('/upload/manual', methods=['POST'])
def upload_manual_cv():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'Tidak ada file yang diunggah'}), 400

        file = request.files['file']
        error = validate_file(file, ALLOWED_UPLOAD_EXTENSIONS)
        if error:
            return jsonify({'error': error}), 400

        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        filename_with_time = f"{timestamp}_{filename}"

        os.makedirs(ONEDRIVE_FOLDER, exist_ok=True)
        file_path = os.path.join(ONEDRIVE_FOLDER, filename_with_time)
        file.save(file_path)

        return jsonify({
            'message': 'File berhasil diunggah',
            'filename': filename_with_time,
            'path': file_path
        }), 200

    except Exception as e:
        current_app.logger.error(f'Error saat upload CV: {str(e)}')
        return jsonify({'error': 'Terjadi kesalahan saat mengunggah CV'}), 500

# === Tampilkan File Origin CV untuk HR (preview atau download) ===
@cv_blueprint.route('/origin-cv/<filename>', methods=['GET'])
def get_origin_cv(filename):
    try:
        return send_from_directory(ONEDRIVE_FOLDER, filename)
    except FileNotFoundError:
        return jsonify({'error': 'File tidak ditemukan'}), 404
    
@cv_blueprint.route('/applicant/<string:applicant_id>', methods=['GET'])
def get_applicant_by_id(applicant_id):
    try:
        result = db_session.execute(
            text("SELECT * FROM applicant WHERE applicant_id = :id"),
            {'id': applicant_id}
        ).mappings().fetchone()

        print("Diterima ID:", applicant_id)

        if not result:
            return jsonify({'error': 'Pelamar tidak ditemukan'}), 404

        return jsonify(dict(result)), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



# === Update data pelamar ===
@cv_blueprint.route('/applicant/<string:applicant_id>', methods=['PUT'])
def update_applicant_by_id(applicant_id):
    data = request.get_json()
    try:
        db_session.execute(
            text("""
                UPDATE applicant
                SET applicant_name = :name,
                    applicant_contact = :contact,
                    applicant_email = :email,
                    applicant_address = :address,
                    applicant_city = :city,
                    applicant_nationality = :nationality,
                    applicant_gender = :gender
                WHERE applicant_id = :id
            """), {
                'id': applicant_id.strip(),
                'name': data.get('applicant_name'),
                'contact': data.get('applicant_contact'),
                'email': data.get('applicant_email'),
                'address': data.get('applicant_address'),
                'city': data.get('applicant_city'),
                'nationality': data.get('applicant_nationality'),
                'gender': data.get('applicant_gender'),
            }
        )
        db_session.commit()
        return jsonify({'message': 'Data pelamar berhasil diperbarui'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500