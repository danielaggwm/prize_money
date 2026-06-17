import requests
import json
from bs4 import BeautifulSoup

URL = "https://live-tennis.eu/en/official-atp-doubles-ranking"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def fetch_atp_doubles_rankings():
    response = requests.get(URL, headers=HEADERS)
    response.encoding = "utf-8"

    if response.status_code != 200:
        print(f"Failed to fetch rankings: {response.status_code}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    table = soup.find(id="u868")

    if not table:
        print("Rankings table not found")
        return []

    players = []
    for row in table.find_all("tr")[4:]:
        cells = [td.text.strip() for td in row.find_all(["td", "th"])]
        if len(cells) < 6 or not cells[0].isdigit():
            continue
        try:
            players.append({
                "rank": int(cells[0]),
                "player": cells[2],
                "age": int(cells[3]),
                "country": cells[4],
                "points": int(cells[5].replace(",", ""))
            })
        except Exception as e:
            print(f"Error parsing row {cells}: {e}")

    return players

rankings = fetch_atp_doubles_rankings()

with open("atp_doubles_rankings.json", "w") as json_file:
    json.dump(rankings, json_file, indent=4)

print(f"ATP doubles rankings saved to atp_doubles_rankings.json ({len(rankings)} players)")
