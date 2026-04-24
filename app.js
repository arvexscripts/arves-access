const ArvesAccess = (() => {
    
    const i18n = {
        en: {
            title: "Arves Access",
            subtitle: "Complete the checks to proceed",
            step: "Step",
            completed: "COMPLETED",
            verifying: "VERIFYING...",
            access: "ACCESS CONTENT",
            visiting: "Visit sponsor",
            waiting: "Waiting for security check",
            success: "Access granted. Redirecting..."
        },
        es: {
            title: "Arves Access",
            subtitle: "Completa las verificaciones para continuar",
            step: "Paso",
            completed: "COMPLETADO",
            verifying: "VERIFICANDO...",
            access: "ACCEDER CONTENIDO",
            visiting: "Visitar patrocinador",
            waiting: "Esperando verificación de seguridad",
            success: "Acceso concedido. Redirigiendo..."
        },
        pt: {
            title: "Arves Access",
            subtitle: "Conclua as verificações para prosseguir",
            step: "Passo",
            completed: "CONCLUÍDO",
            verifying: "VERIFICANDO...",
            access: "ACESSAR CONTEÚDO",
            visiting: "Visitar patrocinador",
            waiting: "Aguardando verificação de segurança",
            success: "Acesso autorizado. Redirecionando..."
        }
    };

    const CONFIG = [
        { id: 1, labelKey: "visiting", type: "link", url: "https://google.com", minTime: 6000 },
        { id: 2, labelKey: "waiting", type: "timer", minTime: 10000 }
    ];

    let currentLang = localStorage.getItem("lang") || "en";

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
            if (generateToken(check) !== tempState.token) throw "Integrity error";
            state = tempState;
        } catch (e) {
            localStorage.clear();
            location.reload();
        }
    };

    const runStep = (step) => {
        const currentSecret = state.challenge;
        const start = performance.now();
        if (step.type === "link") window.open(step.url, "_blank");

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
        const t = i18n[currentLang];
        const appContainer = document.getElementById("app");
        
        // Atualiza textos estáticos
        document.getElementById("txt-title").innerText = t.title;
        document.getElementById("txt-subtitle").innerText = t.subtitle;
        
        // Atualiza seletor visual
        document.querySelectorAll("#lang-selector button").forEach(btn => {
            btn.className = btn.getAttribute("data-lang") === currentLang ? "active" : "";
        });

        // Renderiza Steps
        const container = document.getElementById("steps-container");
        container.innerHTML = "";

        CONFIG.forEach((step, index) => {
            const isLocked = index > state.step;
            const isDone = state.completed.includes(step.id);
            const card = document.createElement("div");
            card.className = `step-card ${isLocked ? 'locked' : ''}`;
            
            const btn = document.createElement("button");
            btn.className = `step-btn ${isDone ? 'completed' : ''}`;
            btn.innerText = isDone ? t.completed : t[step.labelKey];
            btn.disabled = isLocked || isDone;

            if (!isLocked && !isDone) {
                btn.onclick = () => {
                    btn.innerText = t.verifying;
                    runStep(step);
                };
            }

            card.innerHTML = `<h3>${t.step} ${step.id}</h3>`;
            card.appendChild(btn);
            container.appendChild(card);
        });

        // Botão Final
        const finalBtn = document.getElementById("finalBtn");
        finalBtn.innerText = t.access;
        finalBtn.disabled = state.step < CONFIG.length;
        finalBtn.onclick = () => {
            if (!finalBtn.disabled) alert(t.success);
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
        },
        setLang: (lang) => {
            if (!i18n[lang]) return;
            currentLang = lang;
            localStorage.setItem("lang", lang);
            
            // Animação simples de transição
            const app = document.getElementById("app");
            app.style.opacity = "0.5";
            setTimeout(() => {
                render();
                app.style.opacity = "1";
            }, 150);
        }
    };
})();

ArvesAccess.init();

