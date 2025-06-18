import requests
import json
import time
from datetime import datetime

# Base URL for WTA rankings API (same as singles)
BASE_URL = "https://api.wtatennis.com/tennis/players/ranked"
HEADERS = {"User-Agent": "Mozilla/5.0"}

def calculate_age(birthdate_str):
    birthdate = datetime.strptime(birthdate_str, "%Y-%m-%d")
    today = datetime.today()
    age = today.year - birthdate.year
    if (today.month, today.day) < (birthdate.month, birthdate.day):
        age -= 1
    return age

def fetch_doubles_rankings():
    players = []
    for page in range(10):  # Adjust number of pages as needed
        try:
            params = {
                "page": page,
                "pageSize": 100,
                "type": "rankDoubles",  # Changed for doubles
                "sort": "asc",
                "name": "",
                "metric": "DOUBLES",  # Changed for doubles
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
                continue
        except Exception:
            continue
        
        time.sleep(3)  # Be nice to the server

    return players

# Save doubles rankings to a separate file
doubles_rankings = fetch_doubles_rankings()
with open("wta_doubles_rankings.json", "w") as f:
    json.dump(doubles_rankings, f, indent=4)
