from flask import Blueprint, jsonify, request
import os
from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain.memory import ConversationBufferWindowMemory
from langchain_community.utilities import SQLDatabase
from langchain.chat_models import ChatOpenAI

bot_blueprint = Blueprint('bot', __name__)

# Load API key & DB URI dari environment
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")
db = SQLDatabase.from_uri(os.getenv("HR_DB_URI"))

# Setup LLM
llm = ChatOpenAI(model="gpt-4", temperature=0.3)

# Setup SQL Toolkit & Agent
toolkit = SQLDatabaseToolkit(db=db, llm=llm)
memory = ConversationBufferWindowMemory(k=2)

agent_executor = create_sql_agent(
    llm=llm,
    toolkit=toolkit,
    verbose=True,
    handle_parsing_errors=True,
    memory=memory
)

@bot_blueprint.route('/api', methods=['POST'])
def handle_data():
    try:
        data = request.get_json()
        user_query = data.get("query", "").strip()

        if not user_query:
            return jsonify({"bot_response": "Pertanyaan tidak boleh kosong."}), 400

        # Prompt dasar + pertanyaan user
        custom_prompt = (
            "You are an analytical chatbot tasked with thoroughly searching the HR applicant database "
            "to find and return every matching result for the user's query.\n\n"
            "Format setiap hasil dengan struktur berikut:\n\n"
            "Applicant Name:\n"
            "<name>\n\n"
            "Applicant Skills:\n"
            "<skills>\n\n"
            "Applicant Resume:\n"
            "<resume>\n\n"
            "Dan seterusnya untuk setiap kolom.\n\n"
            "User Question:\n"
            f"{user_query}\n\n"
            "Gunakan sql_db_query dan sql_db_query_checker. Jangan gunakan escape characters."
        )

        # Retry logic
        retries = 3
        output = None

        for _ in range(retries):
            try:
                response = agent_executor.invoke(custom_prompt)
                output = response.get('output', '') if isinstance(response, dict) else response

                if output and "I do not have any information" not in output:
                    break
            except Exception as inner_e:
                print(f"Retrying due to parsing error: {inner_e}")

        if not output:
            output = "Maaf, saya tidak dapat menemukan informasi yang sesuai saat ini."

    except Exception as e:
        print(f"An error occurred: {e}")
        output = "Terjadi kesalahan saat memproses permintaan."

    return jsonify({'bot_response': str(output)})
