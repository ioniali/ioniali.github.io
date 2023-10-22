import requests
from PIL import Image

def get_live_version():
    response = requests.get('https://ddragon.leagueoflegends.com/api/versions.json')
    return response.json()[0]

def get_champion_dict(version):
    response = requests.get(f'http://ddragon.leagueoflegends.com/cdn/{version}/data/en_US/champion.json')
    return response.json()['data']

def download_image(version, name, path):
    response = requests.get(f'https://ddragon.leagueoflegends.com/cdn/{version}/img/champion/{name}.png')
    with open(path, 'wb') as file:
        file.write(response.content)

def process_image(path):
    image = Image.open(path)
    width, height = image.size
    crop_by = 9
    crop_box = (
        crop_by,
        crop_by,
        width - crop_by,
        height - crop_by
    )
    cropped_image = image.crop(crop_box)
    cropped_image.save(path)

live_version = get_live_version()
champion_dict = get_champion_dict(version=live_version)

for key in champion_dict.keys():
    path = f'image/champion/{key.lower()}.png'
    download_image(version=live_version, name=key, path=path)
    process_image(path=path)