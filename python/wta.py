import requests
import json
import time
from datetime import datetime

# Base URL for WTA rankings API
BASE_URL = "https://api.wtatennis.com/tennis/players/ranked"
HEADERS = {"User-Agent": "Mozilla/5.0"}  # Some APIs require a user agent

def calculate_age(birthdate_str):
    birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")  # Convert string to date
    today = datetime.today()

    age = today.year - birthdate.year  # Initial age calculation
    if (today.month, today.day) < (birthdate.month, birthdate.day):
        age -= 1  # Adjust if birthday hasn't happened yet this year

    return age

def fetch_rankings():
    players = []
    for page in range(10):  # Looping through pages 0 to 9
        try:
            params = {
                "page": page,
                "pageSize": 100,
                "type": "rankSingles",
                "sort": "asc",
                "name": "",
                "metric": "SINGLES",
                "at": datetime.today().strftime('%Y-%m-%d'),
                "nationality": ""
            }
            response = requests.get(BASE_URL, params=params, headers=HEADERS)

            if response.status_code == 200:
                data = response.json()
                for item in data:
                    players.append({
                        "rank": item["ranking"],
                        "player": item["player"]["fullName"],
                        "age": calculate_age(item["player"]["dateOfBirth"]),
                        "country": item["player"]["countryCode"],
                        "points": item["points"]
                    })
            else:
                continue  # Skip failed pages

        except Exception:
            continue  # Handle connection issues silently
        
        time.sleep(3)  # 3-second delay between requests

    return players

# Fetch data and save as JSON
rankings = fetch_rankings()
json_filename = "wta_rankings.json"

with open(json_filename, "w") as json_file:
    json.dump(rankings, json_file, indent=4)

