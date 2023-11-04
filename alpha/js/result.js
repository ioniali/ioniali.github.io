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
    const array = [];
    for (const summoner of summoners){
        const parts = fixString(summoner).split('_');
        const platformId = parts[0];
        const summonerName = parts[1];
        
        if (isPlatformIdValid(platformId) && isSummonerNameValid(summonerName)){
            array.push({platformId, summonerName});
        }
        else {
            console.error('Region or name is not valid');
        }
    }
    return array;
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

async function fetchSummoner(platformId, summonerName){
    try {
        const response = await fetch(`https://jarvan.ddns.net/api/player/${platformId}/${summonerName}`);
        const player = await response.json();
        renderPlayer(player.summoner, player.league);
        return player;
    }
    catch (error){
        console.error('Fetch summoner failed');
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
    <label>${summoner.summonerLevel} Level</label>
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
    const players = await fetchAllSummoners();

    const df = new DataFrame();
    df.setData(players);
    df.normalizeData();
    df.sortChampions();

    const table = new Table(df);
    table.reset();
    table.update();
}

main();