class Brain {
    constructor(neurons, layers) {
        this.neurons = neurons;
        this.layers = layers;
    }
    static random() {
        const neurons = new Float64Array(NEURONS);
        const layers = [];
        for (let i = 0; i < LAYERS; i++) {
            layers.push(Layer.random());
        }
        return new Brain(neurons, layers);
    }
    activate() {
        for (let i = 0; i < this.layers.length; i++) {
            this.layers[i].activate(this.neurons);
        }
    }
    withoutNeurons() {
        return new Brain(null, this.layers);
    }
    mutated() {
        const neurons = this.neurons;
        const layers = this.layers.map(x => x.mutated());
        if (Math.random() < CONFIG.mutationRates.swapLayers) {
            const a = Math.random() * layers.length | 0;
            const b = Math.random() * layers.length | 0;
            const temp = layers[a];
            layers[a] = layers[b];
            layers[b] = temp;
        }
        return new Brain(neurons, layers);
    }
    crossed(that) {
        const h = (LAYERS / 2) | 0;
        const layers = that.layers.slice(0, h).concat(this.layers.slice(h));
        return new Brain(new Float64Array(NEURONS), layers);
    }
    get(name) {
        const out = this.neurons;
        if (name == 'attack') {
            return out[INPUTS + 0];
        }
        if (name == 'divide') {
            return out[INPUTS + 1];
        }
        if (name == 'drop_green') {
            return out[INPUTS + 2];
        }
        if (name == 'drop_yellow') {
            return out[INPUTS + 3];
        }
        if (name == 'steer') {
            return out[INPUTS + 4];
        }
        if (name == 'move') {
            return out[INPUTS + 5];
        }
        if (name == 'signal1') {
            return out[INPUTS + 6];
        }
        if (name == 'signal2') {
            return out[INPUTS + 7];
        }
        if (name == 'cross1') {
            return out[INPUTS + 8];
        }
        if (name == 'cross2') {
            return out[INPUTS + 9];
        }
        if (name == 'infect') {
            return out[INPUTS + 10];
        }
    }
}

class Layer {
    constructor(inputs, outputs, weights) {
        this.inputs = inputs;
        this.outputs = outputs;
        this.weights = weights;
    }
    static random() {
        const s = LAYER_MAX - LAYER_MIN;
        let m = ((Math.random() * s) | 0) + LAYER_MIN;
        let n = ((Math.random() * s) | 0) + LAYER_MIN;
        if (m < n) {
            const t = m;
            m = n;
            n = t;
        }
        const inputs = new Array(m);
        const outputs = new Array(n);
        const weights = new Array(m * n);
        for (let i = 0; i < m; i++) {
            if (i == 0) {
                inputs[i] = 0;
            } else {
                while (true) {
                    const neuron = randomInput();
                    if (inputs.indexOf(neuron) == -1) {
                        inputs[i] = neuron;
                        break;
                    }
                }
            }
            for (let j = 0; j < n; j++) {
                weights[i * n + j] = randomWeight();
            }
        }
        for (let i = 0; i < n; i++) {
            while (true) {
                const neuron = randomOutput();
                if (outputs.indexOf(neuron) == -1) {
                    outputs[i] = neuron;
                    break;
                }
            }
        }
        return new Layer(inputs, outputs, weights);
    }
    mutated() {
        let inputs = this.inputs;
        let outputs = this.outputs;
        let weights = this.weights;
        if (Math.random() < CONFIG.mutationRates.changeInput) {
            inputs = inputs.slice(0);
            inputs[Math.random() * inputs.length | 0] = randomInput();
        }
        if (Math.random() < CONFIG.mutationRates.changeInput) {
            outputs = outputs.slice(0);
            outputs[Math.random() * outputs.length | 0] = randomOutput();
        }
        if (Math.random() < CONFIG.mutationRates.randomizeWeight) {
            weights = weights.slice(0);
            weights[(Math.random() * weights.length) | 0] = randomWeight();
        }
        if (Math.random() < CONFIG.mutationRates.adjustWeight) {
            weights = weights.slice(0);
            weights[(Math.random() * weights.length) | 0] += Math.random() * 2 - 1;
        }
        return new Layer(inputs, outputs, weights);
    }
    activate(neurons) {
        const fn = Math.tanh;
        const inputs = this.inputs;
        const outputs = this.outputs;
        const weights = this.weights;
        const values = new Array(this.outputs.length);
        for (let i = 0; i < outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < inputs.length; j++) {
                sum += weights[i * inputs.length + j] * neurons[inputs[j]];
            }
            values[i] = fn(sum);
        }
        for (let i = 0; i < outputs.length; i++) {
            neurons[outputs[i]] = values[i];
        }
    }
}

function randomInput() {
    return (Math.random() * NEURONS) | 0;
}

function randomOutput() {
    return (Math.random() * (NEURONS - INPUTS) + INPUTS) | 0;
}

function randomWeight() {
    const x = Math.random();
    return x * 20 - 10;
}
