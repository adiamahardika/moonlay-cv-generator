from flask import Blueprint, send_from_directory
import os


quotation_bp = Blueprint('quotation', __name__, url_prefix='/')

from app.routes.quotation_fetch import *
from app.routes.quotation_create import *
from app.routes.quotation_delete import *
from app.routes.quotation_update import *

output_dir = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')), 'static', 'xlsx')
output_pdf_dir = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')), 'static', 'pdf')


@quotation_bp.route('/embed/pdf/<path:filename>', methods=['GET'])
def embed_pdf(filename):
    # Ensure that the PDF directory is correctly mapped
    pdf_folder = os.path.join(os.getcwd(), 'static', 'pdf')
    return send_from_directory(pdf_folder, filename)


@quotation_bp.route('/download/pdf/<path:filename>', methods=['GET'])
def download_pdf(filename):
    # Serve PDF from the 'static/pdf' folder with attachment flag
    pdf_folder = os.path.join(os.getcwd(), 'static', 'pdf')
    return send_from_directory(pdf_folder, filename, as_attachment=True)


@quotation_bp.route('/download/xlsx/<path:filename>', methods=['GET'])
def download_xlsx(filename):
    # Serve XLSX file from the 'static/xlsx' folder with attachment flag
    xlsx_folder = os.path.join(os.getcwd(), 'static', 'xlsx')
    return send_from_directory(xlsx_folder, filename, as_attachment=True)
