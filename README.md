<<<<<<< HEAD
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

This is MoonlayHR web application, its main functionality include the creation and processing of cv and chatbot.

---------------------

# Requirements

- Python Version: 3.12.5
- Environment Variable: OPEN_AI_KEY, DB_URI, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, FLASK_HOST, FLASK_PORT, FLASK_DEBUG, VITE_KEYCLOAK_URL, VITE_KEYCLOAK_CLIENT_ID, VITE_KEYCLOAK_REDIRECT_URI, VITE_API_BASE
- Required Libraries: Refer to requirements.txt and yarn.lock

---------------------

# Installation

1. Clone the Repository using git clone command.

## Frontend

1. Navigate into the frontend folder

2. run command yarn install or yarn i

## Backend

1. Navigate into the server folder.

2. (Optional) Create a virtual environment in the project folder using python -m venv venv, activate virtual environment using ".\venv\Scripts\activate" for windows and "source venv/bin/activate" for mac.

3. Download all required libraries and modules through the requirements.txt file. 
   - Run the command "pip install -r requirements.txt".

## Docker

1. Navigate into the moonlay-quotation folder in docker using the docker CLI, there should be a docker-compose.yml file.

2. run the command docker compose build to build the containers.

3. run the command docker compose up to run the containers.

---------------------

# Setup

1. Configure the .env file
   - The env file should be named .env and be placed in original moonlay-hr folder alongside the gitignore and docker-compose.yml.
   - the env file should contain the environment value for:

    ## Backend Environment Variables

        OPENAI_API_KEY
        Chatbot Api Key

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

        VITE_API_BASE
        localhost url for backend.

---------------------

# Usage

1. Run the Program
   - navigate to the server folder, Run the command "flask run" to run the flask backend of the application.
   - navigate to the mantine-template-main folder and run the command "yarn start dev" to run the moonlayHR frontend.

---------------------
=======
# Mantis Free React Material UI Dashboard Template [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?text=Download%20Mantis%20React%20-%20The%20professional%20Material%20designed%20React%20Admin%20Dashboard%20Template%20&url=https://mantisdashboard.io&via=codedthemes&hashtags=reactjs,webdev,developers,javascript)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Price](https://img.shields.io/badge/price-FREE-0098f7.svg)](https://github.com/codedthemes/mantis-free-react-admin-template/blob/main/LICENSE)
[![GitHub package version](https://img.shields.io/github/package-json/v/codedthemes/mantis-free-react-admin-template)](https://github.com/codedthemes/mantis-free-react-admin-template/)

Mantis is a free and open source React dashboard template made using the Material UI React component library with aim of flexibility and better customizability.

### Name Derived From Nature

Mantis Logo is inspired from the insect name - 'Mantises' as they have triangular heads with flexible Necks. Also, the name is derived from two popular UI frameworks, Material UI and Ant Design (M-Ant-is).

Mantis has Ant Design principal on top of the MAterial UI React component library.

:star: :star: :star: Support us by giving star (Top right of this page) if you like the theme :star: :star: :star:

![mantis-free-react-dashboard-template.jpg](https://mantisdashboard.io/adv-banner-images/og-social-v1.1.0.png)

The [Pro version](https://mantisdashboard.io) of Mantis react template includes features such as TypeScript, apps, authentication methods (i.e. JWT, Auth0, Firebase), advance components, form plugins, layouts, widgets, and more.

| [Mantis Free](https://mantisdashboard.io/free) | [Mantis Pro](https://mantisdashboard.io)                                         |
| ---------------------------------------------- | :------------------------------------------------------------------------------- |
| **7** Demo pages                               | **85+** Demo pages                                                               |
| -                                              | ✓ Multi-language                                                                 |
| -                                              | ✓ Dark/Light Mode 🌓                                                             |
| -                                              | ✓ TypeScript version                                                             |
| -                                              | ✓ Design files (Figma)                                                           |
| -                                              | ✓ Multiple color options                                                         |
| -                                              | ✓ RTL                                                                            |
| -                                              | ✓ JWT, Firebase, Auth0, AWS authentication                                       |
| -                                              | ✓ [More components](https://mantisdashboard.io/components-overview/autocomplete) |
| ✓ MIT License                                  | ✓ [Pro License](https://mui.com/store/license/)                                  |

## Why Mantis?

Mantis offers everything needed to build an advanced dashboard application. In the initial release, we included following high-end features,

- Support React18.
- Professional user interface.
- Material UI React components.
- Fully responsive, all modern browser supported.
- Easy to use code structure
- Flexible & high-Performance code
- Simple documentation

## Free Mantis React version

#### Preview

- [Demo](https://mantisdashboard.io/free)

#### Download

- [Download from GitHub](https://github.com/codedthemes/mantis-free-react-admin-template)

## Mantis Pro version

#### Preview

- [Demo](https://mantisdashboard.io)

#### Purchase

- [Buy now](https://mui.com/store/items/mantis-react-admin-dashboard-template/)

## Table of contents

- [Getting started](#getting-started)
- [Documentation](#documentation)
- [Technology stack](#technology-stack)
- [Author](#author)
- [Issues?](#issues)
- [License](#license)
- [More Free React Templates](#more-free-react-material-admin-dashboard-templates)
- [More Pro React Templates](#more-premium-react-material-admin-dashboard-templates)
- [Follow us](#follow-us)

## Getting Started

1. Clone from Github

```
git clone https://github.com/codedthemes/mantis-free-react-admin-template.git
```

2. Install packages

```
yarn
```

3. Run project

```
yarn start
```

## Documentation

[Mantis documentation](https://codedthemes.gitbook.io/mantis/) helps you out in all aspects from Installation to deployment.

## Technology stack

- [Material UI V5](https://mui.com/core/)
- Built with React Hooks API.
- React context API for state management.
- SWR.
- React Router for navigation routing.
- Support for Vite.
- Code splitting.
- CSS-in-JS.

## Author

Mantis is managed by team [CodedThemes](https://codedthemes.com).

## Issues

Please generate a [GitHub issue](https://github.com/codedthemes/mantis-free-react-admin-template/issues) if you found a bug in any version. We are try our best to resolve the issue.

## License

- Licensed under [MIT](https://github.com/codedthemes/datta-able-bootstrap-dashboard/blob/master/LICENSE)

## More Free React Material Admin Dashboard Templates

- [Free Materially](https://codedthemes.com/item/materially-free-reactjs-admin-template/)
- [Free Berry](https://mui.com/store/items/berry-react-material-admin-free/)

## More premium React Material Admin Dashboard Templates

- [Materially](https://codedthemes.com/item/materially-reactjs-admin-dashboard/)
- [Berry](https://mui.com/store/items/berry-react-material-admin/)

## Follow us

- Website [https://mantisdashboard.io](https://mantisdashboard.io)
- Blog [https://blog.mantisdashboard.io](https://blog.mantisdashboard.io)
- CodedThemes [https://codedthemes.com](https://codedthemes.com)
- Dribbble [https://dribbble.com/codedthemes](https://dribbble.com/codedthemes)
- Facebook [https://www.facebook.com/codedthemes](https://www.facebook.com/codedthemes)
- Twitter [https://twitter.com/codedthemes](https://twitter.com/codedthemes)
>>>>>>> e3b5962 (chart)
