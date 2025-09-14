
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
let foodEaten = []
let cntFoodEaten = []
let isFinish = false
let isStart = false
let cntConnections = 0
let limitSnakes = 2//Math.floor(FIELD_HEIGHT / 2)
let winnerId = -1


app.use(express.json())
app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})

function checkSnakeExists(id) {
    return id < cntConnections
}

function initSnakes() {
    let row_center = Math.floor(FIELD_HEIGHT / 2)
    let col_center = Math.floor(FIELD_WIDTH / 2)
    for (let id = 1; id <= cntConnections; id++) {
        let shift = (-1) ** (id + 1) * 2 * Math.floor(id / 2)
        let head_row = row_center + shift
        let head_col = col_center + 1
        let mid_row = tail_row = head_row
        let mid_col = col_center
        let tail_col = col_center - 1
        snakes[id - 1] = [[head_row, head_col], [mid_row, mid_col], [tail_row, tail_col]]
        console.log(snakes[id - 1])
        directions[id - 1] = RIGHT
        foodEaten[id - 1] = false
        cntFoodEaten[id - 1] = 0
    }
}

function getFilledCells() {
    let filledCells = []
    for (let i = 0; i < snakes.length; i++) {
        snakes[i].forEach(x => filledCells.push(x[0] * FIELD_WIDTH + x[1]))
    }
    food.forEach(x => filledCells.push(x))
    return filledCells
}

function generateFood() {
    let filledCells = getFilledCells()
    let pos = Math.floor(Math.random() * (FIELD_WIDTH * FIELD_HEIGHT - filledCells.length))
    let cnt = 0
    let i = 0
    for (; i < FIELD_WIDTH * FIELD_HEIGHT; i++) {
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

function eatFood(id) {
    function deleteFood(pos) {
        var index = food.indexOf(pos)
        food.splice(index, 1)
    }
    let snake1d = snakes[id].map(function (x) { return x[0] * FIELD_WIDTH + x[1] })
    head_pos = snake1d[0]
    if (food.includes(head_pos)) {
        deleteFood(head_pos)
        generateFood()
        foodEaten[id] = true
        cntFoodEaten[id]++
    }
}

function move(dir, id) {
    [head_row, head_col] = snakes[id][0]
    if (foodEaten[id]) {
        [tail_row, tail_col] = snakes[id].at(-1)
        foodEaten[id] = false
    }
    else {
        [tail_row, tail_col] = snakes[id].pop()
    }
    switch (dir) {
        case RIGHT:
            snakes[id].unshift([head_row, head_col + 1 >= FIELD_WIDTH ? 0 : head_col + 1])
            break
        case LEFT:
            snakes[idn].unshift([head_row, head_col - 1 < 0 ? FIELD_WIDTH - 1 : head_col - 1])
            break
        case UP:
            snakes[id].unshift([head_row - 1 < 0 ? FIELD_HEIGHT - 1 : head_row - 1, head_col])
            break
        case DOWN:
            snakes[id].unshift([head_row + 1 >= FIELD_HEIGHT ? 0 : head_row + 1, head_col])
            break
    }
}

function isCrashed(id) {
    // +надо проверять, если врезались в другую змейку
    // +если две головы врезались в друг друга - то победил тот, кто больше
    // +если одинаковы - проиграли оба
    console.log("checking loss for snake id: " + id)
    console.log("checking loss for snake: " + snakes[id])
    let snake1 = snakes[id].map(function (x) { return x[0] * FIELD_WIDTH + x[1] })
    let head_pos = snake1[0]
    for (let i = 0; i < cntConnections; i++) {
        if (i == id || snakes[i] == []) continue
        let snake2 = snakes[i].map(function (x) { return x[0] * FIELD_WIDTH + x[1] })
        if (snake2.slice(1).includes(head_pos)) return true
        if (snake2[0] == head_pos) return (snake1.length <= snake2.length)
    }
    return false
}

function checkLoss(id) {
    if (isCrashed(id)) {
        snakes[id] = []
        let aliveSnakes = snakes.filter(arr => arr.length > 0)
        let cntAliveSnakes = aliveSnakes.length
        if (cntAliveSnakes <= 1) {
            isFinish = true
            clearInterval(intervalId)
            winnerId = snakes.findIndex(arr => arr.length > 0)
        }
    }
}

let timeDelay = 0
let intervalId

function startInterval() {
    intervalId = setInterval(() => {
        console.log(directions)
        console.log(snakes)
        console.log("connections count: " + cntConnections)
        timeDelay += delay
        if (timeDelay >= timeMove) {
            timeDelay = 0
            for (let i = 0; i < cntConnections; i++) {
                console.log("moving snake: " + i)
                if (directions[i] == null) {
                    console.log("skip moving snake: " + i)
                    return
                }
                if ([RIGHT, LEFT, UP, DOWN].includes(directions[i])) {
                    console.log("moving snake to direction: " + directions[i])
                    move(directions[i], i)
                }
                eatFood(i)
                checkLoss(i)
            }
        }
    }, delay)
}


app.get('/ping', (req, res) => {
    res.send('OK')
})

app.post('/init', (req, res) => {
    clearInterval(intervalId)
    limitSnakes = req.body.limitConnections
    snakes = []
    cntConnections = 0
    food = []
    directions = []
    foodEaten = []
    cntFoodEaten = []
    isFinish = false
    isStart = false
    cntConnections = 0
    winnerId = -1
    res.send('Game inited')
})

app.post('/connect', (_, res) => {
    if (isStart) { res.send('Game already started') }
    else {
        if (cntConnections >= limitSnakes) { res.send('Limit snakes number') }
        else {
            let current = cntConnections
            cntConnections += 1
            res.json({ cntConnections: current })
        }
    }
})

app.post('/start', (_, res) => {
    initSnakes()
    initFood()
    startInterval()
    isStart = true
    res.send('Game started')
})

app.get('/state/:id', (req, res) => {
    let snakeId = parseInt(req.params.id, 10)
    if (!checkSnakeExists(snakeId)) { res.send('This snakeId does not exist') }
    else {
        res.json({
            isStart: isStart, isFinish: isFinish, snakes: snakes,
            cntConnections: cntConnections, snakeId: snakeId, food: food
        })
    }
})

app.post('/direction', (req, res) => {
    const snakeId = req.body.snake_id
    // 1. получать snakeId в get-параметрах (а не в body)
    if (!checkSnakeExists(snakeId)) { res.send('This snakeId does not exist') }
    else {
        let keyCode = req.body.dir
        if ([RIGHT, LEFT, UP, DOWN].includes(keyCode)) {
            if (keyCode == RIGHT && directions[snakeId] != LEFT || keyCode == LEFT && directions[snakeId] != RIGHT ||
                keyCode == UP && directions[snakeId] != DOWN || keyCode == DOWN && directions[snakeId] != UP) {
                directions[snakeId] = keyCode
            }
            switch (keyCode) {
                case UP: console.log('UP'); break;
                case DOWN: console.log('DOWN'); break;
                case LEFT: console.log('LEFT'); break;
                case RIGHT: console.log('RIGHT'); break;
            }
            res.send('got a dir for snake')
        }
    }
})

// 1. Рефакторинг
//    - сделать класс (!!!) с игрой змейка
//    - у класса должен быть понятный интерфейс с конструтором (инициализация игры) и методами
//    - основные методы: получить информацию об игре, сделать шаг игры, изменить направление змейки
//    - разделить на файлы
//    - плюс тесты на класс с логикой
// 2. Сделать нормальный verbose
//    - параметр запуска сервера с уровнем логирования (отключено и включено)
//    - если включено - надо красиво и понятно в консоли отображать что происходит
// 3. Начать писать фронт - страница с окном запуска игры, на этой странице
//    - указывается адрес backend-а (localhost:8080 по-умолчанию)
//    - параметры для init (limit connections и т.п.)
//    - показывать число подключенных игроков (возможно нужно добавить доп метод на бэк для этого)
//    - кнопка старт - стартует игру и закрывает диалог - поле пока не делаем

