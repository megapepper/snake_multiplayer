const { Config, SnakeGame } = jest.requireActual('./back.cjs');


// TODO: за пределами тестовых функций не должно быть никакого кода (тест сам должен всё создавать)
let config1 = new Config(3)

test('Test 1 check set limit snake', () => {
    expect(config1.get_limitSnake()).toBe(3);
});


let config2 = new Config(2)
config2.add_connection()

test('Test 1 check add connection', () => {
    expect(config2.get_cntConnections()).toBe(1);
});


let config3 = new Config(2)
config3.add_connection()
config3.add_connection()
let game3 = new SnakeGame(config3)
let [w, h] = game3.get_fieldSizesWH()
let snakes3 = [[[2, 6], [2, 5], [2, 4]],
          [[5, 9], [5, 10], [5, 11]]]
food = [2 * w + 7]
game3.set_snakes(snakes3)
game3.set_food(food)
game3.step()
let state3 = game3.getState(0)

test('Test 3.1 check eat food score added', () => {
    expect(state3.cntFoodEaten[0]).toBe(1);
});

game3.step()
game3.step()
game3.step()

test('Test 3.2 check eat food length added', () => {
    expect(state3.snakes[0].length).toBe(4);
});


let config4 = new Config(2)
config4.add_connection()
config4.add_connection()
let game4 = new SnakeGame(config4)
let snakes4 = [[[2, 6], [2, 5], [2, 4]],
          [[3, 6], [4, 6], [4, 7]]]
game4.set_snakes(snakes4)
game4.setDir(1, 38)
game4.step()
let state4 = game4.getState(0)

test('Test 4.1 check snake lost', () => {
    expect(state4.snakes[1].length).toBe(0);
});

test('Test 4.2 check snake won', () => {
    expect(state4.winnerId).toBe(0);
});


let config5 = new Config(2)
config5.add_connection()
config5.add_connection()
let game5 = new SnakeGame(config5)
let snakes5 = [[[2, 6], [2, 5], [2, 4]],
               [[3, 7], [3, 8], [3, 9], [3, 10]]]
game5.setDir(1, 38)
game5.set_snakes(snakes5)
game5.step()
let state5 = game5.getState(0)

test('Test 5.1 check shortest snake lost', () => {
    expect(state5.snakes[0].length).toBe(0);
});

test('Test 5.2 check longest snake won', () => {
    expect(state5.winnerId).toBe(1);
});