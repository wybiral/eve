const INPUTS = 18;
const NEURONS = 50;
const LAYERS = 8;
const LAYER_MIN = 1;
const LAYER_MAX = 10;

function clamp(x, y) {
    return ((x % y) + y) % y;
}

const W = CONFIG.environment.width;
const H = CONFIG.environment.height;

const app = new App();

window.onload = () => {    
    const main = document.querySelector('main');
    const el = document.createElement('div');
    el.appendChild(app.env.el);
    main.appendChild(el);
    handlePanZoom(el, app.env.el);
    const points = [];
    for (let i = 0; i < CONFIG.environment.islands.count; i++) {
        points.push([Math.random() * W, Math.random() * H, Math.random() * 100 + 50]);
    }

    function minDistance(i, x, y) {
        let distance = W;
        for (let j = 0; j < points.length; j++) {
            if (i == j) {
                continue;
            }
            const dx = x - points[j][0];
            const dy = y - points[j][1];
            const d = Math.sqrt(dx * dx + dy * dy);
            distance = Math.min(distance, d);
        }
        return distance;
    }

    for (let i = 0; i < 1000; i++) {
        for (let j = 0; j < points.length; j++) {
            const p = points[j];
            const d1 = minDistance(j, p[0], p[1]);
            let x = p[0] + (Math.random() * 20 - 10);
            let y = p[1] + (Math.random() * 20 - 10);
            x = Math.min(W, Math.max(0, x));
            y = Math.min(H, Math.max(0, y));
            const d2 = minDistance(j, x, y);
            if (d2 > d1) {
                points[j] = [x, y, p[2]];
            }
        }
    }

    const maxProb = CONFIG.environment.redDensity;
    for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
            let prob = maxProb;
            points.forEach(p => {
                const dx = p[0] - x;
                const dy = p[1] - y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < p[2]) {
                    const f = Math.pow(d / p[2], 4);
                    prob = Math.min(prob, f * maxProb * 0.5);
                }
            });
            if (Math.random() < prob) {
                app.env.setColor(x | 0, y | 0, RED);
            } else if (Math.random() < CONFIG.environment.greenDensity) {
                app.env.setColor(x | 0, y | 0, GREEN);
            } else if (Math.random() < CONFIG.environment.yellowDensity) {
                app.env.setColor(x | 0, y | 0, YELLOW);
            }
        }
    }

    for (let i = 0; i < W; i++) {
        app.env.setColor(i, 0, [255, 0, 0]);
        app.env.setColor(i, H - 1, [255, 0, 0]);

    }
    for (let i = 0; i < H; i++) {
        app.env.setColor(0, i, [255, 0, 0]);
        app.env.setColor(W - 1, i, [255, 0, 0]);

    }

    let speed = 0;
    document.querySelector('#speed').onchange = evt => {
        speed = parseInt(document.querySelector('#speed').value);
    };

    function update() {
        app.step();
        setTimeout(update, speed);
    }
    update();
}

function handlePanZoom(main, canvas) {
    let x = (-canvas.width / 2);
    let y = (-canvas.height / 2);
    let z = 0.73;
    const dx = x + (window.innerWidth / 2) / z;
    const dy = y + (window.innerHeight / 2) / z;
    main.style.transform = 'scale(' + z + ') translate(' + dx + 'px, ' + dy + 'px)';
    let start = null;
    main.onmousedown = evt => {
        start = {x: evt.pageX, y: evt.pageY};
    };
    main.onmousemove = evt => {
        if (start === null) {
            return;
        }
        let dx = x + (evt.pageX - start.x) / z;
        let dy = y + (evt.pageY - start.y) / z;
        dx = dx + (window.innerWidth / 2) / z;
        dy = dy + (window.innerHeight / 2) / z;
        main.style.transform = 'scale(' + z + ') translate(' + dx + 'px, ' + dy + 'px)';
        main.style.cursor = 'grabbing';
    };
    function move(deltaX, deltaY) {
        x += deltaX / z;
        y += deltaY / z;
        const dx = x + (window.innerWidth / 2) / z;
        const dy = y + (window.innerHeight / 2) / z;
        return 'scale(' + z + ') translate(' + dx + 'px, ' + dy + 'px)';
    }
    main.onmouseup = evt => {
        const deltaX = evt.pageX - start.x;
        const deltaY = evt.pageY - start.y;
        main.style.transform = move(deltaX, deltaY);
        main.style.cursor = 'default';
        start = null;
    };
    function zoom(delta) {
        z *= (1.0 + delta * -0.001);
        z = Math.max(z, 0.00001);
        const dx = x + (window.innerWidth / 2) / z;
        const dy = y + (window.innerHeight / 2) / z;
        return 'scale(' + z + ') translate(' + dx + 'px, ' + dy + 'px)';
    }
    main.onwheel = evt => {
        evt.preventDefault();
        const delta = evt.deltaY;
        let sign = 0.1;
        if (delta > 0) {
            sign = -0.1;
        }
        //x += (((window.innerWidth / 2) - evt.pageX) / z) * sign;
        //y += (((window.innerHeight / 2) - evt.pageY) / z) * sign;
        main.style.transform = zoom(delta);
    };
    window.onkeydown = evt => {
        if (evt.key == '+') {
            main.style.transform = zoom(-100);
        } else if (evt.key == '-') {
            main.style.transform = zoom(100);
        } else if (evt.key == 'ArrowUp' || evt.key == 'w') {
            main.style.transform = move(0, 75);
        } else if (evt.key == 'ArrowRight' || evt.key == 'd') {
            main.style.transform = move(-75, 0);
        } else if (evt.key == 'ArrowDown' || evt.key == 's') {
            main.style.transform = move(0, -75);
        } else if (evt.key == 'ArrowLeft' || evt.key == 'a') {
            main.style.transform = move(75, 0);
        }
    };
}
