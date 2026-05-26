const state = {
    money: 100, xp: 0, lvl: 1, soil: 100, seed: 'soja',
    plots: Array(9).fill().map(() => ({ s: 'empty', t: null, p: 0, w: 100, b: false }))
};

const config = {
    soja: { i: '🌱', r: '🌿', c: 10, v: 45, x: 25, lvl: 1 },
    milho: { i: '🌱', r: '🌽', c: 80, v: 360, x: 90, lvl: 2 },
    algodao: { i: '🌿', r: '☁️', c: 300, v: 1450, x: 320, lvl: 3 },
    cafe: { i: '🌳', r: '☕', c: 1000, v: 5800, x: 1100, lvl: 4 },
    nelore: { i: '🐂', r: '🥩', c: 5000, v: 28000, x: 5500, lvl: 5 }
};

window.onload = () => {
    setTimeout(() => { document.getElementById('intro').classList.add('hide'); }, 3000);
    renderSeeds();
};

function renderSeeds() {
    const container = document.getElementById('seeds');
    Object.keys(config).forEach(key => {
        const item = config[key];
        container.innerHTML += `
            <div class="btn ${item.lvl > 1 ? 'locked' : ''} ${key === 'soja' ? 'active' : ''}" 
                 id="s-${key}" onclick="setSeed('${key}', this)">
                <span>${item.i}</span><b>${key}</b>
            </div>`;
    });
}

function setSeed(type, el) {
    if(el.classList.contains('locked')) return;
    state.seed = type;
    document.querySelectorAll('#seeds .btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

function handlePlot(i) {
    let pl = state.plots[i];
    if (pl.s === 'ready') {
        state.money += config[pl.t].v * (state.soil / 100);
        state.xp += config[pl.t].x;
        pl.s = 'empty';
        updateProgress();
        return;
    }
    if (pl.b) {
        if(state.money >= 20) { state.money -= 20; pl.b = false; state.soil -= 2; }
        return;
    }
    if (pl.s === 'growing' && pl.w < 70) { pl.w = 100; return; }
    if (pl.s === 'empty') {
        let s = state.seed;
        if (state.money >= config[s].c) {
            state.money -= config[s].c;
            pl.s = 'growing'; pl.t = s; pl.p = 0; pl.w = 100;
        }
    }
}

function recoverSoil() {
    if(state.money >= 50 && state.soil < 100) {
        state.money -= 50; state.soil = Math.min(100, state.soil + 15);
        alertMsg("SOLO REESTRUTURADO", "var(--primary)");
    }
}

function updateProgress() {
    let next = state.lvl * 280;
    if (state.xp >= next) {
        state.lvl++; state.xp = 0;
        alertMsg(`NÍVEL ${state.lvl} ALCANÇADO`, "var(--warning)");
        Object.keys(config).forEach(k => {
            if(config[k].lvl <= state.lvl) document.getElementById(`s-${k}`).classList.remove('locked');
        });
        if(state.lvl >= 3) document.getElementById('drone-btn').classList.remove('locked');
        if(state.lvl >= 4) document.getElementById('lab-btn').classList.remove('locked');
    }
}

function alertMsg(txt, color) {
    const el = document.getElementById('alert');
    el.innerText = txt; el.style.color = color; el.style.top = '30px';
    setTimeout(() => el.style.top = '-100px', 2500);
}

function loop() {
    state.plots.forEach(pl => {
        if (pl.s === 'growing') {
            if (pl.w > 0) { pl.w -= 0.4; pl.p += 0.5 * (state.soil / 100); }
            if (Math.random() < 0.003) pl.b = true;
            if (pl.p >= 100) pl.s = 'ready';
        }
    });
    draw();
}

function draw() {
    document.getElementById('m-val').innerText = `$${Math.floor(state.money)}`;
    document.getElementById('s-val').innerText = `${Math.floor(state.soil)}%`;
    document.getElementById('l-val').innerText = state.lvl;
    document.getElementById('rank').innerText = state.lvl > 4 ? "Mestre" : state.lvl > 2 ? "Experiente" : "Iniciante";

    const grid = document.getElementById('grid');
    if(grid.children.length === 0) {
        state.plots.forEach((_, i) => {
            const d = document.createElement('div'); d.className = 'plot';
            d.onclick = () => handlePlot(i);
            grid.appendChild(d);
        });
    }

    Array.from(grid.children).forEach((div, i) => {
        let p = state.plots[i];
        div.className = `plot ${p.s === 'ready' ? 'ready' : ''}`;
        let h = '';
        if(p.s !== 'empty') {
            h = `<span style="font-size:3.5rem">${p.s === 'ready' ? config[p.t].r : config[p.t].i}</span>`;
            if(p.b) h += `<span style="position:absolute; top:10px; right:10px; font-size:1.5rem">🐛</span>`;
            h += `<div class="progress-container">
                <div class="bar"><div class="fill" style="width:${p.p}%; background:var(--primary)"></div></div>
                <div class="bar"><div class="fill" style="width:${p.w}%; background:var(--accent)"></div></div>
            </div>`;
        } else h = '<span style="opacity:0.05; font-size:2.5rem">+</span>';
        div.innerHTML = h;
    });
}

// Inicializa o loop do jogo
setInterval(loop, 100);