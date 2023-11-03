import requests
from PIL import Image

def get_live_version():
    response = requests.get('https://ddragon.leagueoflegends.com/api/versions.json')
    return response.json()[0]

def get_profileicon_images(version):
    response = requests.get(f'http://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/profileicon.json')
    return response.json()['data']

def download_image(version, name, path):
    response = requests.get(f'https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{name}.png')
    with open(path, 'wb') as file:
        file.write(response.content)

live_version = get_live_version()
profileicon_dict = get_profileicon_images(version=live_version)

for key in profileicon_dict.keys():
    path = f'image/profileicon/{key.lower()}.png'
    download_image(version=live_version, name=key, path=path)