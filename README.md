# aqt-backend

## Overview
The **aqt-backend** project is the backend for the AQT application. It involves using both Node.js and Python environments, connects to a database via a `.env` file, and handles image uploads with a specific folder structure.

## Installation

```bash
# 1. Install Node.js dependencies
$ npm install

# 2. Set up Python virtual environment
$ python -m venv .venv

# Activate the virtual environment:
# On Windows:
$ .venv\Scripts\activate
# On macOS/Linux:
$ source .venv/bin/activate

# Install Python dependencies
$ pip install -r requirements.txt

# 3. Create .env file with database credentials in the root directory
$ echo "DB_HOST=your_database_host" > .env
$ echo "DB_USER=your_database_user" >> .env
$ echo "DB_PASS=your_database_password" >> .env

# 4. Ensure folder structure for image uploads
$ mkdir -p uploads/profile

# 5. Run the backend server with nodemon
$ nodemon server.js

