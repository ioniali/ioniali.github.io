const tableBody = document.getElementById('table-body');
const fetchProgress = document.getElementById('fetch-progress');

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

async function main(){
    const summonerArray = getSummonerArray();

    const positionArray = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];

    const dataFrame = {};
    for (const position of positionArray){
        dataFrame[position] = {};
    }

    const championArray = [];

    for (const summoner of summonerArray){
        if (isPlatformIdValid(summoner.platformId) && isSummonerNameValid(summoner.summonerName)){
            try {
                const response = await fetch(`https://jarvan.ddns.net/api/scores/${summoner.platformId}/${summoner.summonerName}`);
                const dataArray = await response.json();
                
                for (const data of dataArray){
                    const { championName, individualPosition, score } = data;
                    if (!championArray.includes(championName)){
                        for (const position of positionArray){
                            dataFrame[position][championName] = 0;
                        }
                        championArray.push(championName);
                    }

                    dataFrame[individualPosition][championName] += score;
                }
            }
            catch (error){
                ;
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

    championArray.sort();

    fetchProgress.remove();
    
    for (const championName of championArray){
        const tableRow = document.createElement('tr');

        const tableRowHead = document.createElement('th');
        tableRowHead.scope = 'row';
        tableRowHead.style.textAlign = 'center';

        const headImage = document.createElement('img');
        headImage.src = `image/champion/${championName.toLowerCase()}.png`;
        headImage.style.width = '36px';
        headImage.style.height = '36px';
        tableRowHead.appendChild(headImage);

        tableRow.appendChild(tableRowHead);

        for (const position of positionArray){
            const value = dataFrame[position][championName];
            const tableData = document.createElement('td');
            tableData.style.textAlign = 'center';
            tableData.style['font-size'] = '13px';
            if (value === 0){
                tableData.textContent = '-';
            }
            else {
                tableData.textContent = value.toFixed(2);
                tableData.style.opacity = Math.min(1, (value / 2));
            }
            tableRow.appendChild(tableData);
        }

        tableBody.appendChild(tableRow);
    }

    const topArray = championArray.map(championName => dataFrame.TOP[championName]);
    const topSum = sumArray(topArray);
    const topSumData = document.getElementById('top-sum');
    topSumData.textContent = topSum.toFixed(2);

    const jungleArray = championArray.map(championName => dataFrame.JUNGLE[championName]);
    const jungleSum = sumArray(jungleArray);
    const jungleSumData = document.getElementById('jungle-sum');
    jungleSumData.textContent = jungleSum.toFixed(2);

    const middleArray = championArray.map(championName => dataFrame.MIDDLE[championName]);
    const middleSum = sumArray(middleArray);
    const middleSumData = document.getElementById('middle-sum');
    middleSumData.textContent = middleSum.toFixed(2);

    const bottomArray = championArray.map(championName => dataFrame.BOTTOM[championName]);
    const bottomSum = sumArray(bottomArray);
    const bottomSumData = document.getElementById('bottom-sum');
    bottomSumData.textContent = bottomSum.toFixed(2);

    const utilityArray = championArray.map(championName => dataFrame.UTILITY[championName]);
    const utilitySum = sumArray(utilityArray);
    const utilitySumData = document.getElementById('utility-sum');
    utilitySumData.textContent = utilitySum.toFixed(2);
}

main();
