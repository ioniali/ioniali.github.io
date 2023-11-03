const tableBodyElement = document.getElementById('table-body');
const progressElement = document.getElementById('progress');
const playerListElement = document.getElementById('player-list');

const topSumDataElement = document.getElementById('top-sum');
const jungleSumDataElement = document.getElementById('jungle-sum');
const middleSumDataElement = document.getElementById('middle-sum');
const bottomSumDataElement = document.getElementById('bottom-sum');
const utilitySumDataElement = document.getElementById('utility-sum');

function getSummonerArray(){
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const summoners = searchParams.get('summoners').split(',');
    const summonerArray = [];
    for (const summoner of summoners){
        const parts = fixString(summoner).split('_');
        const platformId = parts[0];
        const summonerName = parts[1];
        summonerArray.push({platformId: platformId, summonerName: summonerName});
    }
    return summonerArray;
}

function fixString(string){
    string = string.replace(/\s/g, '');
    return string.toLowerCase();
}

function isPlatformIdValid(platformId){
    return ['euw1', 'tr1'].includes(platformId);
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
            const response = await fetch(`https://jarvan.ddns.net/api/scores/${platformId}/${summonerName}`);
            const data = await response.json();
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
    <img src="/image/tier/${league.solo.tier}.png">
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
    <img src="/image/tier/${league.flex.tier}.png">
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

<div>
    <label>
        <input type="checkbox">
        SOLO/DUO
    </label>
    <label>
        <input type="checkbox">
        FLEX
    </label>
</div>

<div>
    <div>
        <input type="checkbox">
        <img src="/image/position/top.png">
    </div>
    <div>
        <input type="checkbox">
        <img src="/image/position/jungle.png">
    </div>
    <div>
        <input type="checkbox">
        <img src="/image/position/middle.png">
    </div>
    <div>
        <input type="checkbox">
        <img src="/image/position/bottom.png">
    </div>
    <div>
        <input type="checkbox">
        <img src="/image/position/utility.png">
    </div>
</div>
`;
    const htmlParser = new DOMParser();
    const element = htmlParser.parseFromString(htmlStr, 'text/html');
    playerListElement.appendChild(element);
}

class Player {
    constructor(summoner, league){
        this.summoner = summoner;
        this.league = league;
    }

    createIconElement(){
        const img = document.createElement('img');
        img.src = `/image/profileicon/${this.summoner.profileIconId}.png`;
        return img;
    }

    createNameElement(){
        const label = document.createElement('label');
        label.textContent = this.summoner.name;
        return label;
    }

    createRegionElement(){
        const label = document.createElement('label');
        label.textContent = this.summoner.platformId;
        return label;
    }

    createLevelElement(){
        const label = document.createElement('label');
        label.textContent = this.summoner.summonerLevel;
        return label;
    }

    createTierElement(queueType){
        const img = document.createElement('img');
        img.src = `/image/tier/${this.league[queueType].tier}.png`;
        return img;
    }

    createRankElement(queueType){
        const label = document.createElement('label');
        label.textContent = this.league[queueType].rank;
        return label;
    }

    createLeaguePointsElement(queueType){
        const label = document.createElement('label');
        label.textContent = this.league[queueType].leaguePoints;
        return label;
    }

    createQueueTypeElement

    update(){
        //row1
        const iconElement = this.createIconElement();
        const nameElement = this.createNameElement();
        const regionElement = this.createRegionElement();
        const levelElement = this.createLevelElement();
    }
}

function resetTable(){
    tableBodyElement.innerHTML = '';
    topSumDataElement.textContent = '0';
    jungleSumDataElement.textContent = '0';
    middleSumDataElement.textContent = '0';
    bottomSumDataElement.textContent = '0';
    utilitySumDataElement.textContent = '0';
}

class Table {
    constructor(dataFrame){
        this.dataFrame = dataFrame;
        this.championArray = dataFrame.championArray;
        this.positionArray = dataFrame.positionArray;
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
        const topSum = this.getPositionSum('TOP');
        topSumDataElement.textContent = topSum.toFixed(2);
        
        const jungleSum = this.getPositionSum('JUNGLE');
        jungleSumDataElement.textContent = jungleSum.toFixed(2);

        const middleSum = this.getPositionSum('MIDDLE');
        middleSumDataElement.textContent = middleSum.toFixed(2);

        const bottomSum = this.getPositionSum('BOTTOM');
        bottomSumDataElement.textContent = bottomSum.toFixed(2);

        const utilitySum = this.getPositionSum('UTILITY');
        utilitySumDataElement.textContent = utilitySum.toFixed(2);
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

    const queueIdArray = [];
    if (checkboxQueueId420Element.checked) queueIdArray.push(420);
    if (checkboxQueueId440Element.checked) queueIdArray.push(440);

    const dataFrame = getDataFrame(playerArray, queueIdArray);
    const table = new Table(dataFrame);
    table.update();
}

main();