from flask import Blueprint, jsonify
from app.utils import get_db_connection

stats_blueprint = Blueprint('stats', __name__)

def parse_skills(raw_rows):
    """Flatten and count each individual skill."""
    from collections import Counter
    all_skills = []

    for row in raw_rows:
        raw = row[0]
        if raw:
            # Split by comma, strip whitespaces
            skills = [skill.strip() for skill in raw.split(',') if skill.strip()]
            all_skills.extend(skills)

    return [{'name': name, 'worker_count': count} for name, count in Counter(all_skills).items()]

@stats_blueprint.route('/api/statistics', methods=['GET'])
def get_statistics():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Ambil semua programming_skill
        cursor.execute("""
            SELECT programming_skill FROM skills 
            WHERE programming_skill IS NOT NULL AND programming_skill != ''
        """)
        programming_raw = cursor.fetchall()
        programming_stats = parse_skills(programming_raw)

        # Ambil semua productknowledge_skill
        cursor.execute("""
            SELECT productknowledge_skill FROM skills 
            WHERE productknowledge_skill IS NOT NULL AND productknowledge_skill != ''
        """)
        product_raw = cursor.fetchall()
        product_stats = parse_skills(product_raw)

        cursor.close()
        conn.close()

        return jsonify({
            "programming_skills": programming_stats,
            "product_knowledge": product_stats
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500
