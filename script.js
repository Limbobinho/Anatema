/* =========================================================
   ANÁTEMA — SISTEMA DE FICHAS
   ========================================================= */

const STORAGE_KEY = "anatema-fichas-v3";

const ATRIBUTOS = [
    "Físico",
    "Mente",
    "Alma"
];

const APTIDOES_POR_ATRIBUTO = {
    "Físico": [
        "Agilidade",
        "Força",
        "Postura",
        "Vigor",
        "Furtividade"
    ],
    "Mente": [
        "Raciocínio",
        "Medicina",
        "Percepção",
        "Social",
        "Ofício"
    ],
    "Alma": [
        "Vontade",
        "Ocultismo",
        "Sintonia"
    ]
};

const APTIDOES = ATRIBUTOS.flatMap(
    (atributo) => APTIDOES_POR_ATRIBUTO[atributo]
);

const ATRIBUTO_DA_APTIDAO = {};

for (const atributo of ATRIBUTOS) {

    for (const aptidao of APTIDOES_POR_ATRIBUTO[atributo]) {
        ATRIBUTO_DA_APTIDAO[aptidao] = atributo;
    }

}

const PIPS_POR_APTIDAO = 3;

const ATRIBUTO_MAX = 3;
const PONTOS_POR_ATRIBUTO = 3;


/* =========================================================
   ELEMENTOS
   ========================================================= */

const homeScreen = document.getElementById("homeScreen");
const characterSheet = document.getElementById("characterSheet");

const sheetTabs = document.getElementById("sheetTabs");
const btnNovaFicha = document.getElementById("btnNovaFicha");
const btnHomeNovaFicha = document.getElementById("btnHomeNovaFicha");

const btnExportar = document.getElementById("btnExportar");

const inputImportar = document.getElementById("inputImportar");
const inputImportarHome = document.getElementById("inputImportarHome");

const statusElement = document.getElementById("status");

const nomeInput = document.getElementById("nome");
const jogadorInput = document.getElementById("jogador");

const racaInput = document.getElementById("raca");
const especializacaoInput = document.getElementById("especializacao");
const estiloCombateInput = document.getElementById("estiloCombate");

const vidaAtualInput = document.getElementById("vidaAtual");
const vidaMaxInput = document.getElementById("vidaMax");
const espiritoAtualInput = document.getElementById("espiritoAtual");
const espiritoMaxInput = document.getElementById("espiritoMax");
const defesaValorEl = document.getElementById("defesaValor");

const anotacoesGrid = document.getElementById("anotacoesGrid");
const btnAdicionarAnotacao = document.getElementById("btnAdicionarAnotacao");

const btnAbrirAnotacoes = document.getElementById("btnAbrirAnotacoes");
const anotacoesModalOverlay = document.getElementById("anotacoesModalOverlay");
const btnFecharAnotacoes = document.getElementById("btnFecharAnotacoes");
const anotacoesPreviewEl = document.getElementById("anotacoesPreview");

const dicePopupOverlay = document.getElementById("dicePopupOverlay");
const dicePopup = document.getElementById("dicePopup");
const dicePopupFormula = document.getElementById("dicePopupFormula");
const dicePopupResultado = document.getElementById("dicePopupResultado");
const btnFecharDicePopup = document.getElementById("btnFecharDicePopup");

const aflicaoGrid = document.getElementById("aflicaoGrid");
const aptidoesGrid = document.getElementById("aptidoesGrid");

const mochilaGrid = document.getElementById("mochilaGrid");
const btnAdicionarSlot = document.getElementById("btnAdicionarSlot");
const pesoTotal = document.getElementById("pesoTotal");

const habilidadesGrid = document.getElementById("habilidadesGrid");
const btnAdicionarHabilidade = document.getElementById("btnAdicionarHabilidade");

const tracosGrid = document.getElementById("tracosGrid");
const btnAdicionarTraco = document.getElementById("btnAdicionarTraco");
const btnTracosPositivos = document.getElementById("btnTracosPositivos");
const btnTracosNegativos = document.getElementById("btnTracosNegativos");

let tracosAbaAtual = "positivos";

const inventarioInputs = document.querySelectorAll("[data-inv]");

const fotoPerfilImg = document.getElementById("fotoPerfilImg");
const fotoPerfilPlaceholder = document.getElementById("fotoPerfilPlaceholder");
const inputFotoPerfil = document.getElementById("inputFotoPerfil");
const btnRemoverFoto = document.getElementById("btnRemoverFoto");

const combateArmaNomeEl = document.getElementById("combateArmaNome");
const combateArmaInfoEl = document.getElementById("combateArmaInfo");
const combateDanoValorEl = document.getElementById("combateDanoValor");
const combateTipoValorEl = document.getElementById("combateTipoValor");
const combateMunicaoValorEl = document.getElementById("combateMunicaoValor");

const defesaBoxEl = document.getElementById("defesaBox");


/* =========================================================
   ESTADO
   ========================================================= */

let fichas = [];
let fichaAtualId = null;


/* =========================================================
   UTILITÁRIOS
   ========================================================= */

function criarId() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 9)
    );
}


function criarAptidoesVazias() {
    const aptidoes = {};

    for (const aptidao of APTIDOES) {
        aptidoes[aptidao] = 0;
    }

    aptidoes["Aflição"] = 0;

    return aptidoes;
}


function criarAtributosVazios() {
    const atributos = {};

    for (const atributo of ATRIBUTOS) {
        atributos[atributo] = 0;
    }

    return atributos;
}


function criarMochilaInicial() {
    return [
        criarItemMochilaVazio(),
        criarItemMochilaVazio(),
        criarItemMochilaVazio()
    ];
}


function criarItemMochilaVazio() {
    return {
        nome: "",
        descricao: "",
        peso: 0,

        equipado: "",
        emUso: false,

        /*
         * Estatísticas de combate: pertencem ao item,
         * não ao personagem. Assim, cada arma/armadura
         * guarda os próprios valores mesmo quando
         * deixa de estar equipada.
         */
        dano: "",
        tipo: "corpo-a-corpo",
        municao: "",
        valorArmadura: ""
    };
}


function criarAnotacaoVazia() {
    return {
        titulo: "",
        texto: ""
    };
}


function criarAnotacoesIniciais() {
    return [
        criarAnotacaoVazia()
    ];
}


function criarHabilidadesIniciais() {
    return [
        {
            nome: "",
            descricao: ""
        }
    ];
}


function criarTracosIniciais() {
    return {
        positivos: [
            {
                nome: "",
                descricao: ""
            }
        ],
        negativos: [
            {
                nome: "",
                descricao: ""
            }
        ]
    };
}


function criarEstadoVazio() {
    return {
        nome: "",
        jogador: "",

        raca: "",
        especializacao: "",
        estiloCombate: "",

        fotoPerfil: "",

        vidaAtual: "",
        vidaMax: "",

        espiritoAtual: "",
        espiritoMax: "",

        atributos: criarAtributosVazios(),

        aptidoes: criarAptidoesVazias(),

        inventario: {
            maoEsq: "",
            maoDir: "",
            corpo: ""
        },

        mochila: criarMochilaInicial(),

        habilidades: criarHabilidadesIniciais(),

        tracos: criarTracosIniciais(),

        anotacoes: criarAnotacoesIniciais()
    };
}


/* =========================================================
   NORMALIZAÇÃO DE ESTADO
   ========================================================= */

function normalizarEstado(dados = {}) {

    const estado = criarEstadoVazio();

    estado.nome =
        typeof dados.nome === "string"
            ? dados.nome
            : "";

    estado.jogador =
        typeof dados.jogador === "string"
            ? dados.jogador
            : "";

    estado.raca =
        typeof dados.raca === "string"
            ? dados.raca
            : "";

    estado.especializacao =
        typeof dados.especializacao === "string"
            ? dados.especializacao
            : "";

    estado.estiloCombate =
        typeof dados.estiloCombate === "string"
            ? dados.estiloCombate
            : "";

    estado.vidaAtual =
        dados.vidaAtual ?? "";

    estado.vidaMax =
        dados.vidaMax ?? "";

    estado.espiritoAtual =
        dados.espiritoAtual ?? "";

    estado.espiritoMax =
        dados.espiritoMax ?? "";


    const atributosEraAusente =
        !(
            dados.atributos &&
            typeof dados.atributos === "object"
        );


    if (
        dados.atributos &&
        typeof dados.atributos === "object"
    ) {

        for (const atributo of ATRIBUTOS) {

            if (
                Object.prototype.hasOwnProperty.call(
                    dados.atributos,
                    atributo
                )
            ) {

                estado.atributos[atributo] =
                    normalizarAtributo(
                        dados.atributos[atributo]
                    );

            }

        }

    }


    if (
        dados.aptidoes &&
        typeof dados.aptidoes === "object"
    ) {

        for (const aptidao of APTIDOOES_SEGURAS()) {

            if (
                Object.prototype.hasOwnProperty.call(
                    dados.aptidoes,
                    aptidao
                )
            ) {

                estado.aptidoes[aptidao] =
                    normalizarPip(
                        dados.aptidoes[aptidao]
                    );

            }

        }

    }


    /*
     * Compatibilidade com fichas de antes dos Atributos:
     * em vez de zerar as aptidões já preenchidas, calculamos
     * um valor de atributo que comporte o que já foi investido.
     */

    if (atributosEraAusente) {

        for (const atributo of ATRIBUTOS) {

            const somaExistente =
                APTIDOES_POR_ATRIBUTO[atributo].reduce(
                    (total, aptidao) =>
                        total + (estado.aptidoes[aptidao] || 0),
                    0
                );

            estado.atributos[atributo] =
                normalizarAtributo(
                    Math.ceil(somaExistente / PONTOS_POR_ATRIBUTO)
                );

        }

    }


    /*
     * Garante que nenhuma aptidão fique acima do
     * orçamento de pontos do respectivo atributo.
     */

    for (const atributo of ATRIBUTOS) {
        ajustarAptidoesParaOrcamento(estado, atributo);
    }


    /*
     * Compatibilidade com versões antigas
     * que eventualmente salvaram Aflição separadamente.
     */

    if (
        estado.aptidoes["Aflição"] === 0 &&
        typeof dados.aflicao === "number"
    ) {

        estado.aptidoes["Aflição"] =
            normalizarPip(dados.aflicao);

    }


    if (
        dados.inventario &&
        typeof dados.inventario === "object"
    ) {

        estado.inventario.maoEsq =
            dados.inventario.maoEsq ?? "";

        estado.inventario.maoDir =
            dados.inventario.maoDir ?? "";

        estado.inventario.corpo =
            dados.inventario.corpo ?? "";

    }


    estado.mochila =
        normalizarMochila(dados.mochila);


    estado.fotoPerfil =
        typeof dados.fotoPerfil === "string"
            ? dados.fotoPerfil
            : "";


    /*
     * Migração de formatos antigos de combate.
     *
     * v3/v4 chegou a guardar dano/tipo/munição/valor num objeto
     * único "combate" no personagem. Agora essas informações
     * pertencem ao próprio item da mochila (arma ou armadura),
     * então migramos os valores para o item equipado — criando
     * um item novo se a ficha antiga não tinha nenhum.
     */

    if (
        dados.combate &&
        typeof dados.combate === "object"
    ) {

        const c = dados.combate;

        const armaAntiga = {
            nome: typeof c.armaNome === "string" ? c.armaNome : "",
            dano: typeof c.armaDano === "string" ? c.armaDano : "",
            tipo: c.armaTipo === "distancia" ? "distancia" : "corpo-a-corpo",
            municao: ""
        };

        const armaduraAntiga = {
            nome: "",
            valor: c.armaduraBase ?? ""
        };

        const arma =
            c.arma && typeof c.arma === "object"
                ? c.arma
                : armaAntiga;

        const armadura =
            c.armadura && typeof c.armadura === "object"
                ? c.armadura
                : armaduraAntiga;

        const armaNomeLegado =
            typeof arma.nome === "string" ? arma.nome : "";

        const armaduraNomeLegado =
            typeof armadura.nome === "string" ? armadura.nome : "";


        let armaItem =
            estado.mochila.find(item => item.equipado === "arma");

        if (!armaItem && armaNomeLegado.trim()) {

            armaItem = criarItemMochilaVazio();
            armaItem.nome = armaNomeLegado;
            armaItem.equipado = "arma";

            estado.mochila.push(armaItem);
        }

        if (armaItem) {

            armaItem.dano =
                typeof arma.dano === "string" ? arma.dano : "";

            armaItem.tipo =
                arma.tipo === "distancia" ? "distancia" : "corpo-a-corpo";

            armaItem.municao =
                typeof arma.municao === "string" ? arma.municao : "";

        }


        let armaduraItem =
            estado.mochila.find(item => item.equipado === "armadura");

        if (!armaduraItem && armaduraNomeLegado.trim()) {

            armaduraItem = criarItemMochilaVazio();
            armaduraItem.nome = armaduraNomeLegado;
            armaduraItem.equipado = "armadura";

            estado.mochila.push(armaduraItem);
        }

        if (armaduraItem) {

            armaduraItem.valorArmadura =
                armadura.valor ?? "";

        }

    }


    /*
     * Compatibilidade: versões antigas guardavam
     * Habilidades como um único texto livre.
     */

    if (typeof dados.habilidades === "string") {

        estado.habilidades =
            dados.habilidades.trim()
                ? [{ nome: "", descricao: dados.habilidades }]
                : criarHabilidadesIniciais();

    } else {

        estado.habilidades =
            normalizarHabilidades(dados.habilidades);

    }


    estado.tracos =
        normalizarTracos(dados.tracos);


    /*
     * Compatibilidade: versões antigas guardavam
     * Anotações como um único texto livre.
     */

    if (typeof dados.anotacoes === "string") {

        estado.anotacoes =
            dados.anotacoes.trim()
                ? [{ titulo: "", texto: dados.anotacoes }]
                : criarAnotacoesIniciais();

    } else {

        estado.anotacoes =
            normalizarAnotacoes(dados.anotacoes);

    }


    return estado;
}


function normalizarAnotacoes(anotacoes) {

    if (!Array.isArray(anotacoes)) {
        return criarAnotacoesIniciais();
    }

    const resultado = anotacoes.map((item) => {

        if (item && typeof item === "object") {

            return {
                titulo:
                    typeof item.titulo === "string"
                        ? item.titulo
                        : "",

                texto:
                    typeof item.texto === "string"
                        ? item.texto
                        : ""
            };

        }

        return {
            titulo: "",
            texto: typeof item === "string" ? item : ""
        };

    });

    if (resultado.length === 0) {
        return criarAnotacoesIniciais();
    }

    return resultado;
}


function normalizarHabilidades(habilidades) {

    if (!Array.isArray(habilidades)) {
        return criarHabilidadesIniciais();
    }

    const resultado = habilidades.map((item) => {

        if (item && typeof item === "object") {

            return {
                nome:
                    typeof item.nome === "string"
                        ? item.nome
                        : "",

                descricao:
                    typeof item.descricao === "string"
                        ? item.descricao
                        : ""
            };

        }

        return {
            nome: typeof item === "string" ? item : "",
            descricao: ""
        };

    });

    if (resultado.length === 0) {
        return criarHabilidadesIniciais();
    }

    return resultado;
}


function normalizarTracos(tracos) {

    if (!tracos || typeof tracos !== "object") {
        return criarTracosIniciais();
    }

    return {
        positivos: normalizarHabilidades(tracos.positivos),
        negativos: normalizarHabilidades(tracos.negativos)
    };
}


function APTIDOOES_SEGURAS() {
    return [
        ...APTIDOES,
        "Aflição"
    ];
}


function normalizarPip(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            PIPS_POR_APTIDAO,
            Math.round(numero)
        )
    );
}


function normalizarAtributo(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(
            ATRIBUTO_MAX,
            Math.round(numero)
        )
    );
}


function normalizarPeso(valor) {

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return 0;
    }

    return Math.max(
        0,
        Math.min(3, Math.round(numero))
    );
}


/* =========================================================
   NORMALIZAÇÃO DA MOCHILA
   ========================================================= */

function normalizarEquipado(valor) {

    return (
        valor === "arma" ||
        valor === "armadura"
    )
        ? valor
        : "";
}


function normalizarMochila(mochila) {

    /*
     * Versão antiga:
     *
     * [
     *   "espada",
     *   "poção"
     * ]
     *
     * Versão nova:
     *
     * [
     *   {
     *     nome: "espada",
     *     descricao: "...",
     *     peso: 0,
     *     equipado: "arma" | "armadura" | "",
     *     dano: "...", tipo: "...", municao: "...",
     *     valorArmadura: 0
     *   }
     * ]
     */

    if (!Array.isArray(mochila)) {
        return criarMochilaInicial();
    }


    const resultado = mochila.map((item) => {

        if (
            item &&
            typeof item === "object"
        ) {

            return {
                nome:
                    typeof item.nome === "string"
                        ? item.nome
                        : "",

                descricao:
                    typeof item.descricao === "string"
                        ? item.descricao
                        : "",

                peso: normalizarPeso(item.peso),

                equipado: normalizarEquipado(item.equipado),

                emUso: Boolean(item.emUso),

                dano:
                    typeof item.dano === "string"
                        ? item.dano
                        : "",

                tipo:
                    item.tipo === "distancia"
                        ? "distancia"
                        : "corpo-a-corpo",

                municao:
                    typeof item.municao === "string"
                        ? item.municao
                        : "",

                valorArmadura:
                    item.valorArmadura ?? ""
            };

        }


        const vazio = criarItemMochilaVazio();

        vazio.nome =
            typeof item === "string"
                ? item
                : "";

        return vazio;

    });


    /*
     * Se uma versão antiga possuir menos de 3
     * espaços, completamos para o mínimo atual.
     */

    while (resultado.length < 3) {

        resultado.push(criarItemMochilaVazio());

    }


    /*
     * Um item sem categoria (comum) não pode
     * estar "em uso".
     */

    for (const item of resultado) {

        if (!item.equipado) {
            item.emUso = false;
        }

    }


    /*
     * Só um item pode estar "em uso" como arma,
     * e só um pode estar "em uso" como armadura.
     * (Vários itens podem ter a mesma categoria —
     * só não podem estar todos em uso ao mesmo tempo.)
     */

    let armaEmUso = false;
    let armaduraEmUso = false;

    for (const item of resultado) {

        if (item.equipado === "arma" && item.emUso) {

            if (armaEmUso) {
                item.emUso = false;
            } else {
                armaEmUso = true;
            }

        } else if (item.equipado === "armadura" && item.emUso) {

            if (armaduraEmUso) {
                item.emUso = false;
            } else {
                armaduraEmUso = true;
            }

        }

    }


    return resultado;
}


/* =========================================================
   CRIAÇÃO DE FICHA
   ========================================================= */

function criarFicha(dados = null) {

    const ficha = {
        id: criarId(),

        titulo: "Nova ficha",

        dados:
            dados
                ? normalizarEstado(dados)
                : criarEstadoVazio()
    };


    atualizarTituloFicha(ficha);


    fichas.push(ficha);

    fichaAtualId = ficha.id;

    salvarFichas();

    renderizarAbas();

    carregarFichaAtual();

    mostrarFicha();

    mostrarStatus("Nova ficha criada.");

    return ficha;
}


/* =========================================================
   TÍTULO DA ABA
   ========================================================= */

function atualizarTituloFicha(ficha) {

    const nome =
        ficha?.dados?.nome?.trim();

    ficha.titulo =
        nome || "Nova ficha";
}


/* =========================================================
   FICHA ATUAL
   ========================================================= */

function obterFichaAtual() {

    return fichas.find(
        ficha => ficha.id === fichaAtualId
    ) || null;
}


function trocarFicha(id) {

    const ficha = fichas.find(
        item => item.id === id
    );

    if (!ficha) {
        return;
    }

    salvarEstadoDaInterface();

    fichaAtualId = id;

    carregarFichaAtual();

    renderizarAbas();

    mostrarFicha();

    salvarFichas();
}


/* =========================================================
   FECHAR / EXCLUIR FICHA
   ========================================================= */

function fecharFicha(id, evento) {

    const indice =
        fichas.findIndex(
            ficha => ficha.id === id
        );

    if (indice === -1) {
        return;
    }


    const ficha = fichas[indice];

    const exclusaoForcada =
        evento.shiftKey &&
        evento.button === 0;


    /*
     * Shift + clique esquerdo:
     * exclui imediatamente.
     */

    if (!exclusaoForcada) {

        const nome =
            ficha.dados.nome.trim() ||
            "Nova ficha";

        const confirmar =
            window.confirm(
                `Excluir a ficha "${nome}"?\n\n` +
                `Esta ação não pode ser desfeita.`
            );

        if (!confirmar) {
            return;
        }

    }


    const eraAtual =
        ficha.id === fichaAtualId;


    fichas.splice(indice, 1);


    if (fichas.length === 0) {

        fichaAtualId = null;

        salvarFichas();

        renderizarAbas();

        mostrarHome();

        mostrarStatus("Todas as fichas foram fechadas.");

        return;
    }


    if (eraAtual) {

        const novaFicha =
            fichas[
            Math.min(
                indice,
                fichas.length - 1
            )
            ];

        fichaAtualId = novaFicha.id;

        carregarFichaAtual();

    }


    salvarFichas();

    renderizarAbas();

    mostrarFicha();

    mostrarStatus(
        exclusaoForcada
            ? "Ficha excluída."
            : "Ficha fechada."
    );
}


/* =========================================================
   ABAS
   ========================================================= */

function renderizarAbas() {

    sheetTabs.innerHTML = "";


    for (const ficha of fichas) {

        atualizarTituloFicha(ficha);


        const tab =
            document.createElement("div");

        tab.className =
            "sheet-tab" +
            (
                ficha.id === fichaAtualId
                    ? " active"
                    : ""
            );

        tab.dataset.id = ficha.id;


        const titulo =
            document.createElement("span");

        titulo.className =
            "sheet-tab-title";

        titulo.textContent =
            ficha.titulo;


        const close =
            document.createElement("button");

        close.type = "button";

        close.className =
            "sheet-tab-close";

        close.textContent = "×";

        close.title =
            "Fechar ficha. Shift + clique exclui sem confirmação.";

        close.setAttribute(
            "aria-label",
            `Fechar ${ficha.titulo}`
        );


        close.addEventListener(
            "click",
            (evento) => {

                evento.stopPropagation();

                fecharFicha(
                    ficha.id,
                    evento
                );

            }
        );


        tab.appendChild(titulo);

        tab.appendChild(close);


        tab.addEventListener(
            "click",
            () => {
                trocarFicha(ficha.id);
            }
        );


        sheetTabs.appendChild(tab);
    }
}


/* =========================================================
   VISIBILIDADE
   ========================================================= */

function mostrarHome() {

    homeScreen.hidden = false;

    characterSheet.hidden = true;

    document.body.classList.add(
        "home-active"
    );
}


function mostrarFicha() {

    if (!obterFichaAtual()) {
        mostrarHome();
        return;
    }

    homeScreen.hidden = true;

    characterSheet.hidden = false;

    document.body.classList.remove(
        "home-active"
    );
}


/* =========================================================
   CARREGAR FICHA NA INTERFACE
   ========================================================= */

function carregarFichaAtual() {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        mostrarHome();
        return;
    }


    const dados =
        normalizarEstado(
            ficha.dados
        );

    ficha.dados = dados;


    nomeInput.value =
        dados.nome;

    jogadorInput.value =
        dados.jogador;

    racaInput.value =
        dados.raca;

    especializacaoInput.value =
        dados.especializacao;

    estiloCombateInput.value =
        dados.estiloCombate;

    vidaAtualInput.value =
        dados.vidaAtual;

    vidaMaxInput.value =
        dados.vidaMax;

    espiritoAtualInput.value =
        dados.espiritoAtual;

    espiritoMaxInput.value =
        dados.espiritoMax;

    renderizarAnotacoes(dados);

    atualizarPreviewAnotacoes(dados);


    for (const input of inventarioInputs) {

        const chave =
            input.dataset.inv;

        input.value =
            dados.inventario[chave] || "";

    }


    atualizarCombateDisplay(dados);

    atualizarDefesaValor(dados);


    carregarFotoPerfil(dados);

    renderizarAptidoes(dados);

    renderizarMochila(dados);

    renderizarHabilidades(dados);

    renderizarTracos(dados);
}


/* =========================================================
   FOTO DE PERFIL
   ========================================================= */

function carregarFotoPerfil(dados) {

    if (dados.fotoPerfil) {

        fotoPerfilImg.src = dados.fotoPerfil;
        fotoPerfilImg.hidden = false;
        fotoPerfilPlaceholder.hidden = true;
        btnRemoverFoto.hidden = false;

    } else {

        fotoPerfilImg.src = "";
        fotoPerfilImg.hidden = true;
        fotoPerfilPlaceholder.hidden = false;
        btnRemoverFoto.hidden = true;

    }
}


function redimensionarImagem(arquivo, ladoMaximo) {

    return new Promise((resolve, reject) => {

        const leitor = new FileReader();

        leitor.onerror = () => reject(leitor.error);

        leitor.onload = () => {

            const imagem = new Image();

            imagem.onerror = () => reject(new Error("Imagem inválida."));

            imagem.onload = () => {

                let { width, height } = imagem;

                if (width > height && width > ladoMaximo) {
                    height = Math.round(height * (ladoMaximo / width));
                    width = ladoMaximo;
                } else if (height > ladoMaximo) {
                    width = Math.round(width * (ladoMaximo / height));
                    height = ladoMaximo;
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const contexto = canvas.getContext("2d");
                contexto.drawImage(imagem, 0, 0, width, height);

                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };

            imagem.src = leitor.result;
        };

        leitor.readAsDataURL(arquivo);
    });
}


inputFotoPerfil.addEventListener("change", async (evento) => {

    const arquivo = evento.target.files?.[0];

    evento.target.value = "";

    if (!arquivo) {
        return;
    }

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    try {

        const dataUrl = await redimensionarImagem(arquivo, 500);

        ficha.dados.fotoPerfil = dataUrl;

        carregarFotoPerfil(ficha.dados);

        salvarFichas();

        mostrarStatus("Retrato atualizado.");

    } catch (erro) {

        console.error("Erro ao processar imagem:", erro);

        window.alert("Não foi possível carregar essa imagem.");

    }
});


btnRemoverFoto.addEventListener("click", (evento) => {

    evento.preventDefault();

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    ficha.dados.fotoPerfil = "";

    carregarFotoPerfil(ficha.dados);

    salvarFichas();

    mostrarStatus("Retrato removido.");
});


/* =========================================================
   SALVAR INTERFACE NA FICHA
   ========================================================= */

function salvarEstadoDaInterface() {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }


    const dados =
        ficha.dados;


    dados.nome =
        nomeInput.value;

    dados.jogador =
        jogadorInput.value;

    dados.raca =
        racaInput.value;

    dados.especializacao =
        especializacaoInput.value;

    dados.estiloCombate =
        estiloCombateInput.value;

    dados.vidaAtual =
        vidaAtualInput.value;

    dados.vidaMax =
        vidaMaxInput.value;

    dados.espiritoAtual =
        espiritoAtualInput.value;

    dados.espiritoMax =
        espiritoMaxInput.value;


    for (const input of inventarioInputs) {

        const chave =
            input.dataset.inv;

        dados.inventario[chave] =
            input.value;

    }


    atualizarTituloFicha(ficha);
}


/* =========================================================
   RENDERIZAR ATRIBUTOS E APTIDÕES
   ========================================================= */

function renderizarAptidoes(dados) {

    aptidoesGrid.innerHTML = "";

    aflicaoGrid.innerHTML = "";


    for (const atributo of ATRIBUTOS) {

        const grupo =
            document.createElement("div");

        grupo.className = "atributo-grupo";


        const cabecalho =
            document.createElement("div");

        cabecalho.className = "atributo-cabecalho";


        const nomeAtributo =
            document.createElement("span");

        nomeAtributo.className = "atributo-nome";

        nomeAtributo.textContent = atributo;


        const valorAtributo =
            dados.atributos[atributo] || 0;

        const orcamento =
            valorAtributo * PONTOS_POR_ATRIBUTO;

        const usados =
            APTIDOES_POR_ATRIBUTO[atributo].reduce(
                (total, aptidao) =>
                    total + (dados.aptidoes[aptidao] || 0),
                0
            );

        const pontosInfo =
            document.createElement("span");

        pontosInfo.className =
            "atributo-pontos" +
            (
                usados >= orcamento && orcamento > 0
                    ? " atributo-pontos-cheio"
                    : ""
            );

        pontosInfo.textContent =
            `${usados}/${orcamento} pts`;


        cabecalho.appendChild(nomeAtributo);

        cabecalho.appendChild(
            criarPipsAtributo(atributo, valorAtributo)
        );

        cabecalho.appendChild(pontosInfo);

        grupo.appendChild(cabecalho);


        const lista =
            document.createElement("div");

        lista.className = "atributo-aptidoes";

        for (const aptidao of APTIDOES_POR_ATRIBUTO[atributo]) {

            criarLinhaAptidao(
                lista,
                aptidao,
                dados.aptidoes[aptidao] || 0
            );

        }

        grupo.appendChild(lista);


        aptidoesGrid.appendChild(grupo);

    }


    criarLinhaAptidao(
        aflicaoGrid,
        "Aflição",
        dados.aptidoes["Aflição"] || 0,
        true
    );

    atualizarAtmosferaAfligida(dados);

    atualizarDefesaValor(dados);
}


function atualizarAtmosferaAfligida(dados) {

    const nivel = normalizarPip(
        dados.aptidoes["Aflição"] || 0
    );

    document.body.dataset.aflicao = String(nivel);

    document.body.classList.toggle(
        "aflicao-maxima",
        nivel === PIPS_POR_APTIDAO
    );
}


function criarLinhaAptidao(
    container,
    nome,
    valor,
    compacta = false
) {

    const row =
        document.createElement("div");

    row.className = "apt-row";


    if (!compacta) {

        const label =
            document.createElement("span");

        label.className =
            "apt-name";

        label.textContent =
            nome;

        label.title =
            `Rolar 1d6 + ${nome}`;

        label.addEventListener(
            "click",
            () => {
                rolarAptidao(nome);
            }
        );

        row.appendChild(label);

    }


    const pips =
        document.createElement("div");

    pips.className =
        "apt-pips";


    for (
        let i = 1;
        i <= PIPS_POR_APTIDAO;
        i++
    ) {

        const pip =
            document.createElement("button");

        pip.type = "button";

        pip.className =
            "pip" +
            (
                i <= valor
                    ? " filled"
                    : ""
            );

        pip.dataset.value = i;

        pip.setAttribute(
            "aria-label",
            `${nome}: ${i} de ${PIPS_POR_APTIDAO}`
        );


        pip.addEventListener(
            "click",
            () => {

                alterarAptidao(
                    nome,
                    i
                );

            }
        );


        pips.appendChild(pip);
    }


    row.appendChild(pips);

    container.appendChild(row);
}


function criarPipsAtributo(nome, valor) {

    const pips =
        document.createElement("div");

    pips.className =
        "apt-pips atributo-pips";


    for (
        let i = 1;
        i <= ATRIBUTO_MAX;
        i++
    ) {

        const pip =
            document.createElement("button");

        pip.type = "button";

        pip.className =
            "pip" +
            (
                i <= valor
                    ? " filled"
                    : ""
            );

        pip.dataset.value = i;

        pip.setAttribute(
            "aria-label",
            `${nome}: ${i} de ${ATRIBUTO_MAX}`
        );


        pip.addEventListener(
            "click",
            () => {

                alterarAtributo(
                    nome,
                    i
                );

            }
        );


        pips.appendChild(pip);
    }


    return pips;
}


/* =========================================================
   ALTERAR ATRIBUTO / APTIDÃO
   ========================================================= */

function ajustarAptidoesParaOrcamento(dados, atributo) {

    const lista =
        APTIDOES_POR_ATRIBUTO[atributo];

    const orcamento =
        (dados.atributos[atributo] || 0) * PONTOS_POR_ATRIBUTO;

    let soma =
        lista.reduce(
            (total, aptidao) =>
                total + (dados.aptidoes[aptidao] || 0),
            0
        );

    while (soma > orcamento) {

        let maiorAptidao = null;
        let maiorValor = 0;

        for (const aptidao of lista) {

            const valor =
                dados.aptidoes[aptidao] || 0;

            if (valor > maiorValor) {
                maiorValor = valor;
                maiorAptidao = aptidao;
            }

        }

        if (!maiorAptidao) {
            break;
        }

        dados.aptidoes[maiorAptidao] -= 1;

        soma -= 1;

    }
}


function alterarAtributo(
    nome,
    valorClicado
) {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }

    const dados =
        ficha.dados;

    const atual =
        dados.atributos[nome] || 0;

    const novoValor =
        atual === valorClicado
            ? Math.max(0, atual - 1)
            : valorClicado;


    if (novoValor < atual) {

        const pontosGastos =
            APTIDOES_POR_ATRIBUTO[nome].reduce(
                (total, aptidao) =>
                    total + (dados.aptidoes[aptidao] || 0),
                0
            );

        const novoOrcamento =
            novoValor * PONTOS_POR_ATRIBUTO;

        if (pontosGastos > novoOrcamento) {

            mostrarStatus(
                `Reduza as aptidões de ${nome} antes de baixar o atributo (pontos já distribuídos).`
            );

            return;

        }

    }


    dados.atributos[nome] =
        novoValor;

    salvarFichas();

    renderizarAptidoes(dados);
}


function alterarAptidao(
    nome,
    valorClicado
) {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }

    const dados =
        ficha.dados;

    const atual =
        dados.aptidoes[nome] || 0;


    /*
     * Se clicar no maior pip atualmente preenchido,
     * reduz um ponto.
     *
     * Caso contrário, vai até o pip clicado.
     */

    const novoValor =
        atual === valorClicado
            ? Math.max(0, atual - 1)
            : valorClicado;


    const atributo =
        ATRIBUTO_DA_APTIDAO[nome];

    if (
        atributo &&
        novoValor > atual
    ) {

        const orcamento =
            (dados.atributos[atributo] || 0) * PONTOS_POR_ATRIBUTO;

        const somaComNovoValor =
            APTIDOES_POR_ATRIBUTO[atributo].reduce(
                (total, aptidaoAtual) =>
                    total + (
                        aptidaoAtual === nome
                            ? novoValor
                            : (dados.aptidoes[aptidaoAtual] || 0)
                    ),
                0
            );

        if (somaComNovoValor > orcamento) {

            mostrarStatus(
                `Sem pontos livres em ${atributo}. Aumente o atributo para liberar mais pontos.`
            );

            return;

        }

    }


    dados.aptidoes[nome] =
        novoValor;

    salvarFichas();

    renderizarAptidoes(
        dados
    );
}


/* =========================================================
   ROLAGEM DE DADOS (1d6 + Aptidão)
   ========================================================= */

function rolarAptidao(nome) {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }

    const valorAptidao =
        ficha.dados.aptidoes[nome] || 0;

    const dado =
        Math.floor(Math.random() * 6) + 1;

    const total =
        dado + valorAptidao;

    exibirRolagem(
        nome,
        dado,
        valorAptidao,
        total
    );
}


function exibirRolagem(
    nome,
    dado,
    valorAptidao,
    total
) {

    dicePopupFormula.textContent =
        `${nome} — 1d6 (${dado}) + ${valorAptidao}`;

    dicePopupResultado.textContent =
        String(total);


    dicePopupOverlay.classList.add("show");
}


function fecharDicePopup() {

    dicePopupOverlay.classList.remove("show");
}


btnFecharDicePopup.addEventListener(
    "click",
    fecharDicePopup
);


dicePopupOverlay.addEventListener(
    "click",
    (evento) => {

        if (evento.target === dicePopupOverlay) {
            fecharDicePopup();
        }

    }
);


document.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.key === "Escape" &&
            dicePopupOverlay.classList.contains("show")
        ) {

            fecharDicePopup();

        }

    }
);


/* =========================================================
   MOCHILA
   ========================================================= */

function renderizarMochila(dados) {

    dados.mochila =
        normalizarMochila(
            dados.mochila
        );

    mochilaGrid.innerHTML = "";


    dados.mochila.forEach(
        (item, indice) => {

            const slot =
                document.createElement("div");

            slot.className =
                "mochila-slot" +
                (
                    (item.descricao || "").trim()
                        ? " expanded"
                        : ""
                ) +
                (
                    item.emUso
                        ? " equipada"
                        : ""
                );


            const head =
                document.createElement("div");

            head.className =
                "mochila-slot-head";


            const numero =
                document.createElement("span");

            numero.className =
                "mochila-number";

            numero.textContent =
                String(indice + 1);


            const toggle =
                document.createElement("button");

            toggle.type = "button";

            toggle.className =
                "mochila-toggle";

            toggle.textContent = "▸";

            toggle.title =
                "Mostrar/ocultar descrição";

            toggle.setAttribute(
                "aria-label",
                `Mostrar ou ocultar descrição de ${item.nome || "item"}`
            );

            toggle.addEventListener(
                "click",
                () => {
                    slot.classList.toggle("expanded");
                }
            );


            const nome =
                document.createElement("input");

            nome.type = "text";

            nome.className =
                "mochila-name";

            nome.placeholder =
                "nome do item";

            nome.value =
                item.nome || "";


            const descricao =
                document.createElement("textarea");

            descricao.className =
                "mochila-description";

            descricao.placeholder =
                "descrição, quantidade, propriedades...";

            descricao.value =
                item.descricao || "";


            const peso =
                document.createElement("select");

            peso.className =
                "mochila-weight";

            peso.setAttribute(
                "aria-label",
                `Peso de ${item.nome || "item"}`
            );

            for (const valor of [0, 1, 2, 3]) {

                const opcao =
                    document.createElement("option");

                opcao.value = String(valor);
                opcao.textContent = `Peso ${valor}`;

                peso.appendChild(opcao);
            }

            peso.value = String(
                normalizarPeso(item.peso)
            );


            const equipar =
                document.createElement("select");

            equipar.className =
                "mochila-equip";

            equipar.setAttribute(
                "aria-label",
                `Equipar ${item.nome || "item"} como arma ou armadura`
            );

            const opcoesEquipar = [
                { valor: "", texto: "Item comum" },
                { valor: "arma", texto: "Arma" },
                { valor: "armadura", texto: "Armadura" }
            ];

            for (const opcaoInfo of opcoesEquipar) {

                const opcao =
                    document.createElement("option");

                opcao.value = opcaoInfo.valor;
                opcao.textContent = opcaoInfo.texto;

                equipar.appendChild(opcao);
            }

            equipar.value =
                item.equipado || "";


            let camposCombate = null;

            if (item.equipado === "arma" || item.equipado === "armadura") {

                camposCombate =
                    document.createElement("div");

                camposCombate.className =
                    "mochila-combate-fields";


                if (item.equipado === "arma") {

                    const linha =
                        document.createElement("div");

                    linha.className = "combate-row";


                    const campoDano =
                        document.createElement("label");

                    campoDano.className = "combate-subfield";

                    const tagDano =
                        document.createElement("span");

                    tagDano.className = "combate-subtag";
                    tagDano.textContent = "Dano";

                    const inputDano =
                        document.createElement("input");

                    inputDano.type = "text";
                    inputDano.className = "combate-input combate-input-small";
                    inputDano.placeholder = "ex: 2d6";
                    inputDano.value = item.dano || "";

                    inputDano.addEventListener("input", () => {
                        dados.mochila[indice].dano = inputDano.value;
                        salvarFichas();
                        atualizarCombateDisplay(dados);
                    });

                    campoDano.appendChild(tagDano);
                    campoDano.appendChild(inputDano);


                    const campoTipo =
                        document.createElement("label");

                    campoTipo.className = "combate-subfield";

                    const tagTipo =
                        document.createElement("span");

                    tagTipo.className = "combate-subtag";
                    tagTipo.textContent = "Tipo";

                    const selectTipo =
                        document.createElement("select");

                    selectTipo.className = "combate-select";

                    for (const [valor, texto] of [
                        ["corpo-a-corpo", "Corpo-a-Corpo"],
                        ["distancia", "Distância"]
                    ]) {

                        const opcao =
                            document.createElement("option");

                        opcao.value = valor;
                        opcao.textContent = texto;

                        selectTipo.appendChild(opcao);
                    }

                    selectTipo.value = item.tipo || "corpo-a-corpo";

                    selectTipo.addEventListener("change", () => {
                        dados.mochila[indice].tipo = selectTipo.value;
                        salvarFichas();
                        atualizarCombateDisplay(dados);
                    });

                    campoTipo.appendChild(tagTipo);
                    campoTipo.appendChild(selectTipo);


                    const campoMunicao =
                        document.createElement("label");

                    campoMunicao.className = "combate-subfield";

                    const tagMunicao =
                        document.createElement("span");

                    tagMunicao.className = "combate-subtag";
                    tagMunicao.textContent = "Munição";

                    const inputMunicao =
                        document.createElement("input");

                    inputMunicao.type = "text";
                    inputMunicao.className = "combate-input combate-input-small";
                    inputMunicao.placeholder = "ex: 6/6";
                    inputMunicao.value = item.municao || "";

                    inputMunicao.addEventListener("input", () => {
                        dados.mochila[indice].municao = inputMunicao.value;
                        salvarFichas();
                        atualizarCombateDisplay(dados);
                    });

                    campoMunicao.appendChild(tagMunicao);
                    campoMunicao.appendChild(inputMunicao);


                    linha.appendChild(campoDano);
                    linha.appendChild(campoTipo);
                    linha.appendChild(campoMunicao);

                    camposCombate.appendChild(linha);

                }


                if (item.equipado === "armadura") {

                    const linha =
                        document.createElement("div");

                    linha.className = "combate-row";


                    const campoValor =
                        document.createElement("label");

                    campoValor.className = "combate-subfield";

                    const tagValor =
                        document.createElement("span");

                    tagValor.className = "combate-subtag";
                    tagValor.textContent = "Valor da armadura";

                    const inputValor =
                        document.createElement("input");

                    inputValor.type = "number";
                    inputValor.min = "0";
                    inputValor.className = "combate-input combate-input-small";
                    inputValor.value = item.valorArmadura ?? "";

                    inputValor.addEventListener("input", () => {
                        dados.mochila[indice].valorArmadura = inputValor.value;
                        salvarFichas();
                        atualizarDefesaValor(dados);
                    });

                    campoValor.appendChild(tagValor);
                    campoValor.appendChild(inputValor);

                    linha.appendChild(campoValor);

                    camposCombate.appendChild(linha);

                }


                const linhaEmUso =
                    document.createElement("label");

                linhaEmUso.className = "mochila-emuso";

                const checkboxEmUso =
                    document.createElement("input");

                checkboxEmUso.type = "checkbox";
                checkboxEmUso.checked = Boolean(item.emUso);

                const textoEmUso =
                    document.createElement("span");

                textoEmUso.textContent =
                    item.equipado === "arma"
                        ? "Em uso (aparece no Combate)"
                        : "Em uso (conta na Defesa)";

                checkboxEmUso.addEventListener("change", () => {

                    const novoValor = checkboxEmUso.checked;

                    if (novoValor) {

                        for (const outroItem of dados.mochila) {

                            if (
                                outroItem !== dados.mochila[indice] &&
                                outroItem.equipado === item.equipado
                            ) {
                                outroItem.emUso = false;
                            }

                        }

                    }

                    dados.mochila[indice].emUso = novoValor;

                    salvarFichas();

                    renderizarMochila(dados);

                    atualizarCombateDisplay(dados);

                    atualizarDefesaValor(dados);

                });

                linhaEmUso.appendChild(checkboxEmUso);
                linhaEmUso.appendChild(textoEmUso);

                camposCombate.appendChild(linhaEmUso);

            }


            const remover =
                document.createElement("button");

            remover.type = "button";

            remover.className =
                "mochila-remove";

            remover.textContent =
                "×";

            remover.title =
                "Remover este espaço";

            remover.setAttribute(
                "aria-label",
                `Remover espaço ${indice + 1} da mochila`
            );


            nome.addEventListener(
                "input",
                () => {

                    dados.mochila[indice].nome =
                        nome.value;

                    salvarFichas();

                    atualizarCombateDisplay(dados);

                }
            );


            descricao.addEventListener(
                "input",
                () => {

                    dados.mochila[indice].descricao =
                        descricao.value;

                    salvarFichas();

                }
            );


            peso.addEventListener(
                "change",
                () => {

                    dados.mochila[indice].peso =
                        normalizarPeso(peso.value);

                    atualizarPesoTotal(dados);

                    salvarFichas();

                }
            );


            equipar.addEventListener(
                "change",
                () => {

                    const novoValor =
                        normalizarEquipado(equipar.value);

                    dados.mochila[indice].equipado =
                        novoValor;

                    /*
                     * Trocar a categoria do item sempre
                     * desmarca "em uso" — o jogador precisa
                     * confirmar de novo, pra não herdar o
                     * estado de uma categoria diferente.
                     */

                    dados.mochila[indice].emUso = false;

                    salvarFichas();

                    renderizarMochila(dados);

                    atualizarCombateDisplay(dados);

                    atualizarDefesaValor(dados);

                }
            );


            remover.addEventListener(
                "click",
                () => {

                    removerSlotMochila(
                        indice
                    );

                }
            );


            slot.appendChild(numero);

            slot.appendChild(remover);

            head.appendChild(toggle);

            head.appendChild(nome);

            head.appendChild(peso);

            head.appendChild(equipar);

            slot.appendChild(head);

            if (camposCombate) {
                slot.appendChild(camposCombate);
            }

            slot.appendChild(descricao);

            mochilaGrid.appendChild(slot);

        }
    );

    atualizarPesoTotal(dados);
}


function atualizarPesoTotal(dados) {

    if (!pesoTotal) {
        return;
    }

    const total = dados.mochila.reduce(
        (soma, item) => soma + normalizarPeso(item.peso),
        0
    );

    pesoTotal.textContent = String(total);
}


/* =========================================================
   HABILIDADES
   ========================================================= */

function renderizarHabilidades(dados) {

    dados.habilidades =
        normalizarHabilidades(dados.habilidades);

    habilidadesGrid.innerHTML = "";


    dados.habilidades.forEach((item, indice) => {

        const slot =
            document.createElement("div");

        slot.className =
            "mochila-slot" +
            (
                (item.descricao || "").trim()
                    ? " expanded"
                    : ""
            );


        const head =
            document.createElement("div");

        head.className =
            "mochila-slot-head";


        const numero =
            document.createElement("span");

        numero.className =
            "mochila-number";

        numero.textContent =
            String(indice + 1);


        const toggle =
            document.createElement("button");

        toggle.type = "button";

        toggle.className =
            "mochila-toggle";

        toggle.textContent = "▸";

        toggle.title =
            "Mostrar/ocultar descrição";

        toggle.setAttribute(
            "aria-label",
            `Mostrar ou ocultar descrição de ${item.nome || "habilidade"}`
        );

        toggle.addEventListener("click", () => {
            slot.classList.toggle("expanded");
        });


        const nome =
            document.createElement("input");

        nome.type = "text";

        nome.className = "mochila-name";

        nome.placeholder = "nome da habilidade";

        nome.value = item.nome || "";


        const descricao =
            document.createElement("textarea");

        descricao.className = "mochila-description";

        descricao.placeholder =
            "o que essa habilidade faz...";

        descricao.value = item.descricao || "";


        const remover =
            document.createElement("button");

        remover.type = "button";

        remover.className = "mochila-remove";

        remover.textContent = "×";

        remover.title = "Remover esta habilidade";

        remover.setAttribute(
            "aria-label",
            `Remover habilidade ${indice + 1}`
        );


        nome.addEventListener("input", () => {
            dados.habilidades[indice].nome = nome.value;
            salvarFichas();
        });

        descricao.addEventListener("input", () => {
            dados.habilidades[indice].descricao = descricao.value;
            salvarFichas();
        });

        remover.addEventListener("click", () => {
            removerHabilidade(indice);
        });


        slot.appendChild(numero);

        slot.appendChild(remover);

        head.appendChild(toggle);

        head.appendChild(nome);

        slot.appendChild(head);

        slot.appendChild(descricao);

        habilidadesGrid.appendChild(slot);

    });
}


function adicionarHabilidade() {

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    ficha.dados.habilidades =
        normalizarHabilidades(ficha.dados.habilidades);

    ficha.dados.habilidades.push({ nome: "", descricao: "" });

    salvarFichas();

    renderizarHabilidades(ficha.dados);

    mostrarStatus("Habilidade adicionada.");
}


function removerHabilidade(indice) {

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    ficha.dados.habilidades.splice(indice, 1);

    if (ficha.dados.habilidades.length === 0) {
        ficha.dados.habilidades.push({ nome: "", descricao: "" });
    }

    salvarFichas();

    renderizarHabilidades(ficha.dados);

    mostrarStatus("Habilidade removida.");
}


/* =========================================================
   TRAÇOS (POSITIVOS / NEGATIVOS)
   ========================================================= */

function alternarAbaTracos(tipo) {

    if (
        tipo !== "positivos" &&
        tipo !== "negativos"
    ) {
        return;
    }

    tracosAbaAtual = tipo;

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }

    renderizarTracos(ficha.dados);
}


function renderizarTracos(dados) {

    dados.tracos =
        normalizarTracos(dados.tracos);


    btnTracosPositivos.classList.toggle(
        "active",
        tracosAbaAtual === "positivos"
    );

    btnTracosPositivos.setAttribute(
        "aria-selected",
        tracosAbaAtual === "positivos" ? "true" : "false"
    );

    btnTracosNegativos.classList.toggle(
        "active",
        tracosAbaAtual === "negativos"
    );

    btnTracosNegativos.setAttribute(
        "aria-selected",
        tracosAbaAtual === "negativos" ? "true" : "false"
    );


    tracosGrid.innerHTML = "";

    const lista =
        dados.tracos[tracosAbaAtual];

    const rotulo =
        tracosAbaAtual === "positivos"
            ? "traço positivo"
            : "traço negativo";


    lista.forEach((item, indice) => {

        const slot =
            document.createElement("div");

        slot.className =
            "mochila-slot" +
            (
                (item.descricao || "").trim()
                    ? " expanded"
                    : ""
            );


        const head =
            document.createElement("div");

        head.className =
            "mochila-slot-head";


        const numero =
            document.createElement("span");

        numero.className =
            "mochila-number";

        numero.textContent =
            String(indice + 1);


        const toggle =
            document.createElement("button");

        toggle.type = "button";

        toggle.className =
            "mochila-toggle";

        toggle.textContent = "▸";

        toggle.title =
            "Mostrar/ocultar descrição";

        toggle.setAttribute(
            "aria-label",
            `Mostrar ou ocultar descrição de ${item.nome || rotulo}`
        );

        toggle.addEventListener("click", () => {
            slot.classList.toggle("expanded");
        });


        const nome =
            document.createElement("input");

        nome.type = "text";

        nome.className = "mochila-name";

        nome.placeholder = `nome do ${rotulo}`;

        nome.value = item.nome || "";


        const descricao =
            document.createElement("textarea");

        descricao.className = "mochila-description";

        descricao.placeholder =
            "o que esse traço faz...";

        descricao.value = item.descricao || "";


        const remover =
            document.createElement("button");

        remover.type = "button";

        remover.className = "mochila-remove";

        remover.textContent = "×";

        remover.title = "Remover este traço";

        remover.setAttribute(
            "aria-label",
            `Remover ${rotulo} ${indice + 1}`
        );


        nome.addEventListener("input", () => {
            lista[indice].nome = nome.value;
            salvarFichas();
        });

        descricao.addEventListener("input", () => {
            lista[indice].descricao = descricao.value;
            salvarFichas();
        });

        remover.addEventListener("click", () => {
            removerTraco(indice);
        });


        slot.appendChild(numero);

        slot.appendChild(remover);

        head.appendChild(toggle);

        head.appendChild(nome);

        slot.appendChild(head);

        slot.appendChild(descricao);

        tracosGrid.appendChild(slot);

    });
}


function adicionarTraco() {

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    ficha.dados.tracos =
        normalizarTracos(ficha.dados.tracos);

    ficha.dados.tracos[tracosAbaAtual].push(
        { nome: "", descricao: "" }
    );

    salvarFichas();

    renderizarTracos(ficha.dados);

    mostrarStatus(
        tracosAbaAtual === "positivos"
            ? "Traço positivo adicionado."
            : "Traço negativo adicionado."
    );
}


function removerTraco(indice) {

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    const lista =
        ficha.dados.tracos[tracosAbaAtual];

    lista.splice(indice, 1);

    if (lista.length === 0) {
        lista.push({ nome: "", descricao: "" });
    }

    salvarFichas();

    renderizarTracos(ficha.dados);

    mostrarStatus("Traço removido.");
}


/* =========================================================
   ANOTAÇÕES (LISTA COM TÍTULOS, DENTRO DO POPUP)
   ========================================================= */

function renderizarAnotacoes(dados) {

    dados.anotacoes =
        normalizarAnotacoes(dados.anotacoes);

    if (!anotacoesGrid) {
        return;
    }

    anotacoesGrid.innerHTML = "";


    dados.anotacoes.forEach((item, indice) => {

        const slot =
            document.createElement("div");

        slot.className = "mochila-slot expanded";


        const head =
            document.createElement("div");

        head.className = "mochila-slot-head";


        const numero =
            document.createElement("span");

        numero.className = "mochila-number";

        numero.textContent = String(indice + 1);


        const titulo =
            document.createElement("input");

        titulo.type = "text";

        titulo.className = "mochila-name";

        titulo.placeholder = "título da anotação";

        titulo.value = item.titulo || "";


        const texto =
            document.createElement("textarea");

        texto.className = "mochila-description";

        texto.placeholder =
            "escreva aqui...";

        texto.value = item.texto || "";


        const remover =
            document.createElement("button");

        remover.type = "button";

        remover.className = "mochila-remove";

        remover.textContent = "×";

        remover.title = "Remover esta anotação";

        remover.setAttribute(
            "aria-label",
            `Remover anotação ${indice + 1}`
        );


        titulo.addEventListener("input", () => {
            dados.anotacoes[indice].titulo = titulo.value;
            salvarFichas();
            atualizarPreviewAnotacoes(dados);
        });

        texto.addEventListener("input", () => {
            dados.anotacoes[indice].texto = texto.value;
            salvarFichas();
            atualizarPreviewAnotacoes(dados);
        });

        remover.addEventListener("click", () => {
            removerAnotacao(indice);
        });


        slot.appendChild(numero);

        slot.appendChild(remover);

        head.appendChild(titulo);

        slot.appendChild(head);

        slot.appendChild(texto);

        anotacoesGrid.appendChild(slot);

    });
}


function adicionarAnotacao() {

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    ficha.dados.anotacoes =
        normalizarAnotacoes(ficha.dados.anotacoes);

    ficha.dados.anotacoes.push(criarAnotacaoVazia());

    salvarFichas();

    renderizarAnotacoes(ficha.dados);

    mostrarStatus("Anotação adicionada.");
}


function removerAnotacao(indice) {

    const ficha = obterFichaAtual();

    if (!ficha) {
        return;
    }

    ficha.dados.anotacoes.splice(indice, 1);

    if (ficha.dados.anotacoes.length === 0) {
        ficha.dados.anotacoes.push(criarAnotacaoVazia());
    }

    salvarFichas();

    renderizarAnotacoes(ficha.dados);

    atualizarPreviewAnotacoes(ficha.dados);

    mostrarStatus("Anotação removida.");
}


if (btnAdicionarAnotacao) {

    btnAdicionarAnotacao.addEventListener("click", () => {
        adicionarAnotacao();
    });

}


btnAdicionarHabilidade.addEventListener("click", () => {
    adicionarHabilidade();
});


btnAdicionarTraco.addEventListener("click", () => {
    adicionarTraco();
});

btnTracosPositivos.addEventListener("click", () => {
    alternarAbaTracos("positivos");
});

btnTracosNegativos.addEventListener("click", () => {
    alternarAbaTracos("negativos");
});


/* =========================================================
   ADICIONAR SLOT
   ========================================================= */

function adicionarSlotMochila() {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }


    ficha.dados.mochila =
        normalizarMochila(
            ficha.dados.mochila
        );


    ficha.dados.mochila.push(
        criarItemMochilaVazio()
    );


    salvarFichas();

    renderizarMochila(
        ficha.dados
    );


    mostrarStatus(
        "Item adicionado."
    );
}


/* =========================================================
   REMOVER SLOT
   ========================================================= */

function removerSlotMochila(indice) {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }


    const mochila =
        ficha.dados.mochila;


    if (!Array.isArray(mochila)) {
        return;
    }


    mochila.splice(indice, 1);


    salvarFichas();

    renderizarMochila(
        ficha.dados
    );

    atualizarCombateDisplay(
        ficha.dados
    );

    atualizarDefesaValor(
        ficha.dados
    );

    mostrarStatus(
        "Item removido."
    );
}


/* =========================================================
   EVENTOS DOS CAMPOS
   ========================================================= */

function registrarAutosave(elemento, aoSalvar) {

    elemento.addEventListener(
        "input",
        () => {

            salvarEstadoDaInterface();

            salvarFichas();

            atualizarAbasSemTrocar();

            if (typeof aoSalvar === "function") {
                aoSalvar();
            }

        }
    );
}


registrarAutosave(nomeInput);
registrarAutosave(jogadorInput);
registrarAutosave(racaInput);
registrarAutosave(especializacaoInput);
registrarAutosave(estiloCombateInput);
registrarAutosave(vidaAtualInput);
registrarAutosave(vidaMaxInput);
registrarAutosave(espiritoAtualInput);
registrarAutosave(espiritoMaxInput);


/* =========================================================
   MODAL DE ANOTAÇÕES
   ========================================================= */

function atualizarPreviewAnotacoes() {

    /*
     * O texto do botão é fixo de propósito — não muda
     * conforme o conteúdo das anotações, para servir
     * sempre como um rótulo estável de "abrir anotações".
     */

    if (!anotacoesPreviewEl) {
        return;
    }

    anotacoesPreviewEl.textContent =
        "Toque para ver ou adicionar anotações";
}


function abrirModalAnotacoes() {

    anotacoesModalOverlay.hidden = false;
}


function fecharModalAnotacoes() {

    anotacoesModalOverlay.hidden = true;

    atualizarPreviewAnotacoes();
}


btnAbrirAnotacoes.addEventListener(
    "click",
    abrirModalAnotacoes
);


btnFecharAnotacoes.addEventListener(
    "click",
    fecharModalAnotacoes
);


anotacoesModalOverlay.addEventListener(
    "click",
    (evento) => {

        if (evento.target === anotacoesModalOverlay) {
            fecharModalAnotacoes();
        }

    }
);


document.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.key === "Escape" &&
            !anotacoesModalOverlay.hidden
        ) {

            fecharModalAnotacoes();

        }

    }
);


for (const input of inventarioInputs) {
    registrarAutosave(input);
}


/* =========================================================
   DEFESA (cálculo automático: Armadura equipada + Postura)
   ========================================================= */

function atualizarDefesaValor(dados) {

    if (!dados) {

        const ficha = obterFichaAtual();

        if (!ficha) {
            return;
        }

        dados = ficha.dados;
    }

    const postura =
        dados.aptidoes["Postura"] || 0;

    const armaduraItem =
        obterItemEquipado(dados, "armadura");

    const armadura =
        armaduraItem
            ? (Number(armaduraItem.valorArmadura) || 0)
            : 0;

    const total = postura + armadura;

    if (defesaValorEl) {
        defesaValorEl.textContent = String(total);
    }

    if (defesaBoxEl) {

        defesaBoxEl.title =
            `Armadura (${armadura}) + Postura (${postura}) = ${total}`;

    }
}


/* =========================================================
   COMBATE — ARMA/ARMADURA EQUIPADAS (vindas do inventário)
   ========================================================= */

function obterItemEquipado(dados, tipo) {

    return dados.mochila.find(
        item => item.equipado === tipo && item.emUso
    ) || null;
}


function atualizarCombateDisplay(dados) {

    if (!dados) {

        const ficha = obterFichaAtual();

        if (!ficha) {
            return;
        }

        dados = ficha.dados;
    }

    const armaItem =
        obterItemEquipado(dados, "arma");

    if (armaItem) {

        combateArmaNomeEl.textContent =
            armaItem.nome.trim() || "(sem nome)";

        combateArmaInfoEl.hidden = false;

        combateDanoValorEl.textContent =
            (armaItem.dano || "").trim() || "—";

        combateTipoValorEl.textContent =
            armaItem.tipo === "distancia" ? "Distância" : "Corpo-a-Corpo";

        combateMunicaoValorEl.textContent =
            (armaItem.municao || "").trim() || "—";

    } else {

        combateArmaNomeEl.textContent =
            "Nenhuma arma em uso";

        combateArmaInfoEl.hidden = true;

    }
}


/* =========================================================
   ATUALIZAR ABAS SEM RECARREGAR A FICHA
   ========================================================= */

function atualizarAbasSemTrocar() {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }


    atualizarTituloFicha(ficha);


    const tab =
        sheetTabs.querySelector(
            `.sheet-tab[data-id="${ficha.id}"]`
        );


    if (!tab) {
        renderizarAbas();
        return;
    }


    const titulo =
        tab.querySelector(
            ".sheet-tab-title"
        );


    if (titulo) {
        titulo.textContent =
            ficha.titulo;
    }
}


/* =========================================================
   NOVA FICHA
   ========================================================= */

btnNovaFicha.addEventListener(
    "click",
    () => {
        criarFicha();
    }
);


btnHomeNovaFicha.addEventListener(
    "click",
    () => {
        criarFicha();
    }
);


/* =========================================================
   MOCHILA
   ========================================================= */

btnAdicionarSlot.addEventListener(
    "click",
    () => {
        adicionarSlotMochila();
    }
);


/* =========================================================
   EXPORTAR
   ========================================================= */

btnExportar.addEventListener(
    "click",
    exportarFichaAtual
);


function exportarFichaAtual() {

    const ficha =
        obterFichaAtual();

    if (!ficha) {

        mostrarStatus(
            "Não há ficha aberta para exportar."
        );

        return;
    }


    salvarEstadoDaInterface();

    atualizarTituloFicha(ficha);

    salvarFichas();


    const pacote = {
        tipo: "anatema-ficha",
        versao: 3,
        exportadoEm:
            new Date().toISOString(),

        ficha: {
            titulo: ficha.titulo,
            dados: ficha.dados
        }
    };


    const json =
        JSON.stringify(
            pacote,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        sanitizarNomeArquivo(
            ficha.titulo
        ) + ".json";


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    mostrarStatus(
        "Ficha exportada."
    );
}


function sanitizarNomeArquivo(nome) {

    return (
        nome
            .replace(/[<>:"/\\|?*]/g, "")
            .trim()
            .substring(0, 80)
        || "anatema-ficha"
    );
}


/* =========================================================
   IMPORTAÇÃO
   ========================================================= */

inputImportar.addEventListener(
    "change",
    evento => {
        processarImportacao(
            evento.target.files?.[0]
        );

        evento.target.value = "";
    }
);


inputImportarHome.addEventListener(
    "change",
    evento => {
        processarImportacao(
            evento.target.files?.[0]
        );

        evento.target.value = "";
    }
);


function processarImportacao(arquivo) {

    if (!arquivo) {
        return;
    }


    const leitor =
        new FileReader();


    leitor.onload = () => {

        try {

            const conteudo =
                JSON.parse(
                    leitor.result
                );


            /*
             * Exportação nova de ficha individual.
             */

            if (
                conteudo &&
                conteudo.tipo === "anatema-ficha" &&
                conteudo.ficha
            ) {

                const dados =
                    normalizarEstado(
                        conteudo.ficha.dados
                    );


                const ficha =
                    criarFicha(dados);


                if (
                    conteudo.ficha.titulo &&
                    !dados.nome.trim()
                ) {

                    ficha.titulo =
                        conteudo.ficha.titulo;

                }


                salvarFichas();

                renderizarAbas();

                carregarFichaAtual();

                mostrarStatus(
                    "Ficha importada."
                );

                return;
            }


            /*
             * Compatibilidade com exportações antigas
             * que eram simplesmente o objeto de dados.
             */

            if (
                conteudo &&
                (
                    conteudo.nome !== undefined ||
                    conteudo.aptidoes !== undefined ||
                    conteudo.inventario !== undefined
                )
            ) {

                criarFicha(
                    normalizarEstado(
                        conteudo
                    )
                );

                mostrarStatus(
                    "Ficha antiga importada."
                );

                return;
            }


            /*
             * Importação de conjunto de fichas.
             */

            if (
                conteudo &&
                conteudo.tipo === "anatema-fichas" &&
                Array.isArray(conteudo.fichas)
            ) {

                let quantidade = 0;


                for (
                    const item of conteudo.fichas
                ) {

                    const dados =
                        normalizarEstado(
                            item.dados || item
                        );


                    const ficha = {
                        id: criarId(),

                        titulo:
                            item.titulo ||
                            dados.nome ||
                            "Nova ficha",

                        dados
                    };


                    fichas.push(ficha);

                    fichaAtualId =
                        ficha.id;

                    quantidade++;
                }


                salvarFichas();

                renderizarAbas();

                carregarFichaAtual();

                mostrarFicha();

                mostrarStatus(
                    `${quantidade} ficha(s) importada(s).`
                );

                return;
            }


            throw new Error(
                "Formato de arquivo não reconhecido."
            );

        } catch (erro) {

            console.error(
                "Erro ao importar ficha:",
                erro
            );


            window.alert(
                "Não foi possível importar este arquivo.\n\n" +
                "Verifique se ele é um JSON de ficha ANÁTEMA válido."
            );

        }

    };


    leitor.readAsText(
        arquivo,
        "UTF-8"
    );
}


/* =========================================================
   SALVAMENTO
   ========================================================= */

function salvarFichas() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                versao: 3,
                fichas,
                fichaAtualId
            })
        );

    } catch (erro) {

        console.error(
            "Erro ao salvar fichas:",
            erro
        );

        mostrarStatus(
            "Não foi possível salvar localmente."
        );
    }
}


/* =========================================================
   CARREGAMENTO
   ========================================================= */

function carregarFichas() {

    let armazenamento = null;


    /*
     * Primeiro tenta a versão atual.
     */

    try {

        const salvo =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (salvo) {
            armazenamento =
                JSON.parse(salvo);
        }

    } catch (erro) {

        console.error(
            "Erro lendo fichas atuais:",
            erro
        );

    }


    /*
     * Caso ainda não exista a versão 3,
     * tenta migrar a versão anterior.
     */

    if (!armazenamento) {

        armazenamento =
            migrarVersoesAntigas();

    }


    if (
        armazenamento &&
        Array.isArray(
            armazenamento.fichas
        )
    ) {

        fichas =
            armazenamento.fichas.map(
                ficha => {

                    const dados =
                        normalizarEstado(
                            ficha.dados || {}
                        );


                    return {
                        id:
                            ficha.id ||
                            criarId(),

                        titulo:
                            ficha.titulo ||
                            dados.nome ||
                            "Nova ficha",

                        dados
                    };

                }
            );


        fichaAtualId =
            armazenamento.fichaAtualId ||
            fichas[0]?.id ||
            null;

    } else {

        fichas = [];

        fichaAtualId = null;

    }


    /*
     * Garante que a ficha atual realmente existe.
     */

    if (
        fichaAtualId &&
        !fichas.some(
            ficha =>
                ficha.id === fichaAtualId
        )
    ) {

        fichaAtualId =
            fichas[0]?.id ||
            null;

    }


    salvarFichas();
}


/* =========================================================
   MIGRAÇÃO
   ========================================================= */

function migrarVersoesAntigas() {

    /*
     * Versão v2:
     *
     * {
     *   fichas: [
     *     {
     *       id,
     *       titulo,
     *       dados
     *     }
     *   ],
     *   fichaAtualId
     * }
     */


    try {

        const antiga =
            localStorage.getItem(
                "anatema-fichas-v2"
            );


        if (antiga) {

            const dados =
                JSON.parse(
                    antiga
                );


            if (
                Array.isArray(
                    dados.fichas
                )
            ) {

                return {
                    versao: 3,
                    fichas:
                        dados.fichas,
                    fichaAtualId:
                        dados.fichaAtualId ||
                        dados.fichas[0]?.id ||
                        null
                };

            }

        }

    } catch (erro) {

        console.error(
            "Erro migrando v2:",
            erro
        );

    }


    /*
     * Versão v1:
     *
     * Um único objeto de ficha.
     */

    try {

        const antiga =
            localStorage.getItem(
                "anatema-ficha-v1"
            );


        if (antiga) {

            const dados =
                JSON.parse(
                    antiga
                );


            const id =
                criarId();


            return {
                versao: 3,

                fichas: [
                    {
                        id,

                        titulo:
                            dados.nome ||
                            "Nova ficha",

                        dados:
                            normalizarEstado(
                                dados
                            )
                    }
                ],

                fichaAtualId: id
            };

        }

    } catch (erro) {

        console.error(
            "Erro migrando v1:",
            erro
        );

    }


    return null;
}


/* =========================================================
   STATUS
   ========================================================= */

let statusTimer = null;


function mostrarStatus(mensagem) {

    statusElement.textContent =
        mensagem;


    clearTimeout(
        statusTimer
    );


    statusTimer =
        setTimeout(
            () => {

                statusElement.textContent =
                    "";

            },
            2500
        );
}


/* =========================================================
   INICIALIZAÇÃO
   ========================================================= */

function iniciar() {

    carregarFichas();

    renderizarAbas();


    if (
        fichaAtualId &&
        fichas.length > 0
    ) {

        carregarFichaAtual();

        mostrarFicha();

    } else {

        fichaAtualId = null;

        mostrarHome();

    }

}


function iniciarOlhosDoFundo() {

    if (!window.matchMedia("(pointer: fine)").matches) {
        return;
    }

    const olhos = document.querySelectorAll(".watching-eye");

    document.addEventListener("pointermove", (evento) => {

        for (const olho of olhos) {

            const caixa = olho.getBoundingClientRect();
            const centroX = caixa.left + caixa.width / 2;
            const centroY = caixa.top + caixa.height / 2;
            const angulo = Math.atan2(evento.clientY - centroY, evento.clientX - centroX);
            const distancia = Math.min(7, Math.hypot(evento.clientX - centroX, evento.clientY - centroY) / 55);

            olho.style.setProperty("--eye-x", `${Math.cos(angulo) * distancia}px`);
            olho.style.setProperty("--eye-y", `${Math.sin(angulo) * distancia}px`);
        }
    });
}


iniciar();
iniciarOlhosDoFundo();
