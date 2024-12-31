from flask import Blueprint, jsonify, request
import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.utilities import SQLDatabase

bot_blueprint = Blueprint('bot', __name__)

os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
db = SQLDatabase.from_uri(os.getenv("DB_URI"))

# Initialize the LLM with the Google Generative AI model
llm = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)

toolkit = SQLDatabaseToolkit(db=db, llm=llm)

# Setup the memory to retain context of the last 2 exchanges
memory = ConversationBufferWindowMemory(k=2)

agent_executor = create_sql_agent(
    llm,
    toolkit,
    verbose=True,
    handle_parsing_errors=True
)


@bot_blueprint.route('/api', methods=['POST'])
def handle_data():
    try:
        data = request.get_json()

        print(data)

        custom_prompt = ("You are an analytical chatbot tasked with thoroughly searching the CSV spreadsheet to find and return every single value "
                         "that matches the user's query. Ensure that you do not miss any matching data.\n\n"
                         "For each match, return all the values from the corresponding row, with each column's name followed by its value, formatted for clarity. "
                         "Present the information in the following structure:\n\n"
                         "Applicant Name:\n"
                         "value1\n\n"
                         "Applicant Skills:\n"
                         "value2\n\n"
                         "Applicant Resume:\n"
                         "value3\n\n"
                         "Continue this format for every column in the row. Repeat this process for every row that matches the user's query. "
                         "If there are multiple matches, include them all, ensuring no relevant data is omitted. "
                         "Provide the information in a clear and organized manner to help the user easily understand the results."
                         "Please use sql_db_query and sql_db_query_checker"
                         "don't use escape characters")

        user_prompt = custom_prompt + json.dumps(data)

        # Retry logic
        retries = 3
        output = None
        for _ in range(retries):
            try:
                response = agent_executor.invoke(user_prompt)

                # Extract only the output (assuming response is structured as a dict with an 'output' key)
                output = response.get('output', '') if isinstance(
                    response, dict) else response

                if output and "I do not have any information regarding your query" not in output:
                    break  # If we get a valid output, break out of the retry loop

            except Exception as inner_e:
                print(f"Retrying due to parsing error: {inner_e}")

        # If still no valid output, set a fallback message
        if not output:
            output = "I do not have the information for this currently"

    except Exception as e:
        print(f"An error occurred: {e}")
        output = "I do not have the information for this currently"

    output_str = str(output)

    return jsonify({'message': 'Data received successfully!', 'bot_response': output_str})
