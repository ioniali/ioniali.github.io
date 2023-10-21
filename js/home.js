const summonerList = document.getElementById('summoner-list');
const summonerNameInput = document.getElementById('summonerName');
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

function createGrid(){
    const divItem = document.createElement('div');
    divItem.className = 'grid';
    return divItem;
}

function createLabel(textContent){
    const labelItem = document.createElement('label');
    labelItem.textContent = textContent;
    return labelItem;
}

function createButton(textContent){
    const buttonItem = document.createElement('button');
    buttonItem.textContent = textContent;
    return buttonItem;
}

function appendSummoner(platformId, summonerName){
    const summoner = {platformId: platformId, summonerName: summonerName};

    const gridItem = createGrid();
    const labelItem = createLabel(`${platformId}\t${summonerName}`);
    const buttonItem = createButton('Remove');

    buttonItem.addEventListener('click', () => {
        summonerList.removeChild(gridItem);
        removeItemFromArray(summonerArray, summoner);
    });

    gridItem.appendChild(labelItem);
    gridItem.appendChild(buttonItem);
    summonerList.appendChild(gridItem);
    summonerNameInput.value = '';

    summonerArray.push(summoner);
}

appendButton.addEventListener('click', function(){
    const summonerName = summonerNameInput.value.trim();
    if (summonerName !== ''){
        appendSummoner(regionSelect.value, summonerName);
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
                params.push(`${summoner.platformId}_${summoner.summonerName}`);
            }
            window.location.href  = 'result?summoners=' + getParamsStr();
        }
    }
    else {
        appendSummoner(platformId, summonerName);
    }
});
