import requests
import json
import time
from bs4 import BeautifulSoup

# Base URL for ATP rankings
BASE_URL = "https://www.atptour.com/en/rankings/singles?rankRange={}-{}"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Extract country code from the flag URL
def extract_country(td_element):
    try:
        flag_svg = td_element.find("use")
        flag_url = flag_svg["href"]  # Example: "/assets/atptour/assets/flags.svg#flag-ita"
        return flag_url.split("#flag-")[-1].upper()  # Extract "ITA" from the flag path
    except:
        return "N/A"

# Scrape ATP rankings
def fetch_atp_rankings():
    players = []

    for start_rank in range(0, 1001, 100):  # Loop from 0-1000 in steps of 100
        url = BASE_URL.format(start_rank, start_rank + 99)
        response = requests.get(url, headers=HEADERS)

        if response.status_code != 200:
            print(f"Failed to fetch data for {start_rank}-{start_rank+99}")
            continue

        soup = BeautifulSoup(response.text, "html.parser")
        rows = soup.select("tbody tr")  # Select all player rows

        for row in rows:
            try:
                rank = row.select_one("td.rank").text.strip()
                name = row.select_one("li.name span").text.strip()
                age = row.select_one("td.age").text.strip()
                points = row.select_one("td.points a").text.strip().replace(",", "")  # Remove commas
                country = extract_country(row)  # Extract country from flag

                players.append({
                    "rank": int(rank),
                    "player": name,
                    "age": int(age),
                    "country": country,
                    "points": int(points)
                })

            except Exception as e:
                print(f"Error parsing row: {e}")
                continue  # Skip problematic rows

        time.sleep(3)  # Delay to avoid being blocked

    return players

# Fetch rankings and save to JSON
rankings = fetch_atp_rankings()

with open("atp_rankings.json", "w") as json_file:
    json.dump(rankings, json_file, indent=4)

print("ATP rankings saved to atp_rankings.json")
