# MoonlayHR

## Important!

### Table of Contents
1. Overview  
2. Requirements  
3. Installation  
4. Setup  
5. Usage  

---

## Overview

This is MoonlayHR web application. Its main functionality includes the creation and processing of CV and chatbot.

---

## Requirements

- **Python Version**: 3.12.5  
- **Environment Variables**:
  - `OPEN_AI_KEY`, `DB_URI`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
  - `FLASK_HOST`, `FLASK_PORT`, `FLASK_DEBUG`
  - `VITE_KEYCLOAK_URL`, `VITE_KEYCLOAK_CLIENT_ID`, `VITE_KEYCLOAK_REDIRECT_URI`, `VITE_API_BASE`
- **Libraries**: Refer to `requirements.txt` (backend) and `yarn.lock` (frontend)

---

## Installation

### Frontend

1. Navigate into the `frontend` folder  
2. Run: `yarn install`

### Backend

1. Navigate into the `server` folder  
2. (Optional) Create and activate virtual environment:
   - Windows: `python -m venv venv && .\venv\Scripts\activate`
   - Mac/Linux: `python3 -m venv venv && source venv/bin/activate`
3. Run: `pip install -r requirements.txt`

### Docker (Optional)

1. Navigate to `moonlay-quotation` (contains `docker-compose.yml`)  
2. Run:  
   - `docker compose build`  
   - `docker compose up`

---

## Setup

1. Create a `.env` file in the root of the project (same level as `.gitignore`)  
2. Fill it with the following keys:

### Backend

```env
OPENAI_API_KEY=...
DB_URI=...
DB_HOST=...
DB_USER=...
DB_PASSWORD=...
DB_NAME=...
DB_PORT=3306
FLASK_HOST=0.0.0.0
FLASK_PORT=5000
FLASK_DEBUG=True


VITE_KEYCLOAK_URL=...
VITE_KEYCLOAK_REALM=...
VITE_KEYCLOAK_CLIENT_ID=...
VITE_KEYCLOAK_REDIRECT_URI=...
VITE_API_BASE=...
