import * as func from './back.cjs'
import express from 'express'

// TODO: func - это общепринято нызвать моделью - переимновать в model, или даже в snake - так понятнее будет

const args = process.argv;

// TODO: почему только он с большой?
const Verbose = args.includes('--verbose');

const app = express()
const port = 8080

// TODO: g_
const timeMove = 400
const delay = 50

const directions = { 37: 'LEFT', 38: 'UP', 39: 'RIGHT', 40: 'DOWN' }

let g_timeDelay = 0
let g_intervalId

let g_config
let g_game


app.use(express.json())
app.listen(port, () => {
    if (Verbose) { console.log(`App listening on port ${port}\n`) }
})


app.get('/ping', (_, res) => {
    res.send('OK')
})

app.post('/init', (req, res) => {
    clearInterval(g_intervalId)
    g_config = new func.Config(req.body.limitConnections)
    g_game = null
    res.send('Game inited')
    // TODO: вытащить в функцию логирования, которая сама решает - надо ли писать что-то в лог
    if (Verbose) { console.log('--- GAME INITED ---\n') }
})

app.post('/connect', (_, res) => {
    if (Verbose) { console.log('Trying to connect a new snake: ') }
    if (g_game !== null) {
        // TODO: мы не должны в случае ошибки отвечать кодом 200 (код можно посмотреть вызвав curl с флогом -vvv), и так везде
        res.send('Game already started')
        if (Verbose) { console.log('Failed, the game has already started\n') }
    }
    else {
        if (g_config.get_cntConnections() >= g_config.get_limitSnake()) {
            res.send('Limit snakes number is over')
            if (Verbose) { console.log('Failed, snake limit reached\n') }
        }
        else {
            let new_id = g_config.add_connection() - 1
            // TODO: пользователю наверно нужно отдавать id а не число подключений
            res.json({ cntConnections: new_id })
            if (Verbose) { console.log(`Success, snake number ${new_id} is connected\n`) }
        }
    }
})

app.post('/start', (_, res) => {
    g_game = new func.SnakeGame(g_config)
    startInterval()
    res.send('Game started')
    if (Verbose) { console.log('--- GAME STARTED ---\n') }
})

app.get('/state/:id', (req, res) => {
    // TODO: а если не число придёт, то что?
    let snakeId = parseInt(req.params.id, 10)
    if (Verbose) { console.log(`Trying to get game state for snake  ${snakeId}: `) }
    if (g_game == null || !g_game.get_isStart()) {
        res.send('Game hasnt started yet')
        if (Verbose) { console.log('Failed, game hasnt started yet\n') }
    }
    else if (!g_game.checkSnakeExists(snakeId)) {
        res.send('This snakeId does not exist')
        if (Verbose) { console.log('Failed, this snake Id does not exist\n') }
    }
    else {
        let state = g_game.getState(snakeId)
        res.json(state)

        // TODO: лучше это логирование убрать в интервал, где stеp делается
        // TODO: хорошо бы логировать номер state-а, который мы отдали клиенту
        if (Verbose) {
            console.log(`--- Game STATE for snake ${snakeId} ---\n`)
            if (state.snakes[snakeId].length == 0 && state.isStart) { console.log('Game over\n'); return }
            if (!state.isStart) { console.log('Game hasnt started yet\n'); return }
            if (state.isFinish && state.winnerId == snakeId) { console.log('Game is won\n'); return }
            if (state.isStart && !state.isFinish) {
                console.log('Game started')
                console.log(`Score = ${state.cntFoodEaten[snakeId]}`)
                showField(state)
            }
        }
    }
})

app.post('/direction/:id', (req, res) => {
    let snakeId = parseInt(req.params.id, 10)
    if (Verbose) { console.log(`Trying to set direction for snake  ${snakeId}: `) }
    if (!g_game.checkSnakeExists(snakeId)) {
        res.send('This snakeId does not exist')
        if (Verbose) { console.log('Failed, this snakeId does not exist\n') }
    }
    else {
        let dir = req.body.dir
        if (!(dir in directions)) {
            res.send('wrong direction')
            if (Verbose) { console.log('Failed, this directions is incorrect\n') }
        }
        else {
            g_game.setDir(snakeId, dir)
            res.send('got direction')
            if (Verbose) { console.log(`Success, direction ${directions[dir]} for snake ${snakeId} setted\n`) }
        }
    }
})

function startInterval() {
    g_intervalId = setInterval(() => {
        if (g_game.get_isFinish()) {
            clearInterval(g_intervalId);
            return;
        }
        g_timeDelay += delay
        if (g_timeDelay >= timeMove) {
            g_timeDelay = 0
            g_game.step()
        }
    }, delay)
}


function showField(state) {
    let [w, h] = g_game.get_fieldSizesWH()
    console.log('Field state: ')
    let field = []
    for (let i = 0; i < h; i++) {
        let line = []
        for (let j = 0; j < w; j++) { line.push('-\t') }
        field.push(line)
    }
    for (let food of state.food) {
        let i = Math.floor(food / w)
        let j = food % w
        field[i][j] = '*\t'
    }
    for (let id = 0; id < state.snakes.length; id++) {
        for (let pos = 0; pos < state.snakes[id].length; pos++) {
            let [i, j] = state.snakes[id][pos]
            if (pos == 0) { field[i][j] = `S${id}\t` }
            else { field[i][j] = `s${id}\t` }
        }
    }
    let top = (Array.from({ length: w + 1 }, (_, i) => (i - 1).toString() + '\t'))
    top[0] = '\t'
    console.log(top.join(''))
    for (let i = 0; i < h; i++) {
        console.log(`${i}\t` + field[i].join(''))
    }
    console.log('\n')
}