const summonerDivElement = document.getElementById('summoners-div');
const summonerNameInputElement = document.getElementById('summoner-name-input');
const regionSelectElement = document.getElementById('region-select');
const appendSummonerButtonElement = document.getElementById('append-button');
const searchButtonElement = document.getElementById('search-button');

const summonerArray = [];

function removeItemFromArray(array, item){
    const index = array.indexOf(item);
    if (index !== -1){
        array.splice(index, 1);
    }
}

function appendSummonerElement(platformId, summonerName){
    const summoner = {platformId, summonerName};

    const containerElement = document.createElement('div');
    containerElement.className = 'grid';
    containerElement.style.alignItems = 'center';
    containerElement.style.marginBottom = '10px';

    const regionElement = document.createElement('label');
    regionElement.textContent = platformId;
    regionElement.style.fontSize = '15px';

    const nameElement = document.createElement('label');
    nameElement.textContent = summonerName;
    nameElement.style.fontSize = '15px';

    const removeElement = document.createElement('button');
    removeElement.textContent = 'Remove';
    removeElement.style.fontSize = '15px';
    removeElement.style.marginBottom = '0';
    
    removeElement.addEventListener('click', () => {
        summonerDivElement.removeChild(containerElement);
        removeItemFromArray(summonerArray, summoner);
    });

    containerElement.appendChild(regionElement);
    containerElement.appendChild(nameElement);
    containerElement.appendChild(removeElement);
    summonerDivElement.appendChild(containerElement);

    summonerArray.push(summoner);
}

function getSummonerName(){
    let summonerName = summonerNameInputElement.value;
    summonerName = summonerName.trim();
    if (summonerName === ''){
        alert(`Summoner name can't be empty`);
    }
    if (summonerName.length < 3){
        alert(`Summoner name can't be shorter than 3 letters`);
    }
    if (summonerName.length > 16){
        alert(`Summoner name can't be longer than 16 letters`);
    }
    summonerNameInputElement.value = '';
    return summonerName;
}

function getRegion(){
    return regionSelectElement.value;
}

appendSummonerButtonElement.addEventListener('click', function(){
    const platformId = getRegion();
    const summonerName = getSummonerName();

    appendSummonerElement(platformId, summonerName);
});

function getParamsStr(){
    const params = [];
    for (const summoner of summonerArray){
        params.push(`${summoner.platformId}_${summoner.summonerName}`);
    }
    return params.join(',');
}

searchButtonElement.addEventListener('click', function(){
    if (summonerArray.length > 0){
        window.location.href  = 'result?summoners=' + getParamsStr();
    }
    else {
        alert('Summoner list is empty');
    }
});