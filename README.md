Important!

# Setup For MoonlayHR
---------------------

# Table of Contents

1. Overview
2. Requirements
3. Installation
4. Setup
5. Usage

---------------------

# Overview

This is MoonlayHR web application, its main functionality include the receiving and processing of resume data and a chatbot to ask about those results. the frontend is made using React+vite and the backend Python+Flask

---------------------

# Requirements

- Python Version: 3.12.5
- Environment Variable: GOOGLE_API_KEY, DB_URI, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, FLASK_HOST, FLASK_PORT, FLASK_DEBUG, VITE_KEYCLOAK_URL, VITE_KEYCLOAK_CLIENT_ID, VITE_KEYCLOAK_REDIRECT_URI
- Required Libraries: Refer to requirements.txt and yarn.lock

---------------------

# Installation

1. Clone the Repository using git clone command.

## Frontend

1. Navigate into the mantine-template-main folder

2. run command yarn install or yarn i

## Backend

1. Navigate into the server folder.

2. (Optional) Create a virtual environment in the project folder using python -m venv venv, activate virtual environment using ".\venv\Scripts\activate" for windows and "source venv/bin/activate" for mac.

3. Download all required libraries and modules through the requirements.txt file. 
   - Run the command "pip install -r requirements.txt".

## Docker

1. Navigate into the moonlay-hr folder in docker using the docker CLI, there should be a docker-compose.yml file.

2. run the command docker compose build to build the containers.

3. run the command docker compose up to run the containers.

---------------------

# Setup

1. Configure the .env file
   - The env file should be named .env and be placed in original moonlay-hr folder alongside the gitignore and docker-compose.yml.
   - the env file should contain the environment value for:

    ## Backend Environment Variables

        GOOGLE_API_KEY
        API key for accessing Google services like Maps or other APIs.

        DB_URI
        Full database connection string for connecting to a MySQL database using mysql+mysqlconnector.

        DB_HOST
        Hostname or IP address of the database server.

        DB_USER
        Username for database authentication.

        DB_PASSWORD
        Password for database authentication.

        DB_NAME
        Name of the specific database to connect to.

        DB_PORT
        Port number on which the database server is running (default for MySQL: 3306).

        FLASK_HOST
        Host address for running the Flask backend (e.g., 0.0.0.0 to allow access from any IP).

        FLASK_PORT
        Port number on which the Flask server will listen (default: 5000).

        FLASK_DEBUG
        Debug mode toggle (True for enabling debug mode, useful during development).

    ## Frontend Environment Variables

        VITE_KEYCLOAK_URL
        Base URL of the Keycloak authentication server.

        VITE_KEYCLOAK_REALM
        The Keycloak realm to authenticate users against.

        VITE_KEYCLOAK_CLIENT_ID
        Client ID used for identifying the frontend application in Keycloak.

        VITE_KEYCLOAK_REDIRECT_URI
        URL where Keycloak redirects users after successful login.

---------------------

# Usage

1. Run the Program
   - navigate to the server folder, Run the command "flask run" to run the flask backend of the application.
   - navigate to the mantine-template-main folder and run the command "yarn dev" to run the moonlayHR frontend.

---------------------
