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
from screeninfo import get_monitors
from multiprocessing import cpu_count
from tqdm import tqdm  # Import tqdm for progress tracking

# Function to get screen size
def get_screen_size():
    screen = get_monitors()[0]
    return screen.width, screen.height

# Function to process a subset of symbols for the current year only
def process_symbols(symbols_subset, responses, total_symbols):
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=400,300')

    # Get screen size to calculate position
    screen_width, screen_height = get_screen_size()
    window_width, window_height = 400, 300

    # Calculate position to center the window
    x_position = max(0, (screen_width // 1) - (window_width // 1))
    y_position = max(0, (screen_height // 1) - (window_height // 1))

    chrome_options.add_argument(f'--window-position={x_position},{y_position}')

    local_driver = webdriver.Chrome(options=chrome_options)
    current_year = datetime.now().year

    # Wrap the loop with tqdm for progress tracking
    for symbol in tqdm(symbols_subset, desc="Processing Symbols", total=len(symbols_subset)):
        try:
            local_driver.get(f'https://www.set.or.th/en/market/product/stock/quote/{symbol}/rights-benefits')
            for request in local_driver.requests:
                if request.response and f"/api/set/stock/{symbol}/corporate-action?lang=en" in request.url:
                    data = decode(request.response.body, request.response.headers.get('Content-Encoding', 'identity'))
                    resp = json.loads(data.decode('utf-8'))
                    # Filter responses to include only the current year
                    filtered_resp = [item for item in resp if datetime.fromisoformat(item['xdate']).year == current_year]
                    responses.extend(filtered_resp)
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

# Fetch symbols from the database
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
    for i in range(0, len(symbols), n):
        yield symbols[i:i + n]

# Set the number of threads to the number of CPU cores
num_threads = 1
symbols_chunks = list(split_symbols(symbols, len(symbols) // num_threads))

# Shared list to store responses from all threads
resps = []

# Create and start threads
threads = []
for i in range(num_threads):
    thread = threading.Thread(target=process_symbols, args=(symbols_chunks[i], resps, len(symbols_chunks[i])))
    threads.append(thread)
    thread.start()

# Wait for all threads to complete
for thread in threads:
    thread.join()

# Print the collected responses
print(resps)

# Define the base save directory and ensure it exists
base_dir = os.path.dirname(os.path.abspath(__file__))
save_dir = base_dir
csv_dir = os.path.join(base_dir, 'result', 'dividend_yield')
os.makedirs(csv_dir, exist_ok=True)

# Summed dividend yield file path
summed_dividend_yield_file = os.path.join(save_dir, 'summed_dividend_yield.csv')

# Dividend yield data file path
dividend_yield_data_file = os.path.join(save_dir, 'dividend_yield', 'dividend_yield_data.csv')

# Dividend text file path
dividend_txt_file = os.path.join(save_dir, 'dividend_yield', 'dividend.txt')

# Summed dividend yield file path
timestamped_file_name = datetime.now().strftime('%Y_%m_%d_%H_%M_dividend_yield_data.csv')
result_dividend_yield_data_file = os.path.join(save_dir, 'result', 'dividend_yield', timestamped_file_name)

# Process and save responses to CSV
dividends_info = []

# List to store scraped data for dividend.txt
scraped_data_list = []

for item in resps:
    symbol = item.get('symbol', 'N/A')
    dividend = item.get('dividend', 'N/A')
    xdate = item.get('xdate', 'N/A')
    dividend_type = item.get('dividendType', 'N/A')
    ratio = item.get('ratio', 'N/A')
    
    # Convert xdate to year-month-day format
    try:
        xdate = datetime.fromisoformat(xdate).strftime('%Y-%m-%d')
    except ValueError:
        xdate = 'N/A'

    dividends_info.append({
        'symbol': symbol,
        'dividend': dividend,
        'ratio': ratio,
        'xdate': xdate,
        'dividendType': dividend_type
    })
    
    # Add scraped data to the list for dividend.txt
    scraped_data_list.append(item)

# Write filtered data to the dividend_yield_data file
with open(dividend_yield_data_file, mode='w', newline='', encoding='utf-8') as file:
    fieldnames = ['symbol', 'dividend', 'ratio', 'xdate', 'dividendType']
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(dividends_info)

print(f'Data written to {dividend_yield_data_file}')

# Write scraped data to dividend.txt
with open(dividend_txt_file, mode='w', encoding='utf-8') as txt_file:
    for data in scraped_data_list:
        txt_file.write(f"{data}\n")

print(f'Data written to {dividend_txt_file}')

# Load data and group by symbol and year, then save to original file
df = pd.read_csv(dividend_yield_data_file)

# Extract the year from the date column
df['year'] = pd.to_datetime(df['xdate']).dt.year

# Group by the symbol and year, then sum the dividends
grouped_df = df.groupby(['symbol', 'year'], as_index=False).agg({'dividend': 'sum'})

# Round the summed dividends to 2 decimal places
grouped_df['dividend'] = grouped_df['dividend'].round(2)

# Write the grouped data to the summed_dividend_yield_file, overwriting it
grouped_df.to_csv(summed_dividend_yield_file, index=False, columns=['year', 'symbol', 'dividend'])

# Write the grouped data to the summed_dividend_yield_file, overwriting it
grouped_df.to_csv(result_dividend_yield_data_file, index=False, columns=['year', 'symbol', 'dividend'])

print(f'Data written to {summed_dividend_yield_file}')

# No need for a timestamped copy since it is already handled
print('Process completed successfully.')
