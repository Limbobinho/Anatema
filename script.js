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

const STORAGE_KEY = "anatema-fichas-v3";
const OLD_STORAGE_KEY_V2 = "anatema-fichas-v2";
const OLD_STORAGE_KEY_V1 = "anatema-ficha-v1";


/* =========================================================
   ELEMENTOS
   ========================================================= */

const grid =
    document.getElementById("aptidoesGrid");

const aflicaoGrid =
    document.getElementById("aflicaoGrid");

const mochilaGrid =
    document.getElementById("mochilaGrid");

const sheetTabs =
    document.getElementById("sheetTabs");

const sheetBrowser =
    document.getElementById("sheetBrowser");

const sheet =
    document.getElementById("sheet");

const home =
    document.getElementById("home");

const statusEl =
    document.getElementById("status");


/* =========================================================
   ESTADO
   ========================================================= */

let fichas = [];

let fichaAtualId = null;

let state =
    estadoVazio();

let saveTimeout;


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


/* =========================================================
   ESTADO VAZIO
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


/* =========================================================
   ID
   ========================================================= */

function criarId() {

    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


/* =========================================================
   CRIAR FICHA
   ========================================================= */

function criarFicha(
    titulo = "Nova ficha"
) {

    return {

        id:
            criarId(),

        titulo:
            titulo ||
            "Nova ficha",

        dados:
            estadoVazio()

    };

}


/* =========================================================
   APTIDÕES
   ========================================================= */

APTIDOES.forEach(
    (nome) => {

        criarPips(
            nome,
            grid,
            true
        );

    }
);


criarPips(
    "Aflição",
    aflicaoGrid,
    false
);


function criarPips(
    nome,
    container,
    mostrarNome = true
) {

    const row =
        document.createElement(
            "div"
        );

    row.className =
        "apt-row";


    if (mostrarNome) {

        const label =
            document.createElement(
                "span"
            );

        label.className =
            "apt-name";

        label.textContent =
            nome;

        row.appendChild(
            label
        );

    }


    const pipsWrap =
        document.createElement(
            "div"
        );

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
            document.createElement(
                "button"
            );

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


        pipsWrap.appendChild(
            pip
        );

    }


    row.appendChild(
        pipsWrap
    );

    container.appendChild(
        row
    );

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


/* =========================================================
   RENDERIZAR PIPS
   ========================================================= */

function renderPips() {

    const todas = [
        ...APTIDOES,
        "Aflição"
    ];


    todas.forEach(
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
   MOCHILA
   ========================================================= */

for (
    let i = 0;
    i < SLOTS_MOCHILA;
    i++
) {

    const slot =
        document.createElement(
            "div"
        );

    slot.className =
        "mochila-slot";


    const input =
        document.createElement(
            "input"
        );

    input.type =
        "text";

    input.dataset.mochilaSlot =
        i;

    input.placeholder =
        `${i + 1}`;


    slot.appendChild(
        input
    );

    mochilaGrid.appendChild(
        slot
    );

}


const mochilaInputs =
    document.querySelectorAll(
        "[data-mochila-slot]"
    );


/* =========================================================
   NORMALIZAR MOCHILA
   ========================================================= */

function normalizarMochila(
    mochila
) {

    if (
        Array.isArray(
            mochila
        )
    ) {

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


/* =========================================================
   NORMALIZAR STATE
   ========================================================= */

function normalizarState(
    dados
) {

    const vazio =
        estadoVazio();

    const entrada =
        dados || {};


    state = {

        ...vazio,

        ...entrada

    };


    state.aptidoes = {

        ...vazio.aptidoes,

        ...(entrada.aptidoes || {})

    };


    state.inventario = {

        ...vazio.inventario,

        ...(entrada.inventario || {})

    };


    state.mochila =
        normalizarMochila(
            entrada.mochila
        );

}


/* =========================================================
   PREENCHER FORMULÁRIO
   ========================================================= */

function preencherFormulario() {

    campos.nome.value =
        state.nome || "";

    campos.jogador.value =
        state.jogador || "";

    campos.vidaAtual.value =
        state.vidaAtual ?? "";

    campos.vidaMax.value =
        state.vidaMax ?? "";

    campos.defesa.value =
        state.defesa ?? "";

    campos.vantagens.value =
        state.vantagens || "";

    campos.anotacoes.value =
        state.anotacoes || "";


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
            ] =
                el.value;

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
   VISIBILIDADE
   ========================================================= */

function mostrarHome() {

    home.style.display =
        "flex";

    sheet.style.display =
        "none";

    sheetBrowser.style.display =
        "none";

}


function mostrarFicha() {

    home.style.display =
        "none";

    sheet.style.display =
        "grid";

    sheetBrowser.style.display =
        "flex";

}


/* =========================================================
   SALVAMENTO
   ========================================================= */

function save() {

    lerFormularioParaState();


    const ficha =
        fichas.find(
            (item) =>
                item.id ===
                fichaAtualId
        );


    if (!ficha) {
        return;
    }


    ficha.dados =
        JSON.parse(
            JSON.stringify(state)
        );


    if (
        state.nome.trim()
    ) {

        ficha.titulo =
            state.nome.trim();

    }


    salvarSistema();

    renderTabs();

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


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function salvarSistema() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            fichas,
            fichaAtualId
        })
    );

}


/* =========================================================
   STATUS
   ========================================================= */

function mostrarStatus(
    mensagem
) {

    statusEl.textContent =
        mensagem;


    clearTimeout(
        mostrarStatus._timeout
    );


    mostrarStatus._timeout =
        setTimeout(
            () => {

                statusEl.textContent =
                    "";

            },
            1200
        );

}


/* =========================================================
   ABAS
   ========================================================= */

function renderTabs() {

    sheetTabs.innerHTML =
        "";


    fichas.forEach(
        (ficha) => {

            const tab =
                document.createElement(
                    "div"
                );

            tab.className =
                "sheet-tab";


            if (
                ficha.id ===
                fichaAtualId
            ) {

                tab.classList.add(
                    "active"
                );

            }


            const indicator =
                document.createElement(
                    "span"
                );

            indicator.className =
                "sheet-tab-indicator";


            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "sheet-tab-name";


            name.textContent =
                ficha.id === fichaAtualId
                    ? (
                        state.nome.trim() ||
                        ficha.titulo ||
                        "Nova ficha"
                    )
                    : (
                        ficha.dados?.nome?.trim() ||
                        ficha.titulo ||
                        "Nova ficha"
                    );


            const close =
                document.createElement(
                    "button"
                );

            close.type =
                "button";

            close.className =
                "sheet-tab-close";

            close.textContent =
                "×";


            close.setAttribute(
                "aria-label",
                `Fechar ${name.textContent}`
            );


            close.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    fecharFicha(
                        ficha.id
                    );

                }
            );


            tab.appendChild(
                indicator
            );

            tab.appendChild(
                name
            );

            tab.appendChild(
                close
            );


            tab.addEventListener(
                "click",
                () => {

                    trocarFicha(
                        ficha.id
                    );

                }
            );


            sheetTabs.appendChild(
                tab
            );

        }
    );

}


/* =========================================================
   TROCAR FICHA
   ========================================================= */

function trocarFicha(
    id
) {

    if (
        id ===
        fichaAtualId
    ) {

        return;

    }


    const atual =
        fichas.find(
            (ficha) =>
                ficha.id ===
                fichaAtualId
        );


    if (atual) {

        lerFormularioParaState();

        atual.dados =
            JSON.parse(
                JSON.stringify(state)
            );


        if (
            state.nome.trim()
        ) {

            atual.titulo =
                state.nome.trim();

        }

    }


    const nova =
        fichas.find(
            (ficha) =>
                ficha.id === id
        );


    if (!nova) {
        return;
    }


    fichaAtualId =
        nova.id;


    normalizarState(
        nova.dados
    );


    preencherFormulario();

    renderTabs();

    salvarSistema();

    mostrarFicha();

    mostrarStatus(
        "ficha carregada"
    );

}


/* =========================================================
   NOVA FICHA
   ========================================================= */

function novaFicha() {

    if (fichaAtualId) {

        const atual =
            fichas.find(
                (ficha) =>
                    ficha.id ===
                    fichaAtualId
            );


        if (atual) {

            lerFormularioParaState();

            atual.dados =
                JSON.parse(
                    JSON.stringify(state)
                );


            if (
                state.nome.trim()
            ) {

                atual.titulo =
                    state.nome.trim();

            }

        }

    }


    const nova =
        criarFicha(
            "Nova ficha"
        );


    fichas.push(
        nova
    );


    fichaAtualId =
        nova.id;


    normalizarState(
        nova.dados
    );


    preencherFormulario();

    salvarSistema();

    renderTabs();

    mostrarFicha();


    mostrarStatus(
        "nova ficha"
    );


    setTimeout(
        () => {

            campos.nome.focus();

        },
        50
    );

}


/* =========================================================
   FECHAR FICHA
   ========================================================= */

function fecharFicha(
    id
) {

    const ficha =
        fichas.find(
            (item) =>
                item.id === id
        );


    if (!ficha) {
        return;
    }


    if (
        id ===
        fichaAtualId
    ) {

        lerFormularioParaState();

        ficha.dados =
            JSON.parse(
                JSON.stringify(state)
            );


        if (
            state.nome.trim()
        ) {

            ficha.titulo =
                state.nome.trim();

        }

    }


    const nome =
        id === fichaAtualId
            ? (
                state.nome.trim() ||
                ficha.titulo ||
                "Nova ficha"
            )
            : (
                ficha.dados?.nome?.trim() ||
                ficha.titulo ||
                "Nova ficha"
            );


    const confirmar =
        confirm(
            `Fechar a ficha "${nome}"?\n\nEla será removida deste navegador.`
        );


    if (!confirmar) {
        return;
    }


    const eraAtual =
        id ===
        fichaAtualId;


    const indice =
        fichas.findIndex(
            (item) =>
                item.id === id
        );


    fichas =
        fichas.filter(
            (item) =>
                item.id !== id
        );


    /*
     * Se não restou nenhuma ficha,
     * volta para a página inicial.
     */

    if (
        fichas.length === 0
    ) {

        fichaAtualId =
            null;

        state =
            estadoVazio();

        salvarSistema();

        renderTabs();

        mostrarHome();

        return;

    }


    /*
     * Se fechou uma ficha que não era a atual,
     * apenas atualiza a lista.
     */

    if (!eraAtual) {

        salvarSistema();

        renderTabs();

        return;

    }


    /*
     * Escolhe a ficha mais próxima
     * da posição que foi fechada.
     */

    const novoIndice =
        Math.min(
            indice,
            fichas.length - 1
        );


    const nova =
        fichas[
        novoIndice
        ];


    fichaAtualId =
        nova.id;


    normalizarState(
        nova.dados
    );


    preencherFormulario();

    salvarSistema();

    renderTabs();

    mostrarFicha();

    mostrarStatus(
        "ficha fechada"
    );

}


/* =========================================================
   MIGRAÇÃO V2
   ========================================================= */

function migrarV2(
    dados
) {

    if (
        !dados ||
        !Array.isArray(
            dados.fichas
        ) ||
        !dados.fichas.length
    ) {

        return false;

    }


    fichas =
        dados.fichas.map(
            (ficha) => {

                const nova =
                    criarFicha(
                        ficha.titulo ||
                        ficha.dados?.nome ||
                        "Nova ficha"
                    );


                nova.id =
                    ficha.id ||
                    criarId();


                normalizarState(
                    ficha.dados
                );


                nova.dados =
                    JSON.parse(
                        JSON.stringify(state)
                    );


                return nova;

            }
        );


    fichaAtualId =
        dados.fichaAtualId;


    if (
        !fichas.some(
            (ficha) =>
                ficha.id ===
                fichaAtualId
        )
    ) {

        fichaAtualId =
            fichas[0].id;

    }


    return true;

}


/* =========================================================
   CARREGAR SISTEMA
   ========================================================= */

function carregarSistema() {

    /*
     * V3
     */

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


            if (
                Array.isArray(
                    dados.fichas
                )
            ) {

                fichas =
                    dados.fichas;


                fichaAtualId =
                    dados.fichaAtualId;


                /*
                 * V3 agora permite zero fichas.
                 */

                if (
                    fichas.length === 0
                ) {

                    fichaAtualId =
                        null;

                    state =
                        estadoVazio();

                    mostrarHome();

                    renderTabs();

                    return;

                }


                if (
                    !fichas.some(
                        (ficha) =>
                            ficha.id ===
                            fichaAtualId
                    )
                ) {

                    fichaAtualId =
                        fichas[0].id;

                }


                const atual =
                    fichas.find(
                        (ficha) =>
                            ficha.id ===
                            fichaAtualId
                    );


                normalizarState(
                    atual.dados
                );


                preencherFormulario();

                renderTabs();

                mostrarFicha();

                return;

            }

        } catch (erro) {

            console.error(
                "Erro ao carregar ANATEMA:",
                erro
            );

        }

    }


    /*
     * V2
     */

    const salvoV2 =
        localStorage.getItem(
            OLD_STORAGE_KEY_V2
        );


    if (salvoV2) {

        try {

            const dados =
                JSON.parse(
                    salvoV2
                );


            if (
                migrarV2(
                    dados
                )
            ) {

                const atual =
                    fichas.find(
                        (ficha) =>
                            ficha.id ===
                            fichaAtualId
                    );


                normalizarState(
                    atual.dados
                );


                preencherFormulario();

                salvarSistema();

                renderTabs();

                mostrarFicha();

                return;

            }

        } catch (erro) {

            console.error(
                "Erro ao migrar V2:",
                erro
            );

        }

    }


    /*
     * V1
     */

    const salvoV1 =
        localStorage.getItem(
            OLD_STORAGE_KEY_V1
        );


    if (salvoV1) {

        try {

            const dados =
                JSON.parse(
                    salvoV1
                );


            normalizarState(
                dados
            );


            const ficha =
                criarFicha(
                    dados.nome ||
                    "Ficha antiga"
                );


            ficha.dados =
                JSON.parse(
                    JSON.stringify(state)
                );


            fichas = [
                ficha
            ];


            fichaAtualId =
                ficha.id;


            preencherFormulario();

            salvarSistema();

            renderTabs();

            mostrarFicha();

            return;

        } catch (erro) {

            console.error(
                "Erro ao migrar V1:",
                erro
            );

        }

    }


    /*
     * PRIMEIRO ACESSO:
     * nenhuma ficha.
     */

    fichas = [];

    fichaAtualId =
        null;

    state =
        estadoVazio();

    salvarSistema();

    renderTabs();

    mostrarHome();

}


/* =========================================================
   EXPORTAR
   ========================================================= */

document
    .getElementById("btnExportar")
    .addEventListener(
        "click",
        () => {

            if (
                !fichaAtualId
            ) {

                return;

            }


            lerFormularioParaState();


            const ficha =
                fichas.find(
                    (item) =>
                        item.id ===
                        fichaAtualId
                );


            if (!ficha) {
                return;
            }


            ficha.dados =
                JSON.parse(
                    JSON.stringify(state)
                );


            if (
                state.nome.trim()
            ) {

                ficha.titulo =
                    state.nome.trim();

            }


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


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            const nomeArquivo =
                (
                    state.nome ||
                    ficha.titulo ||
                    "ficha"
                )
                    .trim()
                    .replace(
                        /\s+/g,
                        "_"
                    )
                    .toLowerCase();


            link.download =
                `${nomeArquivo ||
                "ficha"
                }-anatema.json`;


            link.click();


            URL.revokeObjectURL(
                url
            );


            salvarSistema();

            mostrarStatus(
                "exportado"
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
        (event) => {

            const file =
                event.target.files[0];


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


                        const nova =
                            criarFicha(
                                dados.nome ||
                                "Ficha importada"
                            );


                        nova.dados =
                            JSON.parse(
                                JSON.stringify(state)
                            );


                        fichas.push(
                            nova
                        );


                        fichaAtualId =
                            nova.id;


                        preencherFormulario();

                        salvarSistema();

                        renderTabs();

                        mostrarFicha();


                        mostrarStatus(
                            "importado"
                        );


                    } catch (erro) {

                        console.error(
                            erro
                        );


                        alert(
                            "Esse arquivo não é uma ficha válida."
                        );

                    }

                };


            reader.readAsText(
                file
            );


            event.target.value =
                "";

        }
    );


/* =========================================================
   NOVA FICHA
   ========================================================= */

document
    .getElementById("btnNovo")
    .addEventListener(
        "click",
        novaFicha
    );


document
    .getElementById("btnHomeNova")
    .addEventListener(
        "click",
        novaFicha
    );


/* =========================================================
   EVENTOS DOS CAMPOS
   ========================================================= */

Object
    .values(campos)
    .forEach(
        (elemento) => {

            elemento.addEventListener(
                "input",
                saveDebounced
            );

        }
    );


invInputs.forEach(
    (elemento) => {

        elemento.addEventListener(
            "input",
            saveDebounced
        );

    }
);


mochilaInputs.forEach(
    (elemento) => {

        elemento.addEventListener(
            "input",
            saveDebounced
        );

    }
);


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

carregarSistema();