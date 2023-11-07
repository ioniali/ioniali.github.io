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

function fixString(string) {
    string = string.replace(/\s/g, '');
    return string.toLowerCase();
}

function isPlatformIdValid(platformId) {
    return ['euw', 'tr'].includes(platformId);
}

function isSummonerNameValid(summonerName) {
    return !(summonerName.length > 16 || summonerName.length < 3);
}

function isSummonerValid(platformId, summonerName) {
    return (isPlatformIdValid(platformId) && isSummonerNameValid(summonerName));
}

function getParamFromURL(key) {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const param = searchParams.get(key);

    if (!param) {
        throw new Error(`URL parameters does not have ${key}`);
    }

    return param;
}

function parseSummoner(string) {
    const parts = fixString(string).split('_');

    if (parts.length !== 2){
        throw new Error('Summoner string is not valid');
    }

    const platformId = parts[0];
    const summonerName = parts[1];
    
    if (!isSummonerValid(platformId, summonerName)) {
        throw new Error('Summoner is not valid');
    }

    return { platformId, summonerName };
}

function getSummoners() {
    var summonerParam;

    try {
        summonerParam = getParamFromURL('summoners');
    }
    catch (error) {
        console.error(error);
        return null;
    }

    const summonerParts = summonerParam.split(',');

    const resultArray = [];
    for (const summonerStr of summonerParts) {
        try {
            const summoner = parseSummoner(summonerStr);
            resultArray.push(summoner);
        }
        catch (error) {
            console.error('Error while parsing summoner');
            console.error(error);
        }
    }

    return resultArray;
}

async function fetchPlayer(platformId, summonerName) {
    var response;
    try {
        response = await fetch(`https://jarvan.ddns.net/api/player/${platformId}/${summonerName}`);
    }
    catch (error) {
        throw new Error('Error while fetching player');
    }

    var player;
    try {
        player = await response.json();
    }
    catch (error) {
        throw new Error('Error while parsing fetch response of player');
    }

    renderPlayer(player.summoner, player.league);
    return player;
}

function fetchPlayers() {
    const summoners = getSummoners();

    const promises = [];

    for (const summoner of summoners){
        const promise = async () => {
            try {
                const result = await fetchPlayer(summoner.platformId, summoner.summonerName);
                return result;
            }
            catch (error){
                console.error(error);
                return null;
            }
        }
        promises.push(promise);
    }

    return Promise.all(promises);
}

function renderPlayer(summoner, league){
    const htmlStr = 
`
<div style="display: flex;">
    <img src="/image/profileicon/${summoner.profileIconId}.png" style="width: 48px; height: fit-content; border-radius: 50%;">
    <div style="margin-left: 10px; margin-right: 10px; width: 160px;">
        <label style="font-size: 16px; font-weight: bold;">${summoner.name}</label>
        <label style="font-size: 16px;">${summoner.platformId}</label>
    </div>
    <label style="font-size: 14px;">${summoner.summonerLevel} Level</label>
</div>

<div style="display: flex;">
    <img src="/image/tier/${league.solo.tier.toLowerCase()}.png" style="width: 48px; height: fit-content;">
    <div style="margin-left: 10px; margin-right: 10px; width: 160px;">
        <div style="display: flex;">
            <label style="margin-right: 6px; font-size: 14px;">${league.solo.tier}</label>
            <label style="font-size: 14px">${league.solo.rank}</label>
        </div>
        <label style="font-size: 12px;">${league.solo.leaguePoints} LP</label>
    </div>
    <div>
        <label style="font-size: 12px;">${league.solo.wins}W ${league.solo.losses}L</label>
        <label style="font-size: 12px;">Win Rate ${league.solo.winRate}%</label>
    </div>
</div>

<div style="display: flex;">
    <img src="/image/tier/${league.flex.tier.toLowerCase()}.png" style="width: 48px; height: fit-content;">
    <div style="margin-left: 10px; margin-right: 10px; width: 160px;">
        <div style="display: flex;">
            <label style="margin-right: 6px; font-size: 14px;">${league.flex.tier}</label>
            <label style="font-size: 14px">${league.flex.rank}</label>
        </div>
        <label style="font-size: 12px;">${league.flex.leaguePoints} LP</label>
    </div>
    <div>
        <label style="font-size: 12px;">${league.flex.wins}W ${league.flex.losses}L</label>
        <label style="font-size: 12px;">Win Rate ${league.flex.winRate}%</label>
    </div>
</div>
`;
    const element = document.createElement('article');
    element.style.width = '325px';
    element.style.padding = '10px';
    element.style.borderRadius = '5%';
    element.style.marginLeft = '10px';
    element.style.marginRight = '10px';
    element.innerHTML = htmlStr;
    playerListElement.appendChild(element);
}

class Table {
    constructor(df){
        this.data = df.data;
        this.champions = df.champions;
        this.positions = df.positions;
    }

    reset(){
        tableBodyElement.innerHTML = '';
        for (const position of this.positions){
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

        for (const position of this.positions){
            const value = this.data[position][championName]
            const dataElement = this.createDataElement(value);
            rowElement.appendChild(dataElement);
        }

        return rowElement;
    }

    getPositionSum(position){
        var sum = 0;
        for (const champion of this.champions){
            sum += this.data[position][champion];
        }
        return sum;
    }

    setFootData(){
        for (const position of this.positions){
            const sum = this.getPositionSum(position);
            sumElements[position].textContent = sum.toFixed(1);
        }
    }

    update(){
        for (const champion of this.champions){
            const rowElement = this.createRowElement(champion);
            tableBodyElement.appendChild(rowElement);
        }
        this.setFootData();
    }
}

class DataFrame {
    constructor(){
        this.positions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
        this.champions = [];
    }

    addChampionIfNotExists(championName){
        if (this.champions.includes(championName) === false){
            for (const position of this.positions){
                this.data[position][championName] = 0;
            }
            this.champions.push(championName);
        }
    }

    getMaxValue(){
        var maxValue = 0;
        for (const position of this.positions){
            for (const champion of this.champions){
                const value = this.data[position][champion];
                if (value > maxValue){
                    maxValue = value;
                }
            }
        }
        return maxValue;
    }

    normalizeData(){
        const maxValue = this.getMaxValue() / 10;
        for (const position of this.positions){
            for (const champion of this.champions){
                const value = this.data[position][champion];
                this.data[position][champion] = value / maxValue;
            }
        }
    }

    sortChampions(){
        this.champions.sort();
    }

    setData(players){
        this.data = {
            TOP: {},
            JUNGLE: {},
            MIDDLE: {},
            BOTTOM: {},
            UTILITY: {}
        };

        for (const player of players){
            for (const match of player.score.list){
                const { championName, individualPosition, score } = match;

                this.addChampionIfNotExists(championName);
                this.data[individualPosition][championName] += score;
            }
        }
    }
}

async function main(){
    const players = await fetchPlayers();
    
    progressElement.remove();

    const df = new DataFrame();
    df.setData(players);
    df.normalizeData();
    df.sortChampions();

    const table = new Table(df);
    table.reset();
    table.update();
}

main();