window.onload = function () {
    initial()
}

document.onkeydown = keyBar

const LEFT = 37
const UP = 38
const RIGHT = 39
const DOWN = 40
const directions = { 37: 'LEFT', 38: 'UP', 39: 'RIGHT', 40: 'DOWN' }

const w = window.innerWidth
const h = window.innerHeight
const wMenu = 400
const hMenu = 320

let rows = 12
let cols = 12
let cellSize = 50
let limitSnakes = 2
let serverAddress = window.location.origin

let refreshDelay = 50
let moveDalay = 20
let moveTime = 300
let speed = 4
let intervalIdSnakesCount
let intervalIdGameStarted
let intervalIdGameStep
let snakeId = 0
let prevKeyCode = RIGHT
let keyCode = RIGHT

function initSnakeLimit() {
    let setting = document.createElement('div')
    setting.className = 'setting'
    let setName = document.createElement('div')
    setName.textContent = 'Snake limit: '
    let edit = document.createElement('input')
    edit.id = 'limite-snake'
    edit.className = 'edit'
    edit.type = 'number'
    edit.min = '1'
    edit.max = '5'
    edit.value = limitSnakes
    setting.appendChild(setName)
    setting.appendChild(edit)
    return setting
}

function initSpeed() {
    let setting = document.createElement('div')
    setting.className = 'setting'
    let setName = document.createElement('div')
    setName.textContent = 'Speed: '
    let edit = document.createElement('input')
    edit.id = 'speed-snake'
    edit.className = 'edit'
    edit.type = 'number'
    edit.min = '1'
    edit.max = '5'
    edit.value = speed
    setting.appendChild(setName)
    setting.appendChild(edit)
    return setting
}

function initRowCount() {
    let setting = document.createElement('div')
    setting.className = 'setting'
    let setName = document.createElement('div')
    setName.textContent = 'Field size: '
    let edit = document.createElement('input')
    edit.id = 'row-count'
    edit.className = 'edit'
    edit.type = 'number'
    edit.min = '10'
    edit.max = '20'
    edit.value = rows
    setting.appendChild(setName)
    setting.appendChild(edit)
    return setting
}

/*function initColumnCount() {
    let setting = document.createElement('div')
    setting.className = 'setting'
    let setName = document.createElement('div')
    setName.textContent = 'Column count: '
    let edit = document.createElement('input')
    edit.id = 'col-count'
    edit.className = 'edit'
    edit.type = 'number'
    edit.min = '10'
    edit.max = '20'
    edit.value = cols
    setting.appendChild(setName)
    setting.appendChild(edit)
    return setting
}*/

function initCreateButton() {
    let createButton = document.createElement('button')
    createButton.className = 'create-button'
    createButton.textContent = 'Create game'
    createButton.addEventListener('click', createButtonClick)
    return createButton
}

function initConnectButton() {
    let connectButton = document.createElement('button')
    connectButton.className = 'connect-button'
    connectButton.textContent = 'Join the game'
    connectButton.addEventListener('click', connectButtonClick)
    return connectButton
}

function initMenu() {
    let menu = document.getElementsByClassName('menu')[0]
    menu.style.width = `${wMenu}px`
    menu.style.visibility = 'visible'

    menu.appendChild(initSnakeLimit())
    menu.appendChild(initSpeed())
    menu.appendChild(initRowCount())
    menu.appendChild(initCreateButton())
    menu.appendChild(initConnectButton())

    initWaitingStart()
    initWaitingSnakes()
}

function initWaitingStart() {
    let waiting_start = document.getElementsByClassName('waiting-start')[0]
    waiting_start.style.height = `${hMenu / 2}px`
    waiting_start.style.width = `${wMenu}px`
    waiting_start.style.visibility = 'hidden'
}

function initWaitingSnakes() {
    let waiting_snake = document.getElementsByClassName('waiting-snakes')[0]
    waiting_snake.style.height = `${hMenu / 2}px`
    waiting_snake.style.width = `${wMenu}px`
    waiting_snake.style.visibility = 'hidden'

    let setting = document.createElement('div')
    setting.className = 'setting'
    setName = document.createElement('div')
    setName.textContent = 'Count of snakes: '
    edit = document.createElement('div')
    edit.id = 'count-snake'
    edit.className = 'edit'
    edit.type = 'number'

    edit.innerHTML = '0'
    setting.appendChild(setName)
    setting.appendChild(edit)
    waiting_snake.appendChild(setting)

    let startButton = document.createElement('button')
    startButton.className = 'start-button'
    startButton.textContent = 'Start'
    startButton.addEventListener('click', startButtonClick)
    waiting_snake.appendChild(startButton)
}

async function connectButtonClick() {
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

    let elem = document.getElementsByClassName('menu')[0]
    elem.style.visibility = 'hidden'
    elem = document.getElementsByClassName('waiting-snakes')[0]
    elem.style.visibility = 'hidden'
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
    let menu = document.getElementsByClassName('waiting-snakes')[0]
    menu.style.visibility = 'visible'

    intervalIdSnakesCount = setInterval(() => {
        refreshSnakesCount()
    }, refreshDelay)
}

function calculateCellSize(width) {
    cellSize = width / cols
}

function initField() {
    let field = document.getElementsByClassName('field')[0]
    let fieldWidth = 100
    calculateCellSize(fieldWidth)
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < rows; j++) {
            let cell = document.createElement('div')
            cell.className = 'cell'
            cell.style.top = `${i * cellSize}%`
            cell.style.left = `${j * cellSize}%`
            cell.style.height = `${cellSize}%`
            cell.style.width = `${cellSize}%`
            field.appendChild(cell)
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

    let cells = document.getElementsByClassName('cell')

    for (const cell of cells) {
        cell.classList = ''
        cell.classList.add('cell')
    }
    let class_head
    let class_snake

    state.snakes.forEach((snake, index) => {
        let head_coodrs = snake[0]
        let head_cell = cols * head_coodrs[0] + head_coodrs[1]
        if (index == snakeId) {
            class_head = 'own-snake-head'
            class_snake = 'own-snake'
        }
        else {
            class_head = 'snake-head'
            class_snake = 'snake'
        }
        cells[head_cell].classList.add(class_head)
        for (const coords of snake) {
            let cells_number = cols * coords[0] + coords[1]
            cells[cells_number].classList.add(class_snake)
        }
    })

    for (const food of state.food) {
        cells[food].classList.add('food')
    }
}

async function showLoss() {
    let state = await fetch(`${serverAddress}/state/${parseInt(snakeId)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
    alert(`You lost! Your earned ${state.cntFoodEaten[snakeId]} points. Let's play again?`)
    location.reload()
}

async function showWin() {
    let state = await fetch(`${serverAddress}/state/${parseInt(snakeId)}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
    alert(`You won! Your earned ${state.cntFoodEaten[snakeId]} points. Let's play again?`)
    location.reload()
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

    if (state.isFinish) {
        if (parseInt(state.winnerId) == snakeId) {
            showWin()
        }
        else {
            showLoss()
        }
    }
}

async function startGame() {
    moveTime = await fetch(`${serverAddress}/time_move`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(reponse => reponse.timeMove)

    intervalIdGameStep = setInterval(() => {
        setDirection(keyCode)
        drowField()
        checkFinish()
    }, 10)
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
    let menu = document.getElementsByClassName('waiting-start')[0]
    menu.style.visibility = 'visible'

    let info = document.createElement('div')
    info.className = 'setting'
    setName = document.createElement('div')
    info.appendChild(setName)
    menu.appendChild(info)

    intervalIdGameStarted = setInterval(async () => {
        await refreshGameStarted()
    }, refreshDelay)
}

function initial() {
    initMenu()
}

function initGame(limitSnakes, speed, width, height) {
    fetch(`${serverAddress}/init`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "limitConnections": limitSnakes, "speed": speed, "width": width, "height": height })
    })
}

async function connectGame() {
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
}

async function createButtonClick() {
    limitSnakes = document.getElementById('limite-snake').value
    speed = document.getElementById('speed-snake').value

    rows = document.getElementById('row-count').value
    cols = rows //document.getElementById('col-count').value

    let menu = document.getElementsByClassName('menu')[0]
    menu.style.visibility = 'hidden'

    initGame(limitSnakes, speed, cols, rows)
    connectGame()

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
    document.getElementById("background-music").play();
}

function setDirection(dir) {
    fetch(`${serverAddress}/direction/${snakeId}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "dir": directions[dir] })
    })
}

async function keyBar(e) {
    e = e || window.Event
    if ([RIGHT, LEFT, UP, DOWN].includes(e.keyCode)) {
        if (e.keyCode == RIGHT && prevKeyCode != LEFT || e.keyCode == LEFT && prevKeyCode != RIGHT ||
            e.keyCode == UP && prevKeyCode != DOWN || e.keyCode == DOWN && prevKeyCode != UP) {
            keyCode = e.keyCode
            prevKeyCode = await fetch(`${serverAddress}/direction/${snakeId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(response => response.dir)
        }
    }
}
