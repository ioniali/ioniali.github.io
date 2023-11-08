const tableBody = document.getElementById('table-body');
const fetchProgress = document.getElementById('fetch-progress');

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

function isSummonerValid(platformId, summonerName) {
    return (isPlatformIdValid(platformId) && isSummonerNameValid(summonerName));
}

function getParamFromURL(key) {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const param = searchParams.get(key);
    if (!param) {
        return null;
    }
    return param;
}

function getSummoners() {
    const param = getParamFromURL('summoners');
    if (!param) {
        return [];
    }

    function parse(string) {
        const [platformId, summonerName] = fixString(string).split('_');
        if ((!platformId || !summonerName) || isSummonerValid(platformId, summonerName)) {
            return null;
        }
        return { platformId, summonerName };
    }

    const parts = param.split(',');
    return parts.map(part => parse(part));
}

function fetchPlayers(summoners) {
    const promises = summoners.map((summoner) => {
        const { platformId, summonerName}  = summoner;
        const url = `https://jarvan.ddns.net/api/player/${platformId}/${summonerName}`;
        return fetchJson(url);
    });
    return Promise.all(promises);
}

async function fetchJson(url) {
    var response;
    try {
        response = await fetch(url);
    } catch (error) {
        console.error(error);
        return null;
    }

    var json;
    try {
        json = await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }

    return json;
}

class DataFrame {
    constructor() {
        this.positions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
        this.resetDF();
    }

    async initialize() {
        this.champions = await fetchJson('https://ioniali.github.io/static/champions.json');
        this.positions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
        this.map = {};
        this.championSum = {};
        this.positionSum = {};

        for (const position of this.positions) {
            for (const champion of this.champions) {
                this.map[position] = { [champion]: 0 };
                this.championSum[champion] = 0;
            }
            this.positionSum[position] = 0;
        }
    }

    appendData(position, champion, value) {
        this.map[position][champion] += value;
        this.championSum[champion] += value;
        this.positionSum[position] += value;
    }

    getMaxValue() {
        var maxValue = 0;
        for (const position of this.positions){
            for (const champion of this.champions){
                const value = this.map[position][champion];
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
                const value = this.map[position][champion];
                this.map[position][champion] = value / maxValue;
            }
        }
    }
}

async function main() {
    const summoners = getSummoners();
    const players = await fetchPlayers(summoners);
    const df = new DataFrame();

    for (const player of players) {
        if (player) {
            for (const match of player.score.list) {
                const { championName, individualPosition, score } = match;
                df.appendData(individualPosition, championName, score);
            }
        }
    }

    df.normalizeData();
    
    for (const champion of df.champions){
        if (df.championSum[champion] !== 0) {
            const tableRow = document.createElement('tr');

            const tableRowHead = document.createElement('th');
            tableRowHead.scope = 'row';

            const headImage = document.createElement('img');
            headImage.src = `/static/image/champion/${champion}.png`;
            headImage.className = 'table-head-img';
            headImage.style.borderRadius = '50%';
            tableRowHead.appendChild(headImage);

            tableRow.appendChild(tableRowHead);

            for (const position of df.positions){
                const value = df.map[position][champion];
                const tableData = document.createElement('td');
                tableData.style.fontSize = '14px';
                if (value === 0){
                    tableData.textContent = '-';
                }
                else {
                    tableData.textContent = value.toFixed(1);
                    tableData.style.opacity = Math.min(1, (value / 2));
                }
                tableRow.appendChild(tableData);
            }

            tableBody.appendChild(tableRow);
        }
    }

    const topSumData = document.getElementById('top-sum');
    topSumData.textContent = df.positionSum.TOP.toFixed(2);

    const jungleSumData = document.getElementById('jungle-sum');
    jungleSumData.textContent = df.positionSum.JUNGLE.toFixed(2);

    const middleSumData = document.getElementById('middle-sum');
    middleSumData.textContent = df.positionSum.MIDDLE.toFixed(2);

    const bottomSumData = document.getElementById('bottom-sum');
    bottomSumData.textContent = df.positionSum.BOTTOM.toFixed(2);

    const utilitySumData = document.getElementById('utility-sum');
    utilitySumData.textContent = df.positionSum.UTILITY.toFixed(2);

    fetchProgress.remove();
}

main();