const i18n = {
    pt: {
        title: "Complete as etapas",
        step1: "Inscreva-se no canal",
        step2: "Dê like no vídeo",
        step3: "Entre no Discord",
        start: "Iniciar",
        done: "Concluído",
        wait: "Aguarde",
        access: "Acessar conteúdo",
        status: "Etapa {x} de 3"
    },
    en: {
        title: "Complete the steps",
        step1: "Subscribe to channel",
        step2: "Like the video",
        step3: "Join Discord",
        start: "Start",
        done: "Completed",
        wait: "Wait",
        access: "Access content",
        status: "Step {x} of 3"
    },
    es: {
        title: "Completa los pasos",
        step1: "Suscríbete al canal",
        step2: "Dale like al video",
        step3: "Únete al Discord",
        start: "Iniciar",
        done: "Completado",
        wait: "Espera",
        access: "Acceder contenido",
        status: "Paso {x} de 3"
    }
};

let current = 0;
let lang = localStorage.getItem("lang") || "pt";

function setLang(l) {
    lang = l;
    localStorage.setItem("lang", l);
    render();
}

function render() {
    const t = i18n[lang];

    document.getElementById("title").innerText = t.title;
    document.getElementById("step1").innerText = t.step1;
    document.getElementById("step2").innerText = t.step2;
    document.getElementById("step3").innerText = t.step3;

    document.getElementById("btn0").innerText = t.start;
    document.getElementById("btn1").innerText = t.start;
    document.getElementById("btn2").innerText = t.start;

    document.getElementById("unlock").innerText = t.access;

    updateStatus();

    document.querySelectorAll(".btn").forEach(btn => {
        btn.classList.remove("done");
        btn.classList.add("blocked");
    });

    document.getElementById("btn0").classList.remove("blocked");
    document.getElementById("unlock").style.display = "none";

    document.querySelectorAll("#lang-selector button").forEach(b => {
        b.classList.remove("active");
    });
    document.getElementById("btn-" + lang).classList.add("active");
}

function updateStatus() {
    const t = i18n[lang];
    let step = current >= 3 ? 3 : current + 1;
    document.getElementById("status").innerText =
        t.status.replace("{x}", step);
}

function start(i, url) {
    if (i !== current) return;

    window.open(url, "_blank");

    let time = 5;
    const btn = document.getElementById("btn" + i);
    const t = i18n[lang];

    btn.innerText = t.wait + " " + time;

    const interval = setInterval(() => {
        time--;
        btn.innerText = t.wait + " " + time;

        if (time <= 0) {
            clearInterval(interval);

            btn.innerText = t.done;
            btn.classList.add("done");

            current++;

            if (document.getElementById("btn" + current)) {
                document.getElementById("btn" + current).classList.remove("blocked");
            }

            updateStatus();

            if (current === 3) {
                document.getElementById("unlock").style.display = "block";
            }
        }
    }, 1000);
}

render();
