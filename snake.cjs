
class Game {
    #DIR
    #FIELD_WIDTH
    #FIELD_HEIGHT
    #initCntFood
    #snakes
    #food
    #directions
    #foodEaten
    #cntFoodEaten
    #isFinish
    #isStart
    #cntConnections
    #winnerId
    #stateNumber

    constructor(config) {
        this.#DIR = Object.freeze({ 'LEFT': 'LEFT', 'UP': 'UP', 'RIGHT': 'RIGHT', 'DOWN': 'DOWN' })

        this.#initCntFood = config.get_cntInitFood()
        this.#FIELD_WIDTH = config.get_fieldSizesWH()[0]
        this.#FIELD_HEIGHT = config.get_fieldSizesWH()[1]

        this.#snakes = []
        this.#food = []
        this.#directions = []
        this.#foodEaten = []
        this.#cntFoodEaten = []
        this.#isFinish = false
        this.#isStart = true
        this.#cntConnections = config.get_cntConnections()
        this.#winnerId = -1
        this.#stateNumber = 0
        this.#initSnakes()
        this.#initFood()
    }

    static Config = class {
        #limitSnakes
        #FIELD_WIDTH
        #FIELD_HEIGHT
        #initCntFood

        constructor(limitSnakes) {
            this.#limitSnakes = limitSnakes
            this.cntConnections = 0

            this.#FIELD_WIDTH = 16
            this.#FIELD_HEIGHT = 12

            this.#initCntFood = 3
        }

        add_connection() {
            this.cntConnections += 1
            return this.cntConnections
        }

        get_cntConnections() {
            return this.cntConnections
        }

        get_cntInitFood() {
            return this.#initCntFood
        }

        get_limitSnake() {
            return this.#limitSnakes
        }

        get_fieldSizesWH() {
            return [this.#FIELD_WIDTH, this.#FIELD_HEIGHT]
        }
    }

    set_snakes(snakes) {
        this.#snakes = snakes
    }

    set_food(food) {
        this.#food = food
    }

    get_isStart() {
        return this.#isStart
    }

    get_isFinish() {
        return this.#isFinish
    }

    getState(snakeId) {
        return {
            isStart: this.#isStart, isFinish: this.#isFinish,
            snakes: this.#snakes, food: this.#food, cntFoodEaten: this.#cntFoodEaten,
            cntConnections: this.#cntConnections, snakeId: snakeId, winnerId: this.#winnerId
        }
    }

    setDir(snakeId, dir) {
        if ([this.#DIR['RIGHT'], this.#DIR['LEFT'], this.#DIR['UP'], this.#DIR['DOWN']].includes(dir)) {
            if (dir == this.#DIR['RIGHT'] && this.#directions[snakeId] != this.#DIR['LEFT'] ||
                dir == this.#DIR['LEFT'] && this.#directions[snakeId] != this.#DIR['RIGHT'] ||
                dir == this.#DIR['UP'] && this.#directions[snakeId] != this.#DIR['DOWN'] ||
                dir == this.#DIR['DOWN'] && this.#directions[snakeId] != this.#DIR['UP']) {
                this.#directions[snakeId] = dir
            }
        }
    }

    step() {
        for (let i = 0; i < this.#cntConnections; i++) {
            if (this.#directions[i] == null) {
                continue
            }
            if ([this.#DIR['RIGHT'], this.#DIR['LEFT'], this.#DIR['UP'], this.#DIR['DOWN']].includes(this.#directions[i])) {
                this.#move(this.#directions[i], i)
            }
            this.#eatFood(i)
        }
        for (let i = 0; i < this.#cntConnections; i++) {
            this.#checkLoss(i)
        }

    }

    add_stateNumber() {
        this.#stateNumber += 1
        return this.#stateNumber - 1
    }

    checkSnakeExists(id) {
        return id < this.#cntConnections
    }

    #initSnakes() {
        let row_center = Math.floor(this.#FIELD_HEIGHT / 2)
        let col_center = Math.floor(this.#FIELD_WIDTH / 2)
        let tail_row
        for (let id = 1; id <= this.#cntConnections; id++) {
            let shift = (-1) ** (id + 1) * 2 * Math.floor(id / 2)
            let head_row = row_center + shift
            let head_col = col_center + 1
            let mid_row = tail_row = head_row
            let mid_col = col_center
            let tail_col = col_center - 1
            this.#snakes[id - 1] = [[head_row, head_col], [mid_row, mid_col], [tail_row, tail_col]]
            this.#directions[id - 1] = this.#DIR['RIGHT']
            this.#foodEaten[id - 1] = false
            this.#cntFoodEaten[id - 1] = 0
        }
    }

    #getFilledCells() {
        let filledCells = []
        for (let i = 0; i < this.#snakes.length; i++) {
            this.#snakes[i].forEach(x => filledCells.push(x[0] * this.#FIELD_WIDTH + x[1]))
        }
        this.#food.forEach(x => filledCells.push(x))
        return filledCells
    }

    #generateFood() {
        let filledCells = this.#getFilledCells()
        let pos = Math.floor(Math.random() * (this.#FIELD_WIDTH * this.#FIELD_HEIGHT - filledCells.length))
        let cnt = 0
        let i = 0
        for (; i < this.#FIELD_WIDTH * this.#FIELD_HEIGHT; i++) {
            if (filledCells.includes(i)) continue
            if (cnt == pos) {
                break
            }
            cnt++
        }
        this.#food.push(i)
    }

    #initFood() {
        for (let i = 0; i < this.#initCntFood; i++) {
            this.#generateFood()
        }
    }

    #deleteFood(pos) {
        var index = this.#food.indexOf(pos)
        this.#food.splice(index, 1)
    }

    #eatFood(id) {
        let snake1d = this.#snakes[id].map(x => { return x[0] * this.#FIELD_WIDTH + x[1] })
        let head_pos = snake1d[0]
        if (this.#food.includes(head_pos)) {
            this.#deleteFood(head_pos)
            this.#generateFood()
            this.#foodEaten[id] = true
            this.#cntFoodEaten[id]++
        }
    }


    #move(dir, id) {
        let head_row, head_col, tail_row, tail_col
        [head_row, head_col] = this.#snakes[id][0]
        if (this.#foodEaten[id]) {
            [tail_row, tail_col] = this.#snakes[id].at(-1)
            this.#foodEaten[id] = false
        }
        else {
            [tail_row, tail_col] = this.#snakes[id].pop()
        }
        switch (dir) {
            case this.#DIR['RIGHT']:
                this.#snakes[id].unshift([head_row, head_col + 1 >= this.#FIELD_WIDTH ? 0 : head_col + 1])
                break
            case this.#DIR['LEFT']:
                this.#snakes[id].unshift([head_row, head_col - 1 < 0 ? this.#FIELD_WIDTH - 1 : head_col - 1])
                break
            case this.#DIR['UP']:
                this.#snakes[id].unshift([head_row - 1 < 0 ? this.#FIELD_HEIGHT - 1 : head_row - 1, head_col])
                break
            case this.#DIR['DOWN']:
                this.#snakes[id].unshift([head_row + 1 >= this.#FIELD_HEIGHT ? 0 : head_row + 1, head_col])
                break
        }
    }

    #isCrashed(id) {
        let snake1 = this.#snakes[id].map(x => { return x[0] * this.#FIELD_WIDTH + x[1] })
        let head_pos = snake1[0]
        for (let i = 0; i < this.#cntConnections; i++) {
            if (i == id || this.#snakes[i] == []) continue
            let snake2 = this.#snakes[i].map(x => { return x[0] * this.#FIELD_WIDTH + x[1] })
            if (snake2.slice(1).includes(head_pos)) return true
            if (snake2[0] == head_pos) { return (snake1.length <= snake2.length) }
        }
        return false
    }

    #checkLoss(id) {
        if (this.#isCrashed(id)) {
            this.#snakes[id] = []
            this.#directions[id] = null
            let aliveSnakes = this.#snakes.filter(arr => arr.length > 0)
            let cntAliveSnakes = aliveSnakes.length
            if (cntAliveSnakes <= 1) {
                this.#isFinish = true
                this.#winnerId = this.#snakes.findIndex(arr => arr.length > 0)
            }
        }
    }
}


module.exports = { Game };


