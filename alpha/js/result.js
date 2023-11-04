const tableBodyElement = document.getElementById('table-body');
const progressElement = document.getElementById('progress');
const playerListElement = document.getElementById('player-list');

const sumElements = {
    TOP: document.getElementById('top-sum'),
    JUNGLE: document.getElementById('jungle-sum'),
    MIDDLE: document.getElementById('middle-sum'),
    BOTTOM: document.getElementById('bottom-sum'),
    UTILITY: document.getElementById('utility-sum'),
}

function getSummonerArray(){
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const summoners = searchParams.get('summoners').split(',');
    const summonerArray = [];
    for (const summoner of summoners){
        const parts = fixString(summoner).split('_');
        const platformId = parts[0];
        const summonerName = parts[1];
        summonerArray.push({platformId, summonerName});
    }
    return summonerArray;
}

function fixString(string){
    string = string.replace(/\s/g, '');
    return string.toLowerCase();
}

function isPlatformIdValid(platformId){
    return ['euw', 'tr'].includes(platformId);
}

function isSummonerNameValid(summonerName){
    return !(summonerName.length > 16 || summonerName.length < 3);
}

function maxArray(array){
    return Math.max(...array);
}

function sumArray(array){
    var sum = 0;
    for (const value of array){
        sum += value;
    }
    return sum;
}

async function fetchSummoner(platformId, summonerName){
    if (isPlatformIdValid(platformId) && isSummonerNameValid(summonerName)){
        try {
            const response = await fetch(`https://jarvan.ddns.net/api/player/${platformId}/${summonerName}`);
            const data = await response.json();
            renderPlayer(data.summoner, data.league);
            return data;
        }
        catch (error){
            throw new Error('fetch summoner failed');
        }
    }
    else {
        throw new Error('platform id or summoner name is not valid');
    }
}

function fetchAllSummoners(){
    const summonerArray = getSummonerArray();

    const promises = [];

    for (const summoner of summonerArray){
        const promise = fetchSummoner(summoner.platformId, summoner.summonerName);
        promises.push(promise);
    }

    return Promise.all(promises);
}

function renderPlayer(summoner, league){
    const htmlStr = 
`
<div>
    <img src="/image/profileicon/${summoner.profileIconId}.png">
    <div>
        <label>${summoner.name}</label>
        <label>${summoner.platformId}</label>
    </div>
    <label>${summoner.summonerLevel}</label>
</div>

<div>
    <img src="/image/tier/${league.solo.tier.toLowerCase()}.png">
    <div>
        <div>
            <label>${league.solo.tier}</label>
            <label>${league.solo.rank}</label>
        </div>
        <label>${league.solo.leaguePoints}</label>
    </div>
    <div>
        <label>${league.solo.wins}W ${league.solo.losses}L</label>
        <label>Win Rate ${league.solo.winRate}%</label>
    </div>
</div>

<div>
    <img src="/image/tier/${league.flex.tier.toLowerCase()}.png">
    <div>
        <div>
            <label>${league.flex.tier}</label>
            <label>${league.flex.rank}</label>
        </div>
        <label>${league.flex.leaguePoints}</label>
    </div>
    <div>
        <label>${league.flex.wins}W ${league.flex.losses}L</label>
        <label>Win Rate ${league.flex.winRate}%</label>
    </div>
</div>
`;
    const element = document.createElement('div');
    element.innerHTML = htmlStr;
    playerListElement.appendChild(element);
}

class Table {
    constructor(dataFrame){
        this.dataFrame = dataFrame;
        this.championArray = dataFrame.championArray;
        this.positionArray = dataFrame.positionArray;
    }

    reset(){
        tableBodyElement.innerHTML = '';

        for (const position of this.championArray){
            sumElements[position].textContent = '0';
        }
    }

    createHeadElement(championName){
        const headElement = document.createElement('th');
        headElement.scope = 'row';
        headElement.style.textAlign = 'center';

        const imageElement = document.createElement('img');
        imageElement.src = `/image/champion/${championName.toLowerCase()}.png`;
        imageElement.style.width = '36px';
        imageElement.style.height = '36px';
        imageElement.style.borderRadius = '50%';

        headElement.appendChild(imageElement);
        
        return headElement;
    }

    createDataElement(value){
        const dataElement = document.createElement('td');
        dataElement.style.textAlign = 'center';
        dataElement.style.fontSize = '13px';
        if (value === 0){
            dataElement.textContent = '-';
        }
        else {
            dataElement.textContent = value.toFixed(2);
            dataElement.style.opacity = Math.min(1, (value / 2));
        }
        return dataElement;
    }

    createRowElement(championName){
        const rowElement = document.createElement('tr');
        
        const headElement = this.createHeadElement(championName);
        rowElement.appendChild(headElement);

        for (const position of this.positionArray){
            const value = this.dataFrame[position][championName]
            const dataElement = this.createDataElement(value);
            rowElement.appendChild(dataElement);
        }

        return rowElement;
    }

    getPositionSum(position){
        const array = this.championArray.map(championName => this.dataFrame[position][championName]);
        return sumArray(array);
    }

    setFootData(){
        for (const position of this.positionArray){
            const sum = this.getPositionSum(position);
            sumElements[position].textContent = sum.toFixed(1);
        }
    }

    update(){
        for (const championName of this.championArray){
            const rowElement = this.createRowElement(championName);
            tableBodyElement.appendChild(rowElement);
        }
        this.setFootData();
    }
}

function getDataFrame(playerArray, queueIdArray){
    const dataFrame = {
        TOP: {},
        JUNGLE: {},
        MIDDLE: {},
        BOTTOM: {},
        UTILITY: {},
        positionArray: ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'],
        championArray: []
    };

    for (const summoner of playerArray){
        for (const matchData of summoner.matches){
            const {
                championName,
                individualPosition,
                queueId,
                score
            } = matchData;

            if (queueIdArray.includes(queueId)){
                if (!dataFrame.championArray.includes(championName)){
                    for (const position of positionArray){
                        dataFrame[position][championName] = 0;
                    }
                    dataFrame.championArray.push(championName);
                }
    
                dataFrame[individualPosition][championName] += score;
            }
        }
    }

    const valueArray = [];
    for (const championName of championArray){
        for (const position of positionArray){
            valueArray.push(dataFrame[position][championName]);
        }
    }

    const maxValue = maxArray(valueArray) / 10;

    for (const championName of championArray){
        for (const position of positionArray){
            dataFrame[position][championName] /= maxValue; 
        }
    }

    dataFrame.championArray.sort();

    return dataFrame;
}

async function main(){
    const playerArray = await fetchAllSummoners();

    const queueIdArray = [420];

    const dataFrame = getDataFrame(playerArray, queueIdArray);
    const table = new Table(dataFrame);
    table.reset();
    table.update();
}

main();