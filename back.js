
const express = require('express')
const app = express()
const port = 8080

const FIELD_WIDTH = 16
const FIELD_HEIGHT = 12
const LEFT = 37
const UP = 38
const RIGHT = 39
const DOWN = 40

const initCntFood = 3
const timeMove = 400
const delay = 50

let snakes = []
let food = []
let directions = []
let foodEaten = false
let cntFoodEaten = 0
let prevDir = RIGHT
let isFinish = false


function initSnake(n = 0) {
    row_mid = Math.floor(FIELD_HEIGHT / 2)
    col_mid = Math.floor(FIELD_WIDTH / 2)
    head_row = row_mid
    head_col = col_mid + 1
    tail_row = row_mid
    tail_col = col_mid - 1

    snakes[n] = [[head_row, head_col], [row_mid, col_mid], [tail_row, tail_col]]
    directions[n] = RIGHT
}

function getFilledCells() {
    let filledCells = []
    for (i = 0; i < snakes.length; i++) {
        snakes[i].forEach(x => filledCells.push(x[0] * FIELD_WIDTH + x[1]))
    }
    food.forEach(x => filledCells.push(x))
    return filledCells
}

function generateFood() {
    let filledCells = getFilledCells()
    pos = Math.floor(Math.random() * (FIELD_WIDTH * FIELD_HEIGHT - filledCells.length))
    cnt = 0
    for (i = 0; i < FIELD_WIDTH * FIELD_HEIGHT; i++) {
        if (filledCells.includes(i)) continue
        if (cnt == pos) {
            break
        }
        cnt++
    }
    food.push(i)
}

function initFood() {
    for (let i = 0; i < initCntFood; i++) {
        generateFood()
    }
}

function eatFood(n = 0) {
    function deleteFood(pos) {
        var index = food.indexOf(pos)
        food.splice(index, 1)
    }
    let snake1d = snakes[n].map(function (x) { return x[0] * FIELD_WIDTH + x[1] })
    head_pos = snake1d[0]
    if (food.includes(head_pos)) {
        deleteFood(head_pos)
        generateFood()
        foodEaten = true
        cntFoodEaten++
    }
}

function move(dir, n = 0) {
    [head_row, head_col] = snakes[n][0]
    if (foodEaten) {
        [tail_row, tail_col] = snakes[n].at(-1)
        foodEaten = false
    }
    else {
        [tail_row, tail_col] = snakes[n].pop()
    }
    switch (dir) {
        case RIGHT:
            new_head_col = head_col + 1 >= FIELD_WIDTH ? 0 : head_col + 1
            snakes[n].unshift([head_row, new_head_col])
            break
        case LEFT:
            new_head_col = head_col - 1 < 0 ? FIELD_WIDTH - 1 : head_col - 1
            snakes[n].unshift([head_row, new_head_col])
            break
        case UP:
            new_head_row = head_row - 1 < 0 ? FIELD_HEIGHT - 1 : head_row - 1
            snakes[n].unshift([new_head_row, head_col])
            break
        case DOWN:
            new_head_row = head_row + 1 >= FIELD_HEIGHT ? 0 : head_row + 1
            snakes[n].unshift([new_head_row, head_col])
            break
    }
}

function checkLoss(n = 0) {
    // надо проверять, если врезались в другую змейку
    // если две головы врезались в друг друга - то победил тот, кто больше
    // если одинаковы - проиграли оба
    let snake1d = snakes[n].map(function (x) { return x[0] * FIELD_WIDTH + x[1] })
    head_pos = snake1d[0]
    if (snake1d.slice(1).includes(head_pos)) {
        clearInterval(intervalId)
        isFinish = true
        console.log('LOSS')
    }
}

let dir = RIGHT
let timeDelay = 0
let intervalId

function startInterval() {
    intervalId = setInterval(() => {
        timeDelay += delay
        if (timeDelay >= timeMove) {
            // для множества змеек надо будет проходится по массиву всех snake_id
            timeDelay = 0
            if (dir == null) {
                return
            }
            if ([RIGHT, LEFT, UP, DOWN].includes(dir)) {
                move(dir)
            }
            eatFood()
            checkLoss()
            console.log('- ', snakes[0])
            prevDir = dir
        }
    }, delay)
}


app.get('/', (req, res) => {
    res.send('OK')
})

app.use(express.json())

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

app.post('/start', (req, res) => {
    initSnake()
    initFood()
    startInterval()
    res.send('Game started')
})

// 1. сделать метод POST /init с указанием числа игроков -  сбрасывает всё внутреннее состояние к начальному (массив змеек пустой, интервал удален)
// 2. сделать метод POST /connect - возвращает snake_id
//    - /connect просто возвращает следующий доступный snake_id
//    - /connect должен сохранять кол-во подключенных игроков
//    - /connect возвращает ошибку, если игра уже началась
// 3. POST /start должен стартовать игру для подключенных змеек
// 4. GET /state должен в том числе говорить, началась ли игра и сколько клиентов подключено

app.get('/state', (req, res) => {
    // принимать номер змейки, для которой хотим получить состояние в get-параметрах
    // выглядеть это будет так: /state?snake_id=0 или /state?snake_id=1
    // почитать про  get-параметры (их можно использовать в GET, POST, и т.д., просто они так называются)

    // добавить флаг, что проиграли или победили
    res.json({isFinish: isFinish, snake: snakes[0], food: food});
})

app.post('/direction', (req, res) => {
    const snake_id = req.body.snake_id
    // 1. менять направление конкретной змейки (а не всех, как сейчас)
    // 2. получать snake_id в get-параметрах
    dir = req.body.dir
    switch (dir) {
    case UP: console.log('UP'); break;
    case DOWN: console.log('DOWN'); break;
    case LEFT: console.log('LEFT'); break;
    case RIGHT: console.log('RIGHT'); break;
    }
    res.send('got a dir for snake')
})

// сделать метод GET /ping, который просто возвращает 200
// это нужно чтобы клиент мог проверить доступность сервера