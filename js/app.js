const GREEN = [0, 255, 0];
const YELLOW = [255, 255, 0];
const RED = [255, 0, 0];


class App {
    constructor() {
        this.env = new Environment(this);
        this.entities = [];
        this.stats = {
            age: 0,
            kills: 0,
        };
    }
    spawn() {
        const x = (Math.random() * W) | 0;
        const y = (Math.random() * H) | 0;
        const cell = this.env.getCell(x, y);
        if (cell.color || cell.entity) {
            return;
        }
        const m = new Entity(this, cell);
        m.brain = Brain.random();
        this.entities.push(m);
    }
    step() {
        this.entities.forEach(m => {
            m.update();
        });
        this.entities.forEach(m => {
            m.step();
            m.age++;
            m.health--;
            if (m.health <= 0) {
                m.health = 0;
                m.heal();
            }
            m.brain = m.brain.mutated();
        });
        let kills = 0;
        let age = 0;
        this.entities = this.entities.filter(m => {
            if (m.health > 0) {
                kills = Math.max(m.stats.kills, kills);
                age = Math.max(m.age, age);
                return true;
            }
            m.cell.entity = null;
            m.cell.updateColor();
            return false;
        });
        document.querySelector('#population').innerText = this.entities.length;
        this.stats.age = Math.max(this.stats.age, age);
        this.stats.kills = Math.max(this.stats.kills, kills);
        document.querySelector('#age').innerText = age + ' (' + this.stats.age + ')';
        document.querySelector('#kills').innerText = kills + ' (' + this.stats.kills + ')';
        for (let i = 0; i < 10; i++) {
            this.spawn();
        }
        shuffleArray(this.entities);
        this.spawnEnergy();
    }
    spawnEnergy() {
        let x;
        let y;
        let cell;
        for (let i = 0; i < 50; i++) {
            x = (Math.random() * W) | 0;
            y = (Math.random() * H) | 0;
            cell = this.env.getCell(x, y);
            if (cell.egg) {
                cell.color = null;
                cell.egg = null;
                cell.updateColor();
            }
        }
        for (let i = 0; i < 50; i++) {
            x = (Math.random() * W) | 0;
            y = (Math.random() * H) | 0;
            cell = this.env.getCell(x, y);
            if (cell.color || cell.entity) {
                continue;
            }
            if (Math.random() < CONFIG.environment.greenDensity) {
                cell.color = GREEN;
                cell.updateColor();
                continue;
            }
            if (Math.random() < CONFIG.environment.yellowDensity) {
                cell.color = GREEN;
                cell.updateColor();
                continue;
            }
            const offsets = [[0, -1], [1, 0], [0, 1], [-1, 0]];
            for (let i = 0; i < offsets.length; i++) {
                const offset = offsets[i];
                const cell2 = this.env.getCell(x + offset[0], y + offset[1]);
                if (!cell2) {
                    continue;
                }
                if (cell2.colorEquals(0, 255, 0)) {
                    cell.color = GREEN;
                    cell.updateColor();
                    break;
                }
                if (cell2.colorEquals(255, 255, 0)) {
                    cell.color = YELLOW;
                    cell.updateColor();
                    break;
                }
            }
        }
    }
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}