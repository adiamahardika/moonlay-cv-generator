from flask import Blueprint, jsonify, request
from .utils import get_db_connection, format_applicant_data

record_blueprint = Blueprint('record', __name__)


def format_applicant_data(rows):
    formatted_data = []
    for applicant in rows:
        formatted_applicant = {
            "applicant_id": applicant["applicant_id"],
            "applicant_name": applicant["applicant_name"], 
            "applicant_gender": applicant["applicant_gender"],
            "applicant_dateofbirth": applicant["applicant_dateofbirth"],
            "applicant_nationality": applicant["applicant_nationality"],
            "applicant_address": applicant["applicant_address"],
            "applicant_city": applicant["applicant_city"],
            "applicant_contact": applicant["applicant_contact"],
            "applicant_email": applicant["applicant_email"],
            "applicant_dateofapplication": applicant["applicant_dateofapplication"],
            "applicant_resumelink": applicant["applicant_resumelink"],
            "visibility": applicant["visibility"],
            "programming_skills": applicant["programming_skills"] if applicant["programming_skills"] else 'None',
            "product_knowledge_skills": applicant["product_knowledge_skills"] if applicant["product_knowledge_skills"] else 'None',
            "known_languages": applicant["known_languages"] if applicant["known_languages"] else 'None',
            "operating_systems": applicant["operating_systems"] if applicant["operating_systems"] else 'None',
            "project_methodologies": applicant["project_methodologies"] if applicant["project_methodologies"] else 'None',
            "other_skills": applicant["other_skills"] if applicant["other_skills"] else 'None',
            "job_experiences": applicant["job_experiences"] if applicant["job_experiences"] else 'No job experience available.',
            "customer_experiences": applicant["customer_experiences"] if applicant["customer_experiences"] else 'No customer experience available.',
            "education": applicant["education"] if applicant["education"] else 'No education data available.',
        }

        # Formatting skills into HTML with spacing
        formatted_applicant["applicant_skill"] = f"""
            <b>Programming</b><br>{formatted_applicant["programming_skills"]}<br><br>
            <b>Product Knowledge</b><br>{formatted_applicant["product_knowledge_skills"]}<br><br>
            <b>Known Language</b><br>{formatted_applicant["known_languages"]}<br><br>
            <b>Operating System</b><br>{formatted_applicant["operating_systems"]}<br><br>
            <b>Project Methodology</b><br>{formatted_applicant["project_methodologies"]}<br><br>
            <b>Other</b><br>{formatted_applicant["other_skills"]}<br><br>
        """

        # Formatting education
        formatted_applicant["applicant_education"] = f"""
            <br>{formatted_applicant["education"]}<br><br>
        """

        # Adding the formatted applicant to the list
        formatted_data.append(formatted_applicant)

    return formatted_data


@record_blueprint.route('/delete-record', methods=['POST'])
def delete_record():
    try:
        data = request.get_json()
        # Updated to expect 'emails' array from the frontend
        applicantids = data.get('applicantid')

        if not applicantids or not isinstance(applicantids, list):
            return jsonify({"error": "Invalid or missing emails"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        # Prepare query to update all emails
        query = "UPDATE applicant SET visibility = 0 WHERE applicant_id = %s"
        # Loop through the emails
        cursor.executemany(query, [(applicantid,)
                           for applicantid in applicantids])
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({"message": "Records visibility updated successfully."}), 200

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({'error': 'Failed to update record visibility'}), 500

@record_blueprint.route('/records.json')
def get_records():
    try:
        conn = get_db_connection()

        # Create a cursor object
        cursor = conn.cursor(dictionary=True)

        # Execute the modified query
        query = """
       SELECT 
        a.applicant_id,
        a.applicant_name,
        a.applicant_gender,
        a.applicant_dateofbirth,
        a.applicant_nationality,
        a.applicant_address,
        a.applicant_city,
        a.applicant_contact,
        a.applicant_email,
        a.applicant_dateofapplication,
        a.applicant_resumelink,
        a.visibility,
        GROUP_CONCAT(DISTINCT s.programming_skill SEPARATOR ', ') AS programming_skills,
        GROUP_CONCAT(DISTINCT s.productknowledge_skill SEPARATOR ', ') AS product_knowledge_skills,
        GROUP_CONCAT(DISTINCT s.knownlanguage_skill SEPARATOR ', ') AS known_languages,
        GROUP_CONCAT(DISTINCT s.operatingsystem_skill SEPARATOR ', ') AS operating_systems,
        GROUP_CONCAT(DISTINCT s.projectmethodology_skill SEPARATOR ', ') AS project_methodologies,
        GROUP_CONCAT(DISTINCT s.other_skill SEPARATOR ', ') AS other_skills,
        
        GROUP_CONCAT(DISTINCT 
            CONCAT('<br>', 
                '<b>', j.position, '</b>', 
                '<br>', j.company_name, 
                '<br>', j.start_date, ' - ', IFNULL(j.end_date, 'Present'), 
                '<br>'
            ) SEPARATOR '') AS job_experiences,
        
        GROUP_CONCAT(DISTINCT 
            CONCAT('<br>', 
                '<b>', c.position, '</b>', 
                '<br>', c.company_name, 
                '<br>', c.start_date, ' - ', IFNULL(c.end_date, 'Present'), 
                '<br>', '[', c.project_name, ']', 
                '<br>'
            ) SEPARATOR '') AS customer_experiences,
        
        GROUP_CONCAT(DISTINCT 
            CONCAT('<br>', 
                '<b>', e.institution_name, '</b>', 
                '<br>', e.degree_title, 
                '<br>', '(', e.start_date, ' - ', e.end_date, ')' 
            ) SEPARATOR '') AS education
    FROM 
        applicant a
    LEFT JOIN 
        skills s ON a.applicant_id = s.applicant_id
    LEFT JOIN 
        jobexperience j ON a.applicant_id = j.applicant_id
    LEFT JOIN 
        customerexperience c ON a.applicant_id = c.applicant_id
    LEFT JOIN 
        education e ON a.applicant_id = e.applicant_id
    WHERE 
        a.visibility = 1
    GROUP BY 
        a.applicant_id;
        """
        cursor.execute(query)

        # Fetch all rows from the executed query
        rows = cursor.fetchall()

        # Close the cursor and connection
        cursor.close()
        conn.close()

        # Transform the data
        formatted_rows = format_applicant_data(rows)

        # Return JSON response
        return jsonify(formatted_rows)
    except Exception as e:
        print(e)
        return jsonify({'error': 'Failed to fetch records'}), 500
