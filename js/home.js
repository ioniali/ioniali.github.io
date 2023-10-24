const summonersDiv = document.getElementById('summoners-div');
const summonerNameInput = document.getElementById('summoner-name-input');
const regionSelect = document.getElementById('region-select');
const appendButton = document.getElementById('append-button');
const searchButton = document.getElementById('search-button');

const summonerArray = [];

function removeItemFromArray(array, item){
    const index = array.indexOf(item);
    if (index !== -1){
        array.splice(index, 1);
    }
}

function appendSummonerElement(platformId, summonerName){
    const summoner = {platformId: platformId, summonerName: summonerName};

    const summonerGrid = document.createElement('div');
    summonerGrid.className = 'grid';
    summonerGrid.style.alignItems = 'center';
    summonerGrid.style.marginBottom = '10px';

    const platformIdLabel = document.createElement('label');
    platformIdLabel.textContent = platformId;
    platformIdLabel.style.fontSize = '15px';

    const summonerNameLabel = document.createElement('label');
    summonerNameLabel.textContent = summonerName;
    summonerNameLabel.style.fontSize = '15px';

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.style.fontSize = '15px';
    removeButton.style.marginBottom = '0';
    
    removeButton.addEventListener('click', () => {
        summonersDiv.removeChild(summonerGrid);
        removeItemFromArray(summonerArray, summoner);
    });

    summonerGrid.appendChild(platformIdLabel);
    summonerGrid.appendChild(summonerNameLabel);
    summonerGrid.appendChild(removeButton);
    summonersDiv.appendChild(summonerGrid);

    summonerArray.push(summoner);
}

appendButton.addEventListener('click', function(){
    const summonerName = summonerNameInput.value.trim();
    if (summonerName !== '' && summonerName.length > 2){
        let platformId = regionSelect.value;
        let summonerName = summonerNameInput.value;
        platformId = platformId.replace(/\d+/g, '');
        summonerName = summonerName.trim();

        summonerNameInput.value = '';
        appendSummonerElement(platformId, summonerName);
    }
});

function getParamsStr(){
    const params = [];
    for (const summoner of summonerArray){
        params.push(`${summoner.platformId}_${summoner.summonerName}`);
    }
    return params.join(',');
}

searchButton.addEventListener('click', function(){
    const platformId = regionSelect.value;
    const summonerName = summonerNameInput.value.trim();
    if (summonerName === ''){
        if (summonerArray.length > 0){
            const params = [];
            for (const summoner of summonerArray){
                let platformId = summoner.platformId;
                let summonerName = summoner.summonerName;
                params.push(`${platformId}_${summonerName}`);
            }
            window.location.href  = 'result?summoners=' + getParamsStr();
        }
    }
    else {
        appendSummonerElement(platformId, summonerName);
    }
});
