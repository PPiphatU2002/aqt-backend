#!/usr/bin/env python 
# coding: utf-8

import json
import pandas as pd
import threading
import csv
import mysql.connector
from dotenv import load_dotenv
import os
import multiprocessing
from datetime import datetime
import yfinance as yf  # Import yfinance
from seleniumwire import webdriver
from selenium.webdriver.chrome.options import Options
from seleniumwire.utils import decode
from screeninfo import get_monitors
import time

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
        
        # Start transaction
        cursor.execute("SELECT name FROM stocks")
        result = cursor.fetchall()
        symbols = [row[0] + '.BK' for row in result]  # Add '.BK' for Thai stocks
        return symbols
    except mysql.connector.Error as e:
        print(f"Error connecting to the database: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Function to retry fetching dividends if not found
def retry_fetch_dividends(symbol):
    try:
        stock = yf.Ticker(symbol)
        dividends = stock.dividends
        
        dividends.index = dividends.index.tz_localize(None)
        
        if not dividends.empty:
            latest_date = dividends.index.max()
            return dividends[dividends.index.year == latest_date.year]
        return pd.Series()  # Return empty series if there's no data
    except Exception as e:
        print(f"Error fetching dividends for {symbol}: {e}")
        return pd.Series()

# Main processing function
def process_symbols(symbols_subset, responses, lock, missing_symbols):
    global processed_symbols  

    for symbol in symbols_subset:
        try:
            stock = yf.Ticker(symbol)
            dividends = stock.dividends
            dividends.index = dividends.index.tz_localize(None)

            if not dividends.empty:
                latest_date = dividends.index.max()
                dividends = dividends[dividends.index.year == latest_date.year]

            if dividends.empty:
                print(f"No dividend data for {symbol}, possibly delisted. Retrying...")
                dividends = retry_fetch_dividends(symbol)

            if dividends.empty:
                print(f"Still no data for {symbol}, adding to missing symbols.")
                with lock:
                    missing_symbols.append(symbol)  
                continue  

            for date, dividend in dividends.items():  
                responses.append({
                    'symbol': symbol[:-3] if not symbol.startswith('$') else symbol,  
                    'dividend': dividend,
                    'xdate': date.strftime('%Y-%m-%d'),
                    'dividendType': 'Cash',
                    'ratio': 'N/A'
                })
        except Exception as e:
            print(f"Error processing symbol {symbol}: {e}")

        with lock:
            processed_symbols += 1
            progress = (processed_symbols / total_symbols) * 100
            print(f"Progress: {progress:.2f}%")

# Web scraping function for missing symbols
def web_scrape_missing_symbols(symbols_subset, responses, lock):
    chrome_options = Options()
    chrome_options.add_argument('--headless')  
    chrome_options.add_argument('--disable-gpu')  
    chrome_options.add_argument('--no-sandbox')  
    chrome_options.add_argument('--disable-dev-shm-usage')  
    chrome_options.add_argument('--window-size=400,300')

    screen = get_monitors()[0]
    screen_width, screen_height = screen.width, screen.height
    window_width, window_height = 400, 300

    x_position = max(0, (screen_width // 1) - (window_width // 1))
    y_position = max(0, (screen_height // 1) - (window_height // 1))
    chrome_options.add_argument(f'--window-position={x_position},{y_position}')

    seleniumwire_options = {'verify_ssl': True}

    local_driver = webdriver.Chrome(options=chrome_options, seleniumwire_options=seleniumwire_options)

    for symbol in symbols_subset:
        try:
            local_driver.get(f'https://www.set.or.th/en/market/product/stock/quote/{symbol}/rights-benefits')
            time.sleep(2)
            for request in local_driver.requests:
                if request.response and f"/api/set/stock/{symbol}/corporate-action?lang=en" in request.url:
                    data = decode(request.response.body, request.response.headers.get('Content-Encoding', 'identity'))
                    resp = json.loads(data.decode('utf-8'))
                    if 'XD' in resp.get('type', ''):
                        responses.append({
                            'symbol': symbol,
                            'dividend': resp.get('dividend', 'N/A'),
                            'xdate': resp.get('xdate', 'N/A'),
                            'dividendType': resp.get('dividendType', 'N/A'),
                            'ratio': resp.get('ratio', 'N/A')
                        })
                    break
        except Exception as e:
            print(f"Error scraping symbol {symbol}: {e}")

        with lock:
            processed_symbols += 1
            progress = (processed_symbols / total_symbols) * 100
            print(f"Progress: {progress:.2f}%")

    local_driver.quit()

# Get symbols from the database
symbols = fetch_symbols_from_db()

total_symbols = len(symbols)
processed_symbols = 0  
missing_symbols = []

lock = threading.Lock()

resps = []

# Split symbols into chunks for threading
def split_symbols(symbols, n):
    for i in range(0, len(symbols), n):
        yield symbols[i:i + n]

num_threads = min(multiprocessing.cpu_count(), 4)
symbols_chunks = list(split_symbols(symbols, len(symbols) // num_threads))

threads = []
for i in range(num_threads):
    thread = threading.Thread(target=process_symbols, args=(symbols_chunks[i], resps, lock, missing_symbols))
    threads.append(thread)
    thread.start()

for thread in threads:
    thread.join()

# Scrape missing symbols if any
if missing_symbols:
    print(f"Starting web scraping for missing symbols: {missing_symbols}")

    threads = []
    symbols_chunks = list(split_symbols(missing_symbols, len(missing_symbols) // num_threads))
    
    for i in range(num_threads):
        thread = threading.Thread(target=web_scrape_missing_symbols, args=(symbols_chunks[i], resps, lock))
        threads.append(thread)
        thread.start()

    for thread in threads:
        thread.join()

# Define the base folder
base_folder = os.path.dirname(os.path.abspath(__file__))
dividend_folder = os.path.join(base_folder, 'dividend_yield')
os.makedirs(dividend_folder, exist_ok=True)

# Save to dividend.txt
file_path = os.path.join(dividend_folder, 'dividend.txt')
with open(file_path, "w", encoding="utf-8") as file:
    for item in resps:
        file.write(f"{item}\n")

# Save responses to CSV
csv_file_name = os.path.join(dividend_folder, 'dividend_yield_data.csv')
with open(csv_file_name, mode='w', newline='', encoding='utf-8') as file:
    fieldnames = ['symbol', 'dividend', 'ratio', 'xdate', 'dividendType']
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(resps)

print(f'Data written to {csv_file_name}')

# Read the CSV file and process data
df = pd.read_csv(csv_file_name)
df['year'] = pd.to_datetime(df['xdate']).dt.year
grouped_df = df.groupby(['symbol', 'year'], as_index=False).agg({'dividend': 'sum'})
grouped_df['dividend'] = grouped_df['dividend'].round(2)
grouped_df['remark'] = grouped_df['year'].apply(lambda y: f"ข้อมูลผลตอบแทนเงินปันผลประจำปี {y}")

summed_dividend_yield_file = os.path.join(base_folder, 'summed_dividend_yield.csv')
grouped_df.to_csv(summed_dividend_yield_file, index=False)

print(f'Process completed successfully. Data saved at {summed_dividend_yield_file}')

# Check for missing symbols
if missing_symbols:
    print(f"Missing symbols: {', '.join(missing_symbols)}")
    
    # Save missing symbols to CSV
    missing_symbols_file = os.path.join(dividend_folder, 'missing_symbols.csv')
    with open(missing_symbols_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(['Missing Symbols'])  # Header
        for symbol in missing_symbols:
            writer.writerow([symbol])  # Write each missing symbol
            
    print(f'Missing symbols saved to {missing_symbols_file}')
else:
    print("All expected symbols have data.")

# Create new folder structure for the result
result_folder = os.path.join(base_folder, 'result', 'dividend_yield')
os.makedirs(result_folder, exist_ok=True)

# Generate timestamp for file name
current_time = datetime.now()
timestamp = current_time.strftime("date-%Y-%m-%d-time-%H-%M")

# Create new file name with the timestamp
new_summed_dividend_yield_file = os.path.join(result_folder, f'{timestamp}.csv')

# Save the grouped dividend data to the new CSV file
grouped_df.to_csv(new_summed_dividend_yield_file, index=False)

print(f'New summarized dividend data saved at {new_summed_dividend_yield_file}')

# Print total expected and retrieved symbols
expected_symbols = fetch_symbols_from_db()
retrieved_symbols = set(df['symbol'].unique())
print(f"Total expected symbols: {len(expected_symbols)}")
print(f"Total retrieved symbols: {len(retrieved_symbols)}")
