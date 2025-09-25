const { Game } = jest.requireActual('./snake.cjs');


test('Test 1 check set limit snake', () => {
    let config1 = new Game.Config(3)
    expect(config1.get_limitSnake()).toBe(3);
});

test('Test 2 check add connection', () => {
    let config2 = new Game.Config(2)
    config2.add_connection()
    expect(config2.get_cntConnections()).toBe(1);
});

test('Test 3 check eat food score added', () => {
    let config3 = new Game.Config(2)
    config3.add_connection()
    config3.add_connection()
    let game3 = new Game(config3)
    let [w, h] = game3.get_fieldSizesWH()
    let snakes3 = [[[2, 6], [2, 5], [2, 4]],
    [[5, 9], [5, 10], [5, 11]]]
    food = [2 * w + 7]
    game3.set_snakes(snakes3)
    game3.set_food(food)
    game3.step()
    let state3 = game3.getState(0)
    expect(state3.cntFoodEaten[0]).toBe(1)
    game3.step()
    game3.step()
    game3.step()
    expect(state3.snakes[0].length).toBe(4);
});

test('Test 4 check snake lost', () => {
    let config4 = new Game.Config(2)
    config4.add_connection()
    config4.add_connection()
    let game4 = new Game(config4)
    let snakes4 = [[[2, 6], [2, 5], [2, 4]],
    [[3, 6], [4, 6], [4, 7]]]
    game4.set_snakes(snakes4)
    game4.setDir(1, "UP")
    game4.step()
    let state4 = game4.getState(0)
    expect(state4.snakes[1].length).toBe(0);
    expect(state4.winnerId).toBe(0);
});

test('Test 5 check shortest snake lost', () => {
    let config5 = new Game.Config(2)
    config5.add_connection()
    config5.add_connection()
    let game5 = new Game(config5)
    let snakes5 = [[[2, 6], [2, 5], [2, 4]],
    [[3, 7], [3, 8], [3, 9], [3, 10]]]
    game5.setDir(1, "UP")
    game5.set_snakes(snakes5)
    game5.step()
    let state5 = game5.getState(0)
    expect(state5.snakes[0].length).toBe(0);
    expect(state5.winnerId).toBe(1);
});
