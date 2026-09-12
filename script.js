/* =========================================================
   ANATEMA — SISTEMA DE FICHAS
   ========================================================= */

const STORAGE_KEY = "anatema-fichas-v3";

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

const vidaAtualInput = document.getElementById("vidaAtual");
const vidaMaxInput = document.getElementById("vidaMax");
const defesaInput = document.getElementById("defesa");

const vantagensInput = document.getElementById("vantagens");
const anotacoesInput = document.getElementById("anotacoes");

const aflicaoGrid = document.getElementById("aflicaoGrid");
const aptidoesGrid = document.getElementById("aptidoesGrid");

const mochilaGrid = document.getElementById("mochilaGrid");
const btnAdicionarSlot = document.getElementById("btnAdicionarSlot");

const inventarioInputs = document.querySelectorAll("[data-inv]");


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


function criarMochilaInicial() {
    return [
        {
            nome: "",
            descricao: ""
        },
        {
            nome: "",
            descricao: ""
        },
        {
            nome: "",
            descricao: ""
        }
    ];
}


function criarEstadoVazio() {
    return {
        nome: "",
        jogador: "",

        vidaAtual: "",
        vidaMax: "",
        defesa: "",

        aptidoes: criarAptidoesVazias(),

        inventario: {
            maoEsq: "",
            maoDir: "",
            corpo: ""
        },

        mochila: criarMochilaInicial(),

        vantagens: "",
        anotacoes: ""
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

    estado.vidaAtual =
        dados.vidaAtual ?? "";

    estado.vidaMax =
        dados.vidaMax ?? "";

    estado.defesa =
        dados.defesa ?? "";


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


    estado.vantagens =
        typeof dados.vantagens === "string"
            ? dados.vantagens
            : "";

    estado.anotacoes =
        typeof dados.anotacoes === "string"
            ? dados.anotacoes
            : "";


    return estado;
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


/* =========================================================
   NORMALIZAÇÃO DA MOCHILA
   ========================================================= */

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
     *     descricao: "..."
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
                        : ""
            };

        }


        return {
            nome:
                typeof item === "string"
                    ? item
                    : "",

            descricao: ""
        };

    });


    /*
     * Se uma versão antiga possuir menos de 3
     * espaços, completamos para o mínimo atual.
     */

    while (resultado.length < 3) {

        resultado.push({
            nome: "",
            descricao: ""
        });

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

    vidaAtualInput.value =
        dados.vidaAtual;

    vidaMaxInput.value =
        dados.vidaMax;

    defesaInput.value =
        dados.defesa;

    vantagensInput.value =
        dados.vantagens;

    anotacoesInput.value =
        dados.anotacoes;


    for (const input of inventarioInputs) {

        const chave =
            input.dataset.inv;

        input.value =
            dados.inventario[chave] || "";

    }


    renderizarAptidoes(dados);

    renderizarMochila(dados);
}


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

    dados.vidaAtual =
        vidaAtualInput.value;

    dados.vidaMax =
        vidaMaxInput.value;

    dados.defesa =
        defesaInput.value;

    dados.vantagens =
        vantagensInput.value;

    dados.anotacoes =
        anotacoesInput.value;


    for (const input of inventarioInputs) {

        const chave =
            input.dataset.inv;

        dados.inventario[chave] =
            input.value;

    }


    atualizarTituloFicha(ficha);
}


/* =========================================================
   RENDERIZAR APTIDÕES
   ========================================================= */

function renderizarAptidoes(dados) {

    aptidoesGrid.innerHTML = "";

    aflicaoGrid.innerHTML = "";


    for (const aptidao of APTIDOES) {

        criarLinhaAptidao(
            aptidoesGrid,
            aptidao,
            dados.aptidoes[aptidao] || 0
        );

    }


    criarLinhaAptidao(
        aflicaoGrid,
        "Aflição",
        dados.aptidoes["Aflição"] || 0,
        true
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


/* =========================================================
   ALTERAR APTIDÃO
   ========================================================= */

function alterarAptidao(
    nome,
    valorClicado
) {

    const ficha =
        obterFichaAtual();

    if (!ficha) {
        return;
    }


    const atual =
        ficha.dados.aptidoes[nome] || 0;


    /*
     * Se clicar no maior pip atualmente preenchido,
     * reduz um ponto.
     *
     * Caso contrário, vai até o pip clicado.
     */

    if (
        atual === valorClicado
    ) {

        ficha.dados.aptidoes[nome] =
            Math.max(
                0,
                atual - 1
            );

    } else {

        ficha.dados.aptidoes[nome] =
            valorClicado;

    }


    salvarFichas();

    renderizarAptidoes(
        ficha.dados
    );
}


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
                "mochila-slot";


            const numero =
                document.createElement("span");

            numero.className =
                "mochila-number";

            numero.textContent =
                String(indice + 1);


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

            slot.appendChild(nome);

            slot.appendChild(descricao);

            mochilaGrid.appendChild(slot);

        }
    );
}


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


    ficha.dados.mochila.push({
        nome: "",
        descricao: ""
    });


    salvarFichas();

    renderizarMochila(
        ficha.dados
    );


    mostrarStatus(
        "Espaço adicionado à mochila."
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


    /*
     * Mantemos pelo menos 1 espaço.
     * A mochila pode crescer indefinidamente,
     * mas uma mochila completamente inexistente
     * fica um pouco inútil, mesmo para padrões medievais.
     */

    if (mochila.length <= 1) {

        mochila[0] = {
            nome: "",
            descricao: ""
        };

    } else {

        mochila.splice(
            indice,
            1
        );

    }


    salvarFichas();

    renderizarMochila(
        ficha.dados
    );

    mostrarStatus(
        "Espaço removido."
    );
}


/* =========================================================
   EVENTOS DOS CAMPOS
   ========================================================= */

function registrarAutosave(elemento) {

    elemento.addEventListener(
        "input",
        () => {

            salvarEstadoDaInterface();

            salvarFichas();

            atualizarAbasSemTrocar();

        }
    );
}


registrarAutosave(nomeInput);
registrarAutosave(jogadorInput);
registrarAutosave(vidaAtualInput);
registrarAutosave(vidaMaxInput);
registrarAutosave(defesaInput);
registrarAutosave(vantagensInput);
registrarAutosave(anotacoesInput);


for (const input of inventarioInputs) {
    registrarAutosave(input);
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
                "Verifique se ele é um JSON de ficha ANATEMA válido."
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


iniciar();