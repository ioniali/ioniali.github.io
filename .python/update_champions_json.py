import requests
import json

def get_live_version():
    response = requests.get('https://ddragon.leagueoflegends.com/api/versions.json')
    return response.json()[0]

def get_champion_dict(version):
    response = requests.get(f'http://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json')
    return response.json()['data']

def save_champions(champions):
    with open('static/champions.json', 'w', encoding='utf-8') as file:
        json.dump(champions, file)
    
live_version = get_live_version()
champion_dict = get_champion_dict(live_version)

result = []

for key in champion_dict.keys():
    if key == 'Fiddlesticks':
        result.append('FiddleSticks')
    else:
        result.append(key)

save_champions(sorted(result))