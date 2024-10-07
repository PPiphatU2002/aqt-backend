#!/usr/bin/env python 
# coding: utf-8

import json
import pandas as pd
import threading
import re
import csv
import mysql.connector
from dotenv import load_dotenv
import os
from datetime import datetime
from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from seleniumwire.utils import decode

# Function to process a subset of symbols
def process_symbols(symbols_subset, responses):
    chrome_options = Options()
    chrome_options.add_argument('--headless=new')  # Headless mode
    chrome_options.add_argument('--disable-gpu')  # Disable GPU
    chrome_options.add_argument('--no-sandbox')  # Bypass OS security model
    chrome_options.add_argument('--disable-dev-shm-usage')  # Overcome limited resource problems
    chrome_options.add_argument('--window-size=1920,1080')  # Set window size

    # Create a new instance of the Chrome driver
    local_driver = webdriver.Chrome(options=chrome_options)

    for symbol in symbols_subset:
        try:
            local_driver.get(f'https://www.set.or.th/en/market/product/stock/quote/{symbol}/rights-benefits')
            for request in local_driver.requests:
                if request.response and f"/api/set/stock/{symbol}/corporate-action?lang=en" in request.url:
                    data = decode(request.response.body, request.response.headers.get('Content-Encoding', 'identity'))
                    resp = json.loads(data.decode('utf-8'))
                    responses.append(resp)
                    break
        except Exception as e:
            print(f"Error processing symbol {symbol}: {e}")
    local_driver.quit()

# Load .env file
load_dotenv()

# Database connection parameters from .env
DB_HOST = os.getenv('DB_HOST')
DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')
DB_NAME = os.getenv('DB_NAME')

# Fetch symbols from the database using mysql.connector
def fetch_symbols_from_db():
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cursor = connection.cursor()
        cursor.execute("SELECT name FROM stocks")
        result = cursor.fetchall()
        symbols = [row[0] for row in result]
        return symbols
    except mysql.connector.Error as e:
        print(f"Error connecting to the database: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Get symbols from the database
symbols = fetch_symbols_from_db()

# Split symbols into chunks for threading
def split_symbols(symbols, n):
    """Yield successive n-sized chunks from symbols."""
    for i in range(0, len(symbols), n):
        yield symbols[i:i + n]

# Number of browsers/threads you want to run simultaneously
num_threads = 1
symbols_chunks = list(split_symbols(symbols, len(symbols) // num_threads))

# Shared list to store responses from all threads
resps = []

# Create and start threads
threads = []
for i in range(num_threads):
    thread = threading.Thread(target=process_symbols, args=(symbols_chunks[i], resps))
    threads.append(thread)
    thread.start()

# Wait for all threads to complete
for thread in threads:
    thread.join()

# Print the collected responses
print(resps)

# Define the path and create directory if it doesn't exist
base_dir = os.path.dirname(os.path.abspath(__file__))  
save_dir = base_dir  # Keep save_dir as the base directory
csv_dir = os.path.join(base_dir, 'dividend_yield')
os.makedirs(csv_dir, exist_ok=True)

file_path = os.path.join(csv_dir, 'dividend.txt')

# Open the file in write mode with UTF-8 encoding
with open(file_path, "w", encoding="utf-8") as file:
    for item in resps:
        file.write(f"{item}\n")

print('File created successfully.')

# Check if the file exists before reading it
if os.path.isfile(file_path):
    try:
        # Open the file and read its content
        with open(file_path, 'r', encoding='utf-8') as file:
            file_content = file.read()

        print("File content read successfully.")

        # Regular expression to match JSON-like objects with 'type': 'XD'
        pattern = re.compile(r"\{[^{}]*'type':\s*'XD'[^{}]*\}")

        # Find all matches
        matches = pattern.findall(file_content)

        dividends_info = []

        # Regular expressions to extract fields
        symbol_pattern = re.compile(r"'symbol':\s*'([^']*)'")
        dividend_pattern = re.compile(r"'dividend':\s*([\d.]+)")
        xdate_pattern = re.compile(r"'xdate':\s*'([^']*)'")
        dividend_type_pattern = re.compile(r"'dividendType':\s*'([^']*)'")
        ratio_pattern = re.compile(r"'ratio':\s*'(\d+\s*:\s*\d+|None)'")

        for match in matches:
            symbol_match = symbol_pattern.search(match)
            symbol = symbol_match.group(1) if symbol_match else 'N/A'

            dividend_match = dividend_pattern.search(match)
            dividend = dividend_match.group(1) if dividend_match else 'N/A'

            xdate_match = xdate_pattern.search(match)
            xdate = xdate_match.group(1) if xdate_match else 'N/A'

            # Reformat xdate to year-month-date
            if xdate != 'N/A':
                try:
                    xdate = datetime.fromisoformat(xdate).strftime('%Y-%m-%d')
                except ValueError:
                    xdate = 'N/A'

            dividend_type_match = dividend_type_pattern.search(match)
            dividend_type = dividend_type_match.group(1) if dividend_type_match else 'N/A'

            ratio_match = ratio_pattern.search(match)
            ratio = ratio_match.group(1) if ratio_match and ratio_match.group(1) != 'None' else 'N/A'

            dividends_info.append({
                'symbol': symbol,
                'dividend': dividend,
                'ratio': ratio,
                'xdate': xdate,
                'dividendType': dividend_type
            })

        # Specify the CSV file name
        csv_file_name = os.path.join(csv_dir, 'dividend_yield_data.csv')

        # Open a new CSV file in write mode
        with open(csv_file_name, mode='w', newline='', encoding='utf-8') as file:
            # Create a DictWriter object with the fieldnames taken from the keys of the first dictionary
            fieldnames = ['symbol', 'dividend', 'ratio', 'xdate', 'dividendType']
            writer = csv.DictWriter(file, fieldnames=fieldnames)

            # Write the header row
            writer.writeheader()

            # Write data rows
            for dividend_info in dividends_info:
                writer.writerow(dividend_info)

        print(f'Data written to {csv_file_name}')

    except FileNotFoundError:
        print("The specified file path does not exist. Please check the path and try again.")
    except re.error as e:
        print(f"Regex error: {e}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Read the CSV file and process data
df = pd.read_csv(csv_file_name)

# Extract the year from the date column
df['year'] = pd.to_datetime(df['xdate']).dt.year

# Group by the symbol and year, then sum the dividends
grouped_df = df.groupby(['symbol', 'year'], as_index=False).agg({'dividend': 'sum'})

# Round the summed dividends to 2 decimal places
grouped_df['dividend'] = grouped_df['dividend'].round(2)

# Save the resulting DataFrame back to a CSV file
summed_dividend_yield_file = os.path.join(save_dir, 'summed_dividend_yield.csv')  # Save in the base directory
grouped_df.to_csv(summed_dividend_yield_file, index=False)

print(f'Process completed successfully. Data saved at {summed_dividend_yield_file}')
