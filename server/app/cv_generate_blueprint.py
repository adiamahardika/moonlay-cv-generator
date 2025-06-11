from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from .utils import generate_cv_as_pdf

cv_generate_blueprint = Blueprint('cv_generate', __name__)

@cv_generate_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        address = data.get('address', '-')

        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400

        # Buat nama file yang aman
        safe_name = name.replace(' ', '_')

        # Tentukan path template dan output
        template_path = os.path.join(current_app.static_folder, 'word', 'CV_template.docx')
        output_docx = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.docx")
        output_pdf = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.pdf")

        # Generate CV dan konversi ke PDF
        generate_cv_as_pdf(template_path, output_docx, output_pdf, {
            "name": name,
            "email": email,
            "address": address
        })

        return jsonify({
            "message": "CV berhasil dibuat",
            "preview_url": f"/static/pdf/{safe_name}.pdf",
            "download_url": f"/download/{safe_name}.pdf"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_generate_blueprint.route('/download/<filename>', methods=['GET'])
def download_cv(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)
from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from .utils import generate_cv_as_pdf

cv_generate_blueprint = Blueprint('cv_generate', __name__)

@cv_generate_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        address = data.get('address', '-')

        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400

        # Buat nama file yang aman
        safe_name = name.replace(' ', '_')

        # Tentukan path template dan output
        template_path = os.path.join(current_app.static_folder, 'word', 'CV_template.docx')
        output_docx = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.docx")
        output_pdf = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.pdf")

        # Generate CV dan konversi ke PDF
        generate_cv_as_pdf(template_path, output_docx, output_pdf, {
            "name": name,
            "email": email,
            "address": address
        })

        return jsonify({
            "message": "CV berhasil dibuat",
            "preview_url": f"/static/pdf/{safe_name}.pdf",
            "download_url": f"/download/{safe_name}.pdf"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_generate_blueprint.route('/download/<filename>', methods=['GET'])
def download_cv(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)
from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from .utils import generate_cv_as_pdf

cv_generate_blueprint = Blueprint('cv_generate', __name__)

@cv_generate_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        address = data.get('address', '-')

        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400

        # Buat nama file yang aman
        safe_name = name.replace(' ', '_')

        # Tentukan path template dan output
        template_path = os.path.join(current_app.static_folder, 'word', 'CV_template.docx')
        output_docx = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.docx")
        output_pdf = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.pdf")

        # Generate CV dan konversi ke PDF
        generate_cv_as_pdf(template_path, output_docx, output_pdf, {
            "name": name,
            "email": email,
            "address": address
        })

        return jsonify({
            "message": "CV berhasil dibuat",
            "preview_url": f"/static/pdf/{safe_name}.pdf",
            "download_url": f"/download/{safe_name}.pdf"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_generate_blueprint.route('/download/<filename>', methods=['GET'])
def download_cv(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)
from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from .utils import generate_cv_as_pdf

cv_generate_blueprint = Blueprint('cv_generate', __name__)

@cv_generate_blueprint.route('/generate-cv', methods=['POST'])
def generate_cv():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        address = data.get('address', '-')

        if not name or not email:
            return jsonify({"error": "Name and email are required"}), 400

        # Buat nama file yang aman
        safe_name = name.replace(' ', '_')

        # Tentukan path template dan output
        template_path = os.path.join(current_app.static_folder, 'word', 'CV_template.docx')
        output_docx = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.docx")
        output_pdf = os.path.join(current_app.static_folder, 'pdf', f"{safe_name}.pdf")

        # Generate CV dan konversi ke PDF
        generate_cv_as_pdf(template_path, output_docx, output_pdf, {
            "name": name,
            "email": email,
            "address": address
        })

        return jsonify({
            "message": "CV berhasil dibuat",
            "preview_url": f"/static/pdf/{safe_name}.pdf",
            "download_url": f"/download/{safe_name}.pdf"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@cv_generate_blueprint.route('/download/<filename>', methods=['GET'])
def download_cv(filename):
    pdf_folder = os.path.join(current_app.static_folder, 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)
