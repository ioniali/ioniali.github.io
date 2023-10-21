const summonerList = document.getElementById('summoner-list');
const summonerNameInput = document.getElementById('summonerName');
const regionSelect = document.getElementById('region-select');
const appendButton = document.getElementById('append-button');
const searchButton = document.getElementById('search-button');

const summonerArray = [];

function removeItemFromArray(array, item) {
    const index = array.indexOf(item);
    if (index !== -1) {
        array.splice(index, 1);
    }
}

function appendSummoner(platformId, summonerName){
    const summoner = {platformId: platformId, summonerName: summonerName};
    const divItem = document.createElement('div');
    divItem.className = 'grid';

    const labelItem = document.createElement('label');
    labelItem.textContent = `${platformId} ${summonerName}`;
    divItem.appendChild(labelItem);
    
    const buttomItem = document.createElement('button');
    buttomItem.textContent = 'Remove';
    buttomItem.addEventListener('click', () => {
        summonerList.removeChild(divItem);
        removeItemFromArray(summonerArray, summoner);
    });
    divItem.appendChild(buttomItem);

    summonerArray.push(summoner);

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
