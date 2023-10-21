const summonerList = document.getElementById('summoner-list');
const summonerNameInput = document.getElementById('summonerName');
const regionSelect = document.getElementById('region-select');
const appendButton = document.getElementById('append-button');
const searchButton = document.getElementById('search-button');

const summonerArray = [];

function appendSummoner(platformId, summonerName){
    const divItem = document.createElement('div');
    divItem.className = 'grid';
    divItem.style.border = '1px solid rgb(187, 198, 206)';
    divItem.style.borderRadius = '0.25rem';

    const hItem = document.createElement('h4');
    hItem.textContent = `${platformId} ${summonerName}`;
    divItem.appendChild(hItem);
    
    const buttomItem = document.createElement('button');
    buttomItem.textContent = 'Remove';
    buttomItem.addEventListener('click', () => {
        summonerList.removeChild(divItem);
    });
    divItem.appendChild(buttomItem);

    summonerArray.push({platformId: platformId, summonerName: summonerName});

    summonerList.appendChild(divItem);
    summonerNameInput.value = '';
}

appendButton.addEventListener('click', function() {
    const summonerName = summonerNameInput.value.trim();
    if (summonerName !== ''){
        appendSummoner(regionSelect.value, summonerName);
    }
});

searchButton.addEventListener('click', function() {
    const summonerName = summonerNameInput.value.trim();
    if (summonerName === ''){
        if (summonerArray.length > 0){
            const params = [];
            for (const summoner of summonerArray){
                params.push(`${summoner.platformId}_${summoner.summonerName}`);
            }
            window.location.href  = 'result?summoners=' + params.join(',');
        }
    }
    else {
        appendSummoner(regionSelect.value, summonerName);
    }
});
