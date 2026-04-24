const ArvesAccess = (() => {
    
    const CONFIG = [
        { id: 1, label: "Visitar patrocinador", type: "link", url: "https://google.com", minTime: 6000 },
        { id: 2, label: "Aguardar verificação de segurança", type: "timer", minTime: 10000 }
    ];

    let state = {
        step: 0,
        completed: [],
        fingerprint: null,
        token: null,
        challenge: null
    };

    const getFingerprint = () => btoa(navigator.userAgent.length + screen.width.toString());

    const generateToken = (data) => {
        const str = JSON.stringify(data) + state.fingerprint;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        return btoa(hash.toString());
    };

    const save = () => {
        const clone = { ...state };
        delete clone.token;
        state.token = generateToken(clone);
        localStorage.setItem("_arves_data", JSON.stringify(state));
    };

    const validate = () => {
        const stored = localStorage.getItem("_arves_data");
        if (!stored) return;
        
        try {
            const tempState = JSON.parse(stored);
            const check = { ...tempState };
            delete check.token;

            if (generateToken(check) !== tempState.token) {
                throw "Integrity error";
            }
            state = tempState;
        } catch (e) {
            localStorage.clear();
            location.reload();
        }
    };

    const runStep = (step) => {
        const currentSecret = state.challenge;
        const start = performance.now();

        if (step.type === "link") {
            window.open(step.url, "_blank");
        }

        setTimeout(() => {
            const elapsed = performance.now() - start;
            if (elapsed >= step.minTime && currentSecret === state.challenge) {
                finalizeStep(step.id);
            }
        }, step.minTime);
    };

    const finalizeStep = (id) => {
        if (id !== state.step + 1) return;
        
        state.completed.push(id);
        state.step = id;
        state.challenge = Math.random().toString(36).substring(7);
        save();
        render();
    };

    const render = () => {
        const container = document.getElementById("steps-container");
        container.innerHTML = "";

        CONFIG.forEach((step, index) => {
            const isLocked = index > state.step;
            const isDone = state.completed.includes(step.id);

            const card = document.createElement("div");
            card.className = `step-card ${isLocked ? 'locked' : ''}`;
            
            const btn = document.createElement("button");
            btn.className = `step-btn ${isDone ? 'completed' : ''}`;
            btn.innerText = isDone ? "CONCLUIDO" : step.label;
            btn.disabled = isLocked || isDone;

            if (!isLocked && !isDone) {
                btn.onclick = () => {
                    btn.innerText = "VERIFICANDO...";
                    runStep(step);
                };
            }

            card.innerHTML = `<h3>Passo ${step.id}</h3>`;
            card.appendChild(btn);
            container.appendChild(card);
        });

        const finalBtn = document.getElementById("finalBtn");
        finalBtn.disabled = state.step < CONFIG.length;
        finalBtn.onclick = () => {
            if (!finalBtn.disabled) {
                alert("Acesso autorizado. Redirecionando...");
            }
        };
    };

    return {
        init: () => {
            state.fingerprint = getFingerprint();
            state.challenge = Math.random().toString(36).substring(7);
            validate();
            render();
            
            setInterval(() => {
                const t = performance.now();
                debugger;
                if (performance.now() - t > 100) location.reload();
            }, 4000);
        }
    };
})();

ArvesAccess.init();

