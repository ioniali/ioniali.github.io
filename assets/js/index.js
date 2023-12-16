const regionSelect = document.getElementById('region-select');
const nameInput = document.getElementById('name-input');
const appendButton = document.getElementById('append-button');
const goButton = document.getElementById('go-button');
const playersHeader = document.getElementById('players-header');
const playersDiv = document.getElementById('players-div');

function removeItemFromArray(array, item) {
    return array.filter(Item => Item !== item);
}

//EUW@ioniali-002
var playerArray = [];

function getPlatformId() {
    return regionSelect.value;
}

function getRiotId() {
    const riotId = nameInput.value.trim();
    if (!isRiotIdValid(riotId)) {
        alert('Riot ID is not valid!');
        return null;
    }
    nameInput.value = '';
    disableButton(appendButton);
    return riotId;
}

function isRiotIdValid(riotId) {
    const [gameName, tagLine] = riotId.split('#');
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

function disableButton(button) {
    button.disabled = true;
    button.classList.add('disabled');
}

function enableButton(button) {
    button.disabled = false;
    button.classList.remove('disabled');
}

function hideElement(element) {
    element.classList.add('visually-hidden');
}

function showElement(element) {
    element.classList.remove('visually-hidden');
}

nameInput.addEventListener('input', () => {
    if (nameInput.value.length > 2) {
        enableButton(appendButton);
        enableButton(goButton);
        return;
    } else if (playerArray.length === 0) {
        disableButton(goButton);
        hideElement(playersHeader);
    }
    disableButton(appendButton);
});

const playerDiv = document.getElementById('player-div');

function appendPlayer(platformId, riotId) {
    const playerString = platformId + '@' + riotId.replace('#', '-');
    const newPlayerDiv = playerDiv.cloneNode(true);
    
    newPlayerDiv.querySelector('#player-platform-id-header').textContent = platformId.toUpperCase();
    newPlayerDiv.querySelector('#player-riot-id-header').textContent = riotId;
    newPlayerDiv.querySelector('#remove-button').onclick = function() {
        newPlayerDiv.remove();
        playerArray = removeItemFromArray(playerArray, playerString);
        if (playerArray.length === 0) {
            disableButton(goButton);
            hideElement(playersHeader);
        }
    }

    showElement(playersHeader);
    showElement(newPlayerDiv);

    playersDiv.appendChild(newPlayerDiv);
    playerArray.push(playerString);
}

function appendButtonOnclick() {
    const platformId = getPlatformId();
    const riotId = getRiotId();
    if (riotId) {
        appendPlayer(platformId, riotId);
    }  
}

appendButton.onclick = appendButtonOnclick;

goButton.onclick = function() {
    if (appendButton.disabled === false) {
        appendButtonOnclick();
    }
    window.location.href  = 'result.html?summoners=' + playerArray.join(',');
}