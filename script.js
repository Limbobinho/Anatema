const APTIDOES = [
    "Agilidade",
    "Luta",
    "Gambiarra",
    "Culinária",
    "Postura",
    "Vigor",
    "Vontade",
    "Furtividade",
    "Robustez",
    "Social",
    "Percepção",
    "Pontaria",
    "Socorro",
    "Raciocínio"
];

const PIPS_POR_APTIDAO = 3;
const SLOTS_MOCHILA = 12;

const STORAGE_KEY = "anatema-ficha-v1";


const grid =
    document.getElementById("aptidoesGrid");

const aflicaoGrid =
    document.getElementById("aflicaoGrid");

const mochilaGrid =
    document.getElementById("mochilaGrid");


/* =========================================================
   CRIAÇÃO DAS APTIDÕES
   ========================================================= */

APTIDOES.forEach((nome) => {
    criarPips(nome, grid, true);
});

criarPips(
    "Aflição",
    aflicaoGrid,
    false
);


/* =========================================================
   CRIAÇÃO DA MOCHILA
   ========================================================= */

for (let i = 0; i < SLOTS_MOCHILA; i++) {

    const slot =
        document.createElement("div");

    slot.className =
        "mochila-slot";


    const input =
        document.createElement("input");

    input.type =
        "text";

    input.dataset.mochilaSlot =
        i;

    input.placeholder =
        `${i + 1}`;


    slot.appendChild(input);

    mochilaGrid.appendChild(slot);
}


/* =========================================================
   PIPS
   ========================================================= */

function criarPips(
    nome,
    container,
    mostrarNome = true
) {

    const row =
        document.createElement("div");

    row.className =
        "apt-row";


    if (mostrarNome) {

        const label =
            document.createElement("span");

        label.className =
            "apt-name";

        label.textContent =
            nome;

        row.appendChild(label);
    }


    const pipsWrap =
        document.createElement("div");

    pipsWrap.className =
        "apt-pips";

    pipsWrap.dataset.apt =
        nome;


    for (
        let i = 1;
        i <= PIPS_POR_APTIDAO;
        i++
    ) {

        const pip =
            document.createElement("button");

        pip.type =
            "button";

        pip.className =
            "pip";

        pip.dataset.value =
            i;

        pip.setAttribute(
            "aria-label",
            `${nome} nível ${i}`
        );


        pip.addEventListener(
            "click",
            () => {
                onPipClick(
                    nome,
                    i
                );
            }
        );


        pipsWrap.appendChild(pip);
    }


    row.appendChild(pipsWrap);

    container.appendChild(row);
}


function onPipClick(
    aptidao,
    valorClicado
) {

    const atual =
        state.aptidoes[aptidao] || 0;


    state.aptidoes[aptidao] =
        atual === valorClicado
            ? valorClicado - 1
            : valorClicado;


    renderPips();

    save();
}


function renderPips() {

    const todasAptidoes = [
        ...APTIDOES,
        "Aflição"
    ];


    todasAptidoes.forEach(
        (nome) => {

            const container =
                nome === "Aflição"
                    ? aflicaoGrid
                    : grid;


            const wrap =
                container.querySelector(
                    `.apt-pips[data-apt="${CSS.escape(nome)}"]`
                );


            if (!wrap) {
                return;
            }


            const valor =
                state.aptidoes[nome] || 0;


            wrap
                .querySelectorAll(".pip")
                .forEach(
                    (pip) => {

                        pip.classList.toggle(
                            "filled",
                            Number(
                                pip.dataset.value
                            ) <= valor
                        );

                    }
                );

        }
    );
}


/* =========================================================
   ESTADO
   ========================================================= */

function estadoVazio() {

    return {

        nome: "",

        jogador: "",

        vidaAtual: "",

        vidaMax: "",

        defesa: "",

        aptidoes: {},

        inventario: {

            maoEsq: "",

            maoDir: "",

            corpo: ""

        },

        mochila:
            Array(
                SLOTS_MOCHILA
            ).fill(""),

        vantagens: "",

        anotacoes: ""

    };
}


let state =
    estadoVazio();


/* =========================================================
   CAMPOS
   ========================================================= */

const campos = {

    nome:
        document.getElementById("nome"),

    jogador:
        document.getElementById("jogador"),

    vidaAtual:
        document.getElementById("vidaAtual"),

    vidaMax:
        document.getElementById("vidaMax"),

    defesa:
        document.getElementById("defesa"),

    vantagens:
        document.getElementById("vantagens"),

    anotacoes:
        document.getElementById("anotacoes")

};


const invInputs =
    document.querySelectorAll(
        "[data-inv]"
    );


const mochilaInputs =
    document.querySelectorAll(
        "[data-mochila-slot]"
    );


/* =========================================================
   PREENCHER FORMULÁRIO
   ========================================================= */

function preencherFormulario() {

    campos.nome.value =
        state.nome;

    campos.jogador.value =
        state.jogador;

    campos.vidaAtual.value =
        state.vidaAtual;

    campos.vidaMax.value =
        state.vidaMax;

    campos.defesa.value =
        state.defesa;

    campos.vantagens.value =
        state.vantagens;

    campos.anotacoes.value =
        state.anotacoes;


    invInputs.forEach(
        (el) => {

            el.value =
                state.inventario[
                el.dataset.inv
                ] || "";

        }
    );


    mochilaInputs.forEach(
        (el, index) => {

            el.value =
                state.mochila[index] || "";

        }
    );


    renderPips();
}


/* =========================================================
   LER FORMULÁRIO
   ========================================================= */

function lerFormularioParaState() {

    state.nome =
        campos.nome.value;

    state.jogador =
        campos.jogador.value;

    state.vidaAtual =
        campos.vidaAtual.value;

    state.vidaMax =
        campos.vidaMax.value;

    state.defesa =
        campos.defesa.value;

    state.vantagens =
        campos.vantagens.value;

    state.anotacoes =
        campos.anotacoes.value;


    invInputs.forEach(
        (el) => {

            state.inventario[
                el.dataset.inv
            ] = el.value;

        }
    );


    state.mochila =
        Array.from(
            mochilaInputs,
            (el) =>
                el.value
        );
}


/* =========================================================
   SALVAMENTO
   ========================================================= */

const statusEl =
    document.getElementById("status");

let saveTimeout;


function save() {

    lerFormularioParaState();


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
    );


    mostrarStatus(
        "salvo"
    );
}


function saveDebounced() {

    clearTimeout(
        saveTimeout
    );


    saveTimeout =
        setTimeout(
            save,
            300
        );
}


function mostrarStatus(msg) {

    statusEl.textContent =
        msg;


    clearTimeout(
        mostrarStatus._t
    );


    mostrarStatus._t =
        setTimeout(
            () => {

                statusEl.textContent =
                    "";

            },
            1500
        );
}


/* =========================================================
   NORMALIZAÇÃO
   ========================================================= */

function normalizarMochila(
    mochila
) {

    if (Array.isArray(mochila)) {

        return [
            ...mochila,

            ...Array(
                Math.max(
                    0,
                    SLOTS_MOCHILA -
                    mochila.length
                )
            ).fill("")

        ]
            .slice(
                0,
                SLOTS_MOCHILA
            );

    }


    if (
        typeof mochila ===
        "string"
    ) {

        const linhas =
            mochila
                .split("\n")
                .filter(Boolean);


        return [
            ...linhas,

            ...Array(
                Math.max(
                    0,
                    SLOTS_MOCHILA -
                    linhas.length
                )
            ).fill("")

        ]
            .slice(
                0,
                SLOTS_MOCHILA
            );

    }


    return Array(
        SLOTS_MOCHILA
    ).fill("");
}


function normalizarState(
    dados
) {

    const vazio =
        estadoVazio();


    state = {

        ...vazio,

        ...dados

    };


    state.aptidoes = {

        ...vazio.aptidoes,

        ...(dados.aptidoes || {})

    };


    state.inventario = {

        ...vazio.inventario,

        ...(dados.inventario || {})

    };


    state.mochila =
        normalizarMochila(
            dados.mochila
        );
}


/* =========================================================
   CARREGAMENTO
   ========================================================= */

function carregar() {

    const salvo =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (salvo) {

        try {

            const dados =
                JSON.parse(
                    salvo
                );


            normalizarState(
                dados
            );

        } catch (e) {

            state =
                estadoVazio();

        }

    }


    preencherFormulario();
}


/* =========================================================
   EVENTOS
   ========================================================= */

Object
    .values(campos)
    .forEach(
        (el) => {

            el.addEventListener(
                "input",
                saveDebounced
            );

        }
    );


invInputs.forEach(
    (el) => {

        el.addEventListener(
            "input",
            saveDebounced
        );

    }
);


mochilaInputs.forEach(
    (el) => {

        el.addEventListener(
            "input",
            saveDebounced
        );

    }
);


/* =========================================================
   NOVA FICHA
   ========================================================= */

document
    .getElementById("btnNovo")
    .addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Isso apaga a ficha atual (sem volta). Continuar?"
                )
            ) {

                return;

            }


            state =
                estadoVazio();


            preencherFormulario();

            save();

        }
    );


/* =========================================================
   EXPORTAR
   ========================================================= */

document
    .getElementById(
        "btnExportar"
    )
    .addEventListener(
        "click",
        () => {

            lerFormularioParaState();


            const blob =
                new Blob(
                    [
                        JSON.stringify(
                            state,
                            null,
                            2
                        )
                    ],
                    {
                        type:
                            "application/json"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const a =
                document.createElement(
                    "a"
                );


            a.href =
                url;


            const nomeArquivo =
                (
                    state.nome ||
                    "ficha"
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        "_"
                    )
                    .toLowerCase();


            a.download =
                `${nomeArquivo ||
                "ficha"
                }-anatema.json`;


            a.click();


            URL.revokeObjectURL(
                url
            );

        }
    );


/* =========================================================
   IMPORTAR
   ========================================================= */

document
    .getElementById(
        "inputImportar"
    )
    .addEventListener(
        "change",
        (e) => {

            const file =
                e.target.files[0];


            if (!file) {
                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                () => {

                    try {

                        const dados =
                            JSON.parse(
                                reader.result
                            );


                        normalizarState(
                            dados
                        );


                        preencherFormulario();

                        save();

                    } catch (err) {

                        alert(
                            "Esse arquivo não é uma ficha válida."
                        );

                    }

                };


            reader.readAsText(
                file
            );


            e.target.value =
                "";

        }
    );


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

carregar();