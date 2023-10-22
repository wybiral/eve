class Entity {
    constructor(app, cell) {
        this.app = app;
        this.cell = cell;
        this.cell.entity = this;
        this.cell.updateColor();
        this.direction = (Math.random() * 4) | 0;
        this.brain = null;
        this.age = 0;
        this.health = CONFIG.entities.maxHealth;
        this.tokens = {
            green: 2,
            yellow: 0,
        };
        this.stats = {
            kills: 0,
        };
    }
    nextCell(i) {
        let x = this.cell.x;
        let y = this.cell.y;
        if (this.direction == 0) {
            y -= i;
        } else if (this.direction == 1) {
            x += i;
        } else if (this.direction == 2) {
            y += i;
        } else if (this.direction == 3) {
            x -= i;
        }
        return this.cell.env.getCell(x, y);
    }
    update() {
        if (this.health <= 0) {
            return;
        }
        const array = this.brain.neurons;
        array[0] = 1.0;
        cast(this, -1, array.subarray(1, 6)),
        cast(this, 1, array.subarray(6, 11)),
        cast(this, 0, array.subarray(11, 16)),
        array[17] = this.tokens.green / 10;
        array[18] = this.tokens.yellow / 10,
        this.brain.activate();
    }
    step() {
        if (this.health <= 0) {
            return;
        }
        if (this.brain.get('divide') > 0.5) {
            this.divide();
        }
        if (this.brain.get('drop_green') > 0.5) {
            this.dropToken('green', GREEN);
        }
        if (this.brain.get('drop_yellow') > 0.5) {
            this.dropToken('yellow', YELLOW);
        }
        const steer = this.brain.get('steer');
        const move = this.brain.get('move');
        if (steer < -0.5) {
            this.direction = clamp(this.direction - 1, 4);
        } else if (steer > 0.5) {
            this.direction = clamp(this.direction + 1, 4);
        }
        if (move > 0.5) {
            this.move();
        }
    }
    move() {
        let cell = this.cell;
        let cell2 = this.nextCell(1);
        if (cell2.colorEquals(255, 0, 0)) {
            this.health = 0;
            this.tokens.green = 0;
        } else if (cell2.entity) {
            // attack/infect
            if (this.tokens.yellow <= 0) {
                return;
            }
            if (this.brain.get('attack') > 0.5 && cell2.entity.health > 0 && this.tokens.yellow > cell2.entity.tokens.yellow) {
                this.tokens.yellow--;
                this.stats.kills++;
                this.tokens.green = Math.min(this.tokens.green + cell2.entity.tokens.green, 10);
                this.tokens.yellow = Math.min(this.tokens.yellow + cell2.entity.tokens.yellow, 10);
            } else if (this.brain.get('infect') >= 0 && this.tokens.yellow > cell2.entity.tokens.yellow) {
                this.tokens.yellow--;
                const infect = Math.min(this.brain.get('infect'), 0.9999);
                const i = (infect * LAYERS) | 0;
                cell2.entity.brain.layers[i] = this.brain.layers[i];
            }
        } else if (cell2.egg) {
            const fertilizationCost = CONFIG.entities.fertilizationCost;
            if (this.brain.get('attack') > 0.5) {
                // consume egg
                this.tokens.green = Math.min(this.tokens.green + cell2.egg.green, 10);
                cell.entity = null;
                cell.updateColor();
                cell2.color = null;
                cell2.entity = this;
                cell2.egg = null;
                this.cell = cell2;
                cell2.updateColor();
            } else if (this.tokens.green >= fertilizationCost) {
                // reproduce
                const egg = cell2.egg;
                if (!CONFIG.entities.requireMate || egg.parent !== this) {
                    this.tokens.green -= fertilizationCost;
                    const that = new Entity(this.app, cell2);
                    if (egg.cross < 0) {
                        that.brain = egg.brain.crossed(this.brain);
                    } else {
                        that.brain = this.brain.crossed(egg.brain);
                    }
                    if (egg.shuffle < 0) {
                        shuffleArray(that.brain.layers);
                    }
                    that.direction = this.direction;
                    cell2.entity = that;
                    cell2.egg = null;
                    this.cell.env.app.entities.push(that);
                }
            }
        } else {
            let moved = (cell2.color == null);
            if (cell2.colorEquals(0, 255, 0) && this.tokens.green < 10) {
                moved = true;
                this.tokens.green++;
            }
            if (cell2.colorEquals(255, 255, 0) && this.tokens.yellow < 10) {
                moved = true;
                this.tokens.yellow++;
            }
            if (moved) {
                cell.entity = null;
                cell.updateColor();
                cell2.color = null;
                cell2.entity = this;
                this.cell = cell2;
                cell2.updateColor();
            }
        }
    }
    divide() {
        this.direction = (this.direction + 2) % 4;
        const cell = this.nextCell(1);
        this.direction = (this.direction + 2) % 4;
        const cost = CONFIG.entities.eggCost;
        if (this.tokens.green >= cost && !cell.color && !cell.entity) {
            this.tokens.green -= cost;
            cell.egg = {
                parent: this,
                signal1: this.brain.get('signal1'),
                signal2: this.brain.get('signal2'),
                cross: this.brain.get('cross1'),
                shuffle: this.brain.get('cross2'),
                brain: this.brain.withoutNeurons(),
                green: cost,
            };
        }
    }
    heal() {
        if (this.tokens.green <= 0) {
            return;
        }
        this.tokens.green--;
        this.health = CONFIG.entities.maxHealth;
    }
    dropToken(token, color) {
        if (this.tokens[token] <= 0) {
            return;
        }
        const m = this;
        m.direction = (m.direction + 2) % 4;
        const cell = m.nextCell(1);
        m.direction = (m.direction + 2) % 4;
        if (cell.entity && cell.entity.tokens[token] < 10) {
            this.tokens[token]--;
            cell.entity.tokens[token]++;
        } else if (!cell.color) {
            this.tokens[token]--;
            cell.color = color;
            cell.updateColor();
        }
    }
}

function cast(m, d, out) {
    let cell = null;
    let i = 0;
    const oldD = m.direction;
    m.direction = clamp(m.direction + d, 4);
    while (i < 33) {
        i++;
        cell = m.nextCell(i);
        if (cell.color || cell.entity) {
            break;
        }
    }
    m.direction = oldD;
    const f = (33 - i) / 32.0
    out[0] = f;
    if (out.length > 1) {
        if (cell.entity) {
            out[1] = 0.0;
            out[2] = 1.0;
            out[3] = 1.0;
            out[4] = cell.entity.brain.get('signal1');
            out[5] = cell.entity.brain.get('signal2');
        } else if (cell.egg) {
            out[1] = 0.0;
            out[2] = 0.0;
            out[3] = 1.0;
            out[4] = cell.egg.signal1;
            out[5] = cell.egg.signal2;
        } else if (cell.color) {
            out[1] = (cell.color[0] / 255);
            out[2] = (cell.color[1] / 255);
            out[3] = (cell.color[2] / 255);
            out[4] = 0.0;
            out[5] = 0.0;
        }
    }
    return out;
}
