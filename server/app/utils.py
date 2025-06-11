import mysql.connector
import re
import os
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from docx2pdf import convert

engine = create_engine(os.getenv("HR_DB_URI"))
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def generate_cv_as_pdf(template_path, output_docx, output_pdf, data):
    # Generate docx dulu
    generate_cv_from_template(template_path, output_docx, data)
    
    # Konversi ke PDF
    convert(output_docx, output_pdf)

def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("HR_DB_HOST"),
        user=os.getenv("HR_DB_USER"),
        password=os.getenv("HR_DB_PASSWORD"),
        database=os.getenv("HR_DB_NAME"),

        port=int(os.getenv("HR_DB_PORT"))
    )

def parse_customer_experience(customer_experience_str):
    positions = []
    employers = []
    start_dates = []
    end_dates = []
    projects = []

    # Split customer experiences using the '*' character
    customer_entries = customer_experience_str.strip().split(',')

    for entry in customer_entries:
        entry = entry.strip()
        if not entry:
            continue  # Skip empty entries

        # Split position, employer, and dates
        parts = entry.split(':')
        if len(parts) != 2:
            continue  # Skip malformed entries

        position_employer = parts[0].strip().split('|')
        if len(position_employer) != 2:
            continue  # Skip malformed entries

        position = position_employer[0].strip()
        employer = position_employer[1].strip()
        dates = parts[1].strip().split('/')
        start_date = dates[0].strip()
        end_date = dates[1].strip() if len(dates) > 1 else 'Present'

        # Clean dates
        start_date = re.sub(r'[^0-9/-]', '', start_date) or 'Not Specified'
        end_date = re.sub(r'[^0-9/-]', '', end_date) or 'Present'

        # Append values to lists
        positions.append(position)
        employers.append(employer)
        start_dates.append(start_date)
        end_dates.append(end_date)

        # Extract project name for customer experience
        project_name = parts[1].strip().split(
            '*')[-1] if '*' in parts[1] else ''
        projects.append(project_name.strip())

    # Create DataFrame for customer experience
    return pd.DataFrame({
        'Position': positions,
        'Employer': employers,
        'Start Date': start_dates,
        'End Date': end_dates,
        'Project Name': projects
    })

def parse_education(group_concat_string):
    # List to store parsed education details
    parsed_education = []

    # Regular expression pattern to capture institution, degree title, start, and end dates
    # This assumes a format like: "Institution Name - Degree Title (start_date / end_date)"
    pattern = r'([^,]+?) - ([^()]+?) \(([^/]+?) / ([^)]+?)\)'

    # Find all matches in the input string
    matches = re.findall(pattern, group_concat_string)

    print(f"Debug: matches = {matches}")

    # Process each match
    for match in matches:
        institution, degree_title, start_date, end_date = match
        # Append each parsed entry as a dictionary
        parsed_education.append({
            'institution_name': institution.strip(),
            'degree_title': degree_title.strip(),
            'start_date': start_date.strip(),
            'end_date': end_date.strip()
        })

    return parsed_education

def parse_job_experience(job_experience_str):
    positions = []
    employers = []
    start_dates = []
    end_dates = []

    # Split job experiences by comma
    job_entries = job_experience_str.strip().split(',')

    for entry in job_entries:
        entry = entry.strip()
        if not entry:
            continue  # Skip empty entries

        # Split position and employer, then dates
        parts = entry.split(':')
        if len(parts) != 2:
            continue  # Skip malformed entries

        position_employer = parts[0].strip().split('|')
        if len(position_employer) != 2:
            continue  # Skip malformed entries

        position = position_employer[0].strip()
        employer = position_employer[1].strip()
        dates = parts[1].strip().split('/')
        start_date = dates[0].strip()
        end_date = dates[1].strip() if len(dates) > 1 else 'Present'

        # Clean dates
        start_date = re.sub(r'[^0-9/-]', '', start_date) or 'Not Specified'
        end_date = re.sub(r'[^0-9/-]', '', end_date) or 'Present'

        # Append values to lists
        positions.append(position)
        employers.append(employer)
        start_dates.append(start_date)
        end_dates.append(end_date)

    # Create DataFrame for job experience
    return pd.DataFrame({
        'Position': positions,
        'Employer': employers,
        'Start Date': start_dates,
        'End Date': end_dates
    })

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


    if not extracted_data:
        print("No valid data extracted to insert.")
        return

    cursor = db_conn.cursor()

    # Insert Applicant details with error checking
    try:
        applicant_details = extracted_data.get('Applicant Details', {})
        if isinstance(applicant_details, dict):
            applicant_query = """
            INSERT INTO applicant (applicant_id, applicant_name, applicant_gender, applicant_dateofbirth, applicant_nationality, applicant_address, applicant_city, applicant_contact, applicant_email, applicant_dateofapplication, applicant_resumelink, visibility)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1)
            """
            cursor.execute(applicant_query, (
                applicant_id,
                applicant_details.get('Full name'),
                applicant_details.get('Gender', ''),
                applicant_details.get('Date of birth', '00-00-0000'),
                applicant_details.get('Nationality', 'Indonesia'),
                applicant_details.get('Address'),
                applicant_details.get('City'),
                applicant_details.get('Contact number'),
                applicant_details.get('Email'),
                date_applied,
                raw_resumelink,
            ))
            print(f"Applicant details inserted for ID {applicant_id}.")
        else:
            print("Applicant details data type mismatch.")
    except Exception as e:
        print(f"Failed to insert applicant details for ID {applicant_id}: {e}")

    # Insert Education with error checking
    education_data = extracted_data.get('Education', [])
    if isinstance(education_data, list):
        for edu in education_data:
            try:
                if isinstance(edu, dict):
                    education_query = """
                    INSERT INTO education (applicant_id, institution_name, degree_title, start_date, end_date)
                    VALUES (%s, %s, %s, %s, %s)
                    """
                    # Get the start and end dates directly from the dictionary
                    start_date = edu.get('Education Start date', '')
                    end_date = edu.get('Education End date', '')

                    cursor.execute(education_query, (
                        applicant_id,
                        edu.get('Institution name'),
                        edu.get('Degree title'),
                        start_date,
                        end_date
                    ))
                    print(f"Education at {edu.get('Institution name')} inserted.")
                else:
                    print("Unexpected education entry format.")
            except Exception as e:
                print(f"Failed to insert education data: {e}")
    else:
        print("Education data type mismatch.")

    skills_data = extracted_data
    if isinstance(skills_data, dict):
        try:
            # Directly extract skills as strings from the JSON
            programming_skill = skills_data.get('Programming Skills')
            productknowledge_skill = skills_data.get(
                'Product Knowledge Skills')
            technologyknowledge_skill = skills_data.get(
                'Technology Skills')  # Adjust if needed
            knownlanguage_skill = skills_data.get(
                'Language Skills', 'Bahasa Indonesia')  # Default value
            operatingsystem_skill = skills_data.get('Operating System Skills')
            projectmethodology_skill = skills_data.get(
                'Project Methodology Skills')
            other_skill = skills_data.get('Other Relevant Skills')

            # Debug: Print values to be inserted
            print("Inserting skills data:")
            print(f"Applicant ID: {applicant_id}")
            print(f"Programming Skill: {programming_skill}")
            print(f"Product Knowledge Skill: {productknowledge_skill}")
            print(f"Technology Knowledge Skill: {technologyknowledge_skill}")
            print(f"Operating System Skill: {operatingsystem_skill}")
            print(f"Project Methodology Skill: {projectmethodology_skill}")
            print(f"Other Skill: {other_skill}")
            print(f"Known Language Skill: {knownlanguage_skill}")

            skill_query = """
            INSERT INTO skills (applicant_id, programming_skill, productknowledge_skill, technologyknowledge_skill, operatingsystem_skill, projectmethodology_skill, other_skill, knownlanguage_skill)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """

            # Execute the insertion
            cursor.execute(skill_query, (
                applicant_id,
                programming_skill,
                productknowledge_skill,
                technologyknowledge_skill,
                operatingsystem_skill,
                projectmethodology_skill,
                other_skill,
                knownlanguage_skill
            ))
            print(f"Skills inserted for applicant ID {applicant_id}.")
        except Exception as e:
            print(f"Failed to insert skills for applicant ID {applicant_id}: {e}")
    else:
        print("Skills data type mismatch.")

    # Insert Job Experience with duplication into Customer Experience
    job_experiences = extracted_data.get('Work Experience', [])
    if isinstance(job_experiences, list):
        for job_exp in job_experiences:
            try:
                if isinstance(job_exp, dict):
                    job_query = """
                    INSERT INTO jobexperience (applicant_id, company_name, position, start_date, end_date)
                    VALUES (%s, %s, %s, %s, %s)
                    """

                    # Extracting start and end dates directly from JSON
                    start_date = job_exp.get('Work Start date', None)
                    end_date = job_exp.get('Work end dates', None)

                    cursor.execute(job_query, (
                        applicant_id,
                        job_exp.get('Company name', None),
                        job_exp.get('Position', None),
                        start_date,
                        end_date
                    ))
                    print(f"Job experience at {job_exp.get('Company name', 'Unknown Company')} inserted.")

                    # Insert into Customer Experience with default values for missing columns
                    customer_exp_query = """
                    INSERT INTO customerexperience (applicant_id, company_name, position, start_date, end_date, project_description, project_name)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(customer_exp_query, (
                        applicant_id,
                        job_exp.get('Company name', None),
                        job_exp.get('Position', None),
                        start_date,
                        end_date,
                        'Default Project',  # Default project description
                        'Default Project'  # Default project name
                    ))
                    print(f"Customer experience (from job experience) at {job_exp.get('Company name', 'Unknown Company')} inserted.")
                else:
                    print("Unexpected job experience entry format.")
            except Exception as e:
                print(f"Failed to insert job experience at {job_exp.get('Company name', 'Unknown Company')}: {e}")
    else:
        print("Job Experience data type mismatch.")

     # Insert Certifications
    certifications = extracted_data.get('Certifications', [])
    if isinstance(certifications, list):
        for cert in certifications:
            try:
                if isinstance(cert, dict):
                    certification_query = """
                    INSERT INTO certification (applicant_id, certification_name, issued_by, issue_date, expiry_date)
                    VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.execute(certification_query, (
                        applicant_id,
                        cert.get('Certification name', None),
                        cert.get('Issued by', None),
                        cert.get('Issue date', None),
                        cert.get('Expiry date', None)
                    ))
                    print(f"Certification '{cert.get('Certification name', 'Unknown Certification')}' inserted.")
                else:
                    print("Unexpected certification entry format.")
            except Exception as e:
                print(f"Failed to insert certification '{cert.get('Certification name', 'Unknown Certification')}': {e}")
    else:
        print("Certifications data type mismatch.")
    # Commit all changes to the database
    db_conn.commit()
    print(f"All data for applicant {applicant_id} committed successfully.")
