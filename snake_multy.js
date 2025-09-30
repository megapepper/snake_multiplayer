window.onload = function () {
    initGame();
};

document.onkeydown = keyBar;

const cellSize = 50;
const LEFT = 37;
const UP = 38;
const RIGHT = 39;
const DOWN = 40;
const SPACE = 32;
const SETTINGS = 83;
const w = window.innerWidth;
const h = window.innerHeight;
const wMenu = 400;
const hMenu = 300;

let prevKeyCode = RIGHT;
let rows = Math.floor(h / (cellSize));
let cols = Math.floor(w / cellSize);
let limitSnakes = 2
let serverAddress = 'http://localhost:8080'

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
}

function refreshButtonClick() {
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
    let menu = document.getElementsByClassName('waiting')[0];
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

    let refreshButton = document.createElement('button');
    refreshButton.className = 'refeesh-button';
    let refreshIcon = document.createElement('span')
    refreshIcon.className = 'material-symbols-outlined'
    refreshIcon.textContent = 'refresh'
    refreshButton.appendChild(refreshIcon)
    refreshButton.addEventListener('click', refreshButtonClick);
    setting.appendChild(refreshButton);

    let startButton = document.createElement('button');
    startButton.className = 'start-button';
    startButton.textContent = 'Start';
    startButton.addEventListener('click', startButtonClick);
    menu.appendChild(startButton);
}

function initGame() {
    initMenu();
}

function createButtonClick() {
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

    let menu = document.getElementsByClassName('menu')[0];
    menu.style.visibility = 'hidden';
    waitingSnakes()
}

function startButtonClick() {
    let menu = document.getElementsByClassName('waiting')[0];
    menu.style.visibility = 'hidden';
    fetch(`${serverAddress}/start`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
}

function settings() {
    window.location.reload();
}

function keyBar(e) {
    e = e || window.Event;
    if ([RIGHT, LEFT, UP, DOWN].includes(e.keyCode)) {
        if (e.keyCode == RIGHT && prevKeyCode != LEFT || e.keyCode == LEFT && prevKeyCode != RIGHT ||
            e.keyCode == UP && prevKeyCode != DOWN || e.keyCode == DOWN && prevKeyCode != UP) {
            keyCode = e.keyCode;
        }
    }
    if (e.keyCode == SPACE) {
        pause();
    }
    if (e.keyCode == SETTINGS) {
        settings();
    }
}
