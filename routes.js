import * as snake from './snake.cjs'
import express from 'express'

const args = process.argv;

const verbose = args.includes('--verbose');

const app = express()
const port = 8080

const g_timeMove = 400
const g_delay = 50

const directions = { LEFT: 'LEFT', UP: 'UP', RIGHT: 'RIGHT', DOWN: 'DOWN' }

let g_timeDelay = 0
let g_intervalId

let g_config
let g_game


function logif(verbose, str, status = 0) {
    if (status != 0) console.log(`status code: ${status}`)
    if (verbose) console.log(str)
}


app.use(express.json())
app.listen(port, () => { logif(verbose, `App listening on port ${port}\n`) })


app.get('/ping', (_, res) => {
    res.send('OK')
})

app.post('/init', (req, res) => {
    clearInterval(g_intervalId)
    g_config = new snake.Game.Config(req.body.limitConnections)
    g_game = null
    res.send('Game inited')
    logif(verbose, '--- GAME INITED ---\n')
})

app.post('/connect', (_, res) => {
    logif(verbose, 'Trying to connect a new snake: ')
    if (g_game !== null) {
        let status = 405
        res.status(status).send('Game already started')
        logif(verbose, 'Failed, the game has already started\n', status)
    }
    else {
        if (g_config.get_cntConnections() >= g_config.get_limitSnake()) {
            let status = 405
            res.status(status).send('Limit snakes number is over')
            logif(verbose, 'Failed, snake limit reached\n', status)
        }
        else {
            let new_id = g_config.add_connection() - 1
            res.json({ snakeId: new_id })
            logif(verbose, `Success, snake number ${new_id} is connected\n`)
        }
    }
})

app.post('/start', (_, res) => {
    g_game = new snake.Game(g_config)
    startInterval()
    res.send('Game started')
    logif(verbose, '--- GAME STARTED ---\n')
})

app.get('/state/:id', (req, res) => {
    let snakeId = parseInt(req.params.id)
    if (!Number.isInteger(snakeId)) {
        let status = 415
        res.status(status).send('Only integer snake id is allowed')
        logif(verbose, 'Only integer snake id is allowed', status)
        return
    }
    logif(verbose, `Trying to get game state for snake  ${snakeId}: `)
    if (g_game == null || !g_game.get_isStart()) {
        let status = 400
        res.status(status).send('Game hasnt started yet')
        logif(verbose, 'Failed, game hasnt started yet\n', status)
        return
    }
    else if (!g_game.checkSnakeExists(snakeId)) {
        let status = 400
        res.status(status).send('This snakeId does not exist')
        logif(verbose, 'Failed, this snake Id does not exist\n', status)
        return
    }
    else {
        let state = g_game.getState(snakeId)
        res.json(state)
        logif(verbose, `Success, state of snake ${snakeId}:\n ${JSON.stringify(state)}`)
    }
})

app.post('/direction/:id', (req, res) => {
    let snakeId = parseInt(req.params.id, 10)
    if (verbose) { console.log(`Trying to set direction for snake  ${snakeId}: `) }
    if (!g_game.checkSnakeExists(snakeId)) {
        let status = 400
        res.status(status).send('This snakeId does not exist')
        logif(verbose, 'Failed, this snakeId does not exist\n', status)
    }
    else {
        let dir = req.body.dir
        if (!(Object.values(directions).includes(dir))) {
            let status = 400
            res.status(status).send('wrong direction')
            logif(verbose, 'Failed, this directions is incorrect\n', status)
        }
        else {
            g_game.setDir(snakeId, dir)
            res.send('got direction')
            logif(verbose, `Success, direction ${dir} for snake ${snakeId} setted\n`)
        }
    }
})

function startInterval() {
    g_intervalId = setInterval(() => {
        if (g_game.get_isFinish()) {
            clearInterval(g_intervalId);
            return;
        }
        g_timeDelay += g_delay
        if (g_timeDelay >= g_timeMove) {
            g_timeDelay = 0
            g_game.step()
            let state = g_game.getState(0)
            let stateNumber = g_game.add_stateNumber()
            showState(state, stateNumber)
        }
    }, g_delay)
}

function showState(state, n = 0) {
    if (verbose) {
        console.log(`--- Game STATE № ${n} ---\n`)
        if (!state.isStart) { console.log('Game hasnt started yet\n'); return }
        if (state.isFinish) { console.log(`Game is finished, winner id = ${state.winnerId}\n`); return }
        if (state.isStart && !state.isFinish) {
            console.log('Game started')
            showField(state)
        }
    }
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
