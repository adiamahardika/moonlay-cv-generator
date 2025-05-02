# app/polling_module.py

import threading
import time
import mysql.connector
from .utils import get_db_connection
import json
from langchain_google_genai import ChatGoogleGenerativeAI as GoogleChat
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.utilities import SQLDatabase
from langchain.prompts import PromptTemplate

llm = GoogleChat(model="gemini-pro", temperature=0.3)

def poll_db_for_new_data():
    while True:
        db_conn = get_db_connection()
        cursor = db_conn.cursor(dictionary=True)

        extracted_data = {}

        try:
            cursor.execute(
                "SELECT * FROM rawdata WHERE new_data_flag = 1 LIMIT 1")
            new_data = cursor.fetchone()

            if new_data:
                applicant_id = new_data['applicant_id']
                rawdata = new_data['applicant_raw_data']
                resumelink = new_data['raw_resumelink']
                date_applied = new_data['created_at']

                extracted_data = extract_applicant_data(rawdata)

                print("Extracted Data:", extracted_data)

                parse_and_insert_data(
                    db_conn, applicant_id, extracted_data, resumelink, date_applied)

                cursor.execute(
                    "UPDATE rawdata SET new_data_flag = 0 WHERE applicant_id = %s", (applicant_id,))
                db_conn.commit()
                print(f"rawdata table updated for applicant {applicant_id}.")
            else:
                print("No new data found for extraction.")

        except Exception as e:
            print(f"Error polling database: {e}")
            print("Extracted Data at error point:", extracted_data)

        finally:
            cursor.close()
            db_conn.close()

        time.sleep(240)

def extract_applicant_data(rawdata):
    prompt_template = PromptTemplate(
        input_variables=["rawdata"],
        template="""Extract the following details in JSON format only.
        
        if no information is found regarding the field, fill the field with 'not specified'

        Applicant Details:
        - Full name
        - Gender
        - Date of birth
        - Nationality
        - Address
        - City
        - Contact number
        - Email
        - Date of application
        - Resume link

        Work Experience (SEPARATE THE START AND END DATE INTO DIFFERENT CATEGORIES):
        - Company name
        - Position
        - Work Start date
        - Work end dates

        Education (SEPARATE THE START AND END DATE INTO DIFFERENT CATEGORIES) (ONLY TAKE THE HIGHEST EDUCATION/DEGREE, DONT INCLUDE THEM ALL):
        - Institution name (ONLY TAKE HIGHEST EDUCATION/DEGREE)
        - Degree title (ONLY TAKE HIGHEST EDUCATION/DEGREE)
        - Education Start date (ONLY TAKE HIGHEST EDUCATION/DEGREE)
        - Education End date (ONLY TAKE HIGHEST EDUCATION/DEGREE)
         
        Programming Skills (Extract in one long string separated with commas):
        - Known Programming Languages.
        
        Product Knowledge Skills (Extract in one long string separated with commas):
        - Known Expertise regarding how to use a product (excel, word, and other like it)
        
        Language Skills (Extract in one long string separated with commas):
        - Languages that the individual can speak
        
        Operating System Skills (Extract in one long string separated with commas):
        - Operating Systems the individual can use.
        
        Project Methodology Skills (Extract in one long string separated with commas):
        - Different project methodologies the individual is used to.
        
        Other Relevant Skills (Extract in one long string separated with commas):
        - Other skills that don't fit the other categories.

        Certifications:
        - Certification name
        - Issued by
        - Issue date
        - Expiry date

        Return only JSON format without additional explanations.

        Text:
        {rawdata}
        """
    )

    # Generate the prompt using the rawdata
    prompt = prompt_template.format(rawdata=rawdata)

    try:
        # Run the LLM model and retrieve the response
        response = llm.invoke(prompt)

        # Verify the response type
        if hasattr(response, 'content'):
            response_text = response.content
        elif isinstance(response, str):
            response_text = response
        else:
            print("Unexpected response format. Extraction halted.")
            return {}

        # Clean up response text and parse JSON
        response_text = response_text.strip("```json\n").strip("```")
        extracted_data = json.loads(response_text)

    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        extracted_data = {}
    except Exception as e:
        print(f"Unexpected extraction error: {e}")
        extracted_data = {}

    print(f"Extracted data: {extracted_data}")  # Log the extracted data
    return extracted_data

def parse_and_insert_data(db_conn, applicant_id, extracted_data, raw_resumelink, date_applied):
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

def start_polling():
    poller = threading.Thread(target=poll_db_for_new_data)
    poller.daemon = True  # Ensures thread will close when main program exits
    poller.start()
