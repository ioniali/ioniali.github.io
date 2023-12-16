const tableBody = document.getElementById('table-body');
const championTR = document.getElementById('champion-tr');

function hideElement(element) {
    element.classList.add('visually-hidden');
}

function showElement(element) {
    element.classList.remove('visually-hidden');
}

function fixString(string){
    string = string.replace(/\s/g, '');
    return string.toLowerCase();
}

function isPlatformIdValid(platformId){
    return ['euw', 'tr'].includes(platformId);
}

function isRiotIdValid(riotId) {
    const [gameName, tagLine] = riotId.split('-');
    if (gameName.length < 3 || gameName.length > 16) {
        return false;
    }
    if (tagLine !== undefined &&
        tagLine.length !== 0 &&
        (tagLine.length < 3 || tagLine.length > 5))
    {
        return false;
    }
    return true;
}

function isPlayerValid(platformId, riotId) {
    return (isPlatformIdValid(platformId) && isRiotIdValid(riotId));
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
        const [platformId, riotId] = fixString(string).split('@');
        if ((!platformId || !riotId) || !isPlayerValid(platformId, riotId)) {
            return null;
        }
        return { platformId, riotId };
    }

    const parts = param.split(',');
    return parts.map(part => parse(part));
   //return [{platformId: 'euw', riotId: 'ioniali-002'}];
}

function fetchPlayers(summoners) {
    const promises = summoners.map((summoner) => {
        const { platformId, riotId }  = summoner;
        var [gameName, tagLine] = riotId.split('-');
        if (tagLine === undefined || tagLine.length === 0) {
            tagLine = platformId;
        }
        const url = `https://jarvan.ddns.net/player/${platformId}/${gameName}-${tagLine}`;
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
    async initialize() {
        this.champions = await fetchJson('assets/js/champions.json');
        this.positions = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
        this.map = {};
        this.championSum = {};
        this.positionSum = {};
        this.maxValue = 1;

        for (const position of this.positions) {
            this.map[position] = {}
            for (const champion of this.champions) {
                this.map[position][champion] = 0;
            }
            this.positionSum[position] = 0;
        }

        for (const champion of this.champions) {
            this.championSum[champion] = 0;
        }
    }

    appendData(position, champion, value) {
        this.map[position][champion] += value;
        this.championSum[champion] += value;
        this.positionSum[position] += value;

        if (this.map[position][champion] > this.maxValue) {
            this.maxValue = this.map[position][champion];
        }
    }

    getData(position, champion) {
        return this.map[position][champion];
    }

    normalizeData(){
        const maxValue = this.maxValue / 10;

        for (const position of this.positions) {
            for (const champion of this.champions) {
                this.map[position][champion] /= maxValue;
            }
            this.positionSum[position] /= maxValue;
        }

        for (const champion of this.champions) {
            this.championSum[champion] /= maxValue;
        }
    }
}

async function main() {
    const summoners = getSummoners();
    const players = await fetchPlayers(summoners);

    const df = new DataFrame();
    await df.initialize();

    for (const player of players) {
        if (player) {
            for (const match of player.matches) {
                const { championName, individualPosition, score } = match;
                df.appendData(individualPosition, championName, score);
            }
        }
    }

    df.normalizeData();

    for (const champion of df.champions.reverse()){
        if (df.championSum[champion] !== 0) {
            const newChampionTR = championTR.cloneNode(true);
            showElement(newChampionTR);
            tableBody.insertBefore(newChampionTR, tableBody.firstChild);

            newChampionTR.querySelector('#champion-th-img').src = `assets/img/champions-square/${champion}.png`;

            for (const position of df.positions){
                const value = df.getData(position, champion);
                const positionTD = newChampionTR.querySelector(`#${position.toLowerCase()}-td`);
                if (value !== 0){
                    positionTD.textContent = value.toFixed(1);
                    if (value < 1) {
                        positionTD.style.opacity = Math.min(value + 0.2, 1);
                    } else if (value > 5) {
                        var currentColor = window.getComputedStyle(positionTD).color;
                        var [R, G, B] = currentColor.match(/\d+/g);

                        const scale = (value / 10);
                        R = Math.min(Math.max(R * (scale + 0.5), 0), 255);
                        G = Math.min(Math.max(G * (1 - scale), 0), 255);
                        B = Math.min(Math.max(B * (1 - scale), 0), 255);
                      
                        // Apply the modified color
                        var newColor = `rgb(${R},${G},${B})`;
                        positionTD.style.color = newColor;
                    }
                }
            }
        }
    }

    for (const position of df.positions){
        const value = df.positionSum[position];
        if (value !== 0){
            document.getElementById(`${position.toLowerCase()}-sum-th`).textContent = value.toFixed(1);
        }
    }
}

main();