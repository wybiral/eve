class Environment {
    constructor(app) {
        this.app = app;
        this.el = document.createElement('canvas');
        this.el.width = W;
        this.el.height = H;
        this.el.style.width = this.el.width + 'px';
        this.el.style.height = this.el.height + 'px';
        this.ctx = this.el.getContext('2d');
        this.grid = new Array(H);
        for (let i = 0; i < H; i++) {
            this.grid[i] = new Array(W);
            for (let j = 0; j < W; j++) {
                this.grid[i][j] = new Cell(this, j, i);
            }
        }
    }
    getCell(x, y) {
       return this.grid[y][x];
    }
    setColor(x, y, color) {
        const cell = this.getCell(x, y);
        cell.color = color;
        cell.updateColor();
    }
}

class Cell {
    constructor(env, x, y) {
        this.env = env;
        this.x = x;
        this.y = y;
        this.color = null;
        this.entity = null;
        this.egg = null;
    }
    colorEquals(r, g, b) {
        if (!this.color) {
            return false;
        }
        return this.color[0] == r && this.color[1] == g && this.color[2] == b;
    }
    updateColor() {
        let color = 'rgba(0,0,0,1)';
        if (this.entity) {
            color = 'rgba(255,255,255,1)';
        } else if (this.egg) {
            color = 'rgba(0,0,255,1)';
        } else if (this.color) {
            const r = this.color[0];
            const g = this.color[1];
            const b = this.color[2];
            color = 'rgba(' + r + ',' + g + ',' + b + ',1)';
        }
        this.env.ctx.fillStyle = color;
        this.env.ctx.fillRect(this.x, this.y, 1, 1);
    }
}
