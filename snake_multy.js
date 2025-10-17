window.onload = function () {
    initGame();
};

const cellSize = 50;
const SPACE = 32;
const SETTINGS = 83;
const w = window.innerWidth;
const h = window.innerHeight;
const wMenu = 400;
const hMenu = 220;

let rows = Math.floor(h / (cellSize));
let cols = Math.floor(w / cellSize);
let limitSnakes = 2
let serverAddress = 'http://localhost:8080'

let delay = 200
let intervalIdSnakesCount
let intervalIdGameStarted
let intervalIdGameStep
let snakeId = 0

const margin_side = Math.floor((w - cellSize * cols) / 2);
const margin_top = Math.floor((h - cellSize * rows) / 2);

function initMenu() {
    console.log('init menu')
    let menu = document.getElementsByClassName('menu')[0];
    menu.style.top = `${(rows / 2) * cellSize - hMenu / 2}px`;
    menu.style.left = `${(cols / 2) * cellSize - wMenu / 2}px`;
    menu.style.height = `${hMenu}px`;
    menu.style.width = `${wMenu}px`;
    menu.style.marginLeft = `${margin_side}px`;
    menu.style.marginRight = `${margin_side}px`;
    menu.style.marginTop = `${margin_top}px`;
    menu.style.marginBottom = `${margin_top}px`;
    menu.style.visibility = 'visible';

    let setting = document.createElement('div');
    setting.className = 'setting';
    let setName = document.createElement('div');
    setName.textContent = 'Server address: ';
    let inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.id = 'server-address';
    inputText.className = 'edit';
    inputText.value = serverAddress;
    setting.appendChild(setName);
    setting.appendChild(inputText);
    menu.appendChild(setting);

    setting = document.createElement('div');
    setting.className = 'setting';
    setName = document.createElement('div');
    setName.textContent = 'Snake limit: ';
    let edit = document.createElement('input');
    edit.id = 'limite-snake';
    edit.className = 'edit';
    edit.type = 'number';
    edit.min = '1';
    edit.max = '5';
    edit.value = limitSnakes;
    setting.appendChild(setName);
    setting.appendChild(edit);
    menu.appendChild(setting);

    setting = document.createElement('div');
    setting.className = 'setting';
    setName = document.createElement('div');
    setName.textContent = 'Count of snakes: ';
    edit = document.createElement('div');
    edit.id = 'count-snake';
    edit.className = 'edit';
    edit.type = 'number';

    let startButton = document.createElement('button');
    startButton.className = 'create-button';
    startButton.textContent = 'Create game';
    startButton.addEventListener('click', createButtonClick);
    menu.appendChild(startButton);

    let connectButton = document.createElement('button');
    connectButton.className = 'connect-button';
    connectButton.textContent = 'Join the game';
    connectButton.addEventListener('click', connectButtonClick);
    menu.appendChild(connectButton);
}

async function connectButtonClick() {
    serverAddress = document.getElementById('server-address').value
    let snakeIdStr = await fetch(`${serverAddress}/connect`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => response.snakeId)
    snakeId = parseInt(snakeIdStr)

    let menu = document.getElementsByClassName('menu')[0];
    menu.style.visibility = 'hidden';
    initField()
    waitingStart()
}

function refreshSnakesCount() {
    let countSnakes = document.getElementById('count-snake')
    fetch(`${serverAddress}/count`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => countSnakes.innerHTML = response.countSnakes.toString())
}

function waitingSnakes() {
    let menu = document.getElementsByClassName('waiting-snakes')[0];
    menu.style.top = `${(rows / 2) * cellSize - hMenu / 2}px`;
    menu.style.left = `${(cols / 2) * cellSize - wMenu / 2}px`;
    menu.style.height = `${hMenu}px`;
    menu.style.width = `${wMenu}px`;
    menu.style.visibility = 'visible';

    let setting = document.createElement('div');
    setting.className = 'setting';
    setName = document.createElement('div');
    setName.textContent = 'Count of snakes: ';
    let edit = document.createElement('div');
    edit.id = 'count-snake';
    edit.className = 'edit';
    edit.type = 'number';
    edit.innerHTML = '0';
    setting.appendChild(setName);
    setting.appendChild(edit);
    menu.appendChild(setting);

    let startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.textContent = 'Start';
    startButton.addEventListener('click', startButtonClick);
    menu.appendChild(startButton);

    intervalIdSnakesCount = setInterval(() => {
        refreshSnakesCount()
    }, delay)
}

function step() {

}

async function initField() {
    let sizes = await fetch(`${serverAddress}/size`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
    rows = sizes.height
    cols = sizes.width
    let field = document.getElementsByClassName('field')[0];
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.top = `${i * cellSize}px`;
            cell.style.left = `${j * cellSize}px`;
            cell.style.height = `${cellSize}px`;
            cell.style.width = `${cellSize}px`;
            cell.style.marginLeft = `${margin_side}px`;
            cell.style.marginRight = `${margin_side}px`;
            cell.style.marginTop = `${margin_top}px`;
            cell.style.marginBottom = `${margin_top}px`;
            field.appendChild(cell);
        }
    }
}

async function drowField() {
    let state = await fetch(`${serverAddress}/state/0`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())

    let cells = document.getElementsByClassName('cell');

    for (const cell of cells) {
        cell.classList = ''
        cell.classList.add('cell')
    }

    for (const snake of state.snakes) {
        for (const coords of snake) {
            let cells_number = cols * coords[0] + coords[1]
            cells[cells_number].classList.add('snake')
        }
    }

    for (const food of state.food) {
        cells[food].classList.add('food')
    }
}

async function checkFinish() {
    let state = await fetch(`${serverAddress}/state/${parseInt(snakeId)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
    console.log('snake Id ', snakeId, state)
}

function startGame() {
    console.log('START!!!')
    intervalIdGameStep = setInterval(() => {
        drowField()
        checkFinish()
    }, delay)
}

async function refreshGameStarted() {
    let isStarted = await fetch(`${serverAddress}/check_start`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => response.isStarted)
    if (isStarted) {
        let menu = document.getElementsByClassName('waiting-start')[0]
        menu.style.visibility = 'hidden'
        clearInterval(intervalIdGameStarted)
        startGame()
    }
}

function waitingStart() {
    console.log('waiting start')
    let menu = document.getElementsByClassName('waiting-start')[0];
    menu.style.top = `${(rows / 2) * cellSize - hMenu / 2}px`;
    menu.style.left = `${(cols / 2) * cellSize - wMenu / 2}px`;
    menu.style.height = `${hMenu / 2}px`;
    menu.style.width = `${wMenu}px`;
    menu.style.visibility = 'visible';

    let info = document.createElement('div');
    info.className = 'setting';
    setName = document.createElement('div');
    info.appendChild(setName);
    menu.appendChild(info);

    intervalIdGameStarted = setInterval(async () => {
        await refreshGameStarted()
    }, delay)
}

function initGame() {
    initMenu()
}

async function createButtonClick() {
    serverAddress = document.getElementById('server-address').value
    limitSnakes = document.getElementById('limite-snake').value

    fetch(`${serverAddress}/init`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "limitConnections": limitSnakes })
    })
        .then(response => response.json())
        .then(response => console.log(JSON.stringify(response)))

    let menu = document.getElementsByClassName('menu')[0]
    menu.style.visibility = 'hidden'

    serverAddress = document.getElementById('server-address').value
    let snakeIdStr = await fetch(`${serverAddress}/connect`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(response => response.snakeId)
    snakeId = parseInt(snakeIdStr)
    initField()
    waitingSnakes()
}

function startButtonClick() {
    let waiting_start = document.getElementsByClassName('waiting-start')[0]
    waiting_start.style.visibility = 'hidden'
    let waiting_snakes = document.getElementsByClassName('waiting-snakes')[0]
    waiting_snakes.style.visibility = 'hidden'

    clearInterval(intervalIdSnakesCount)

    fetch(`${serverAddress}/start`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    startGame()
}


