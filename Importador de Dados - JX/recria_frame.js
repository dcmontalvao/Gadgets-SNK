async function recriarFrameDoGadget({
    nuGdg,
    nomeArquivo,
    parametros = {},
    atrasoMs = 500
} = {}) {

    const obterDocumento = function (janela) {
        try {
            return janela && janela.document
                ? janela.document
                : null
        } catch (_) {
            return null
        }
    }

    const normalizarNuGdg = function (valor) {
        const numero = Number(valor)

        return Number.isInteger(numero) && numero >= 0
            ? numero
            : null
    }

    const encontrarGadgetPai = function () {

        let janelaAtual = window

        for (let nivel = 0; nivel < 10; nivel += 1) {

            const janelaPai = janelaAtual.parent

            if (!janelaPai || janelaPai === janelaAtual) {
                return null
            }

            const documentoPai =
                obterDocumento(janelaPai)

            const gadget =
                documentoPai?.querySelector(".dyna-gadget")

            const dashWindow =
                documentoPai?.querySelector(".DashWindow")

            if (gadget && dashWindow) {
                return {
                    documento: documentoPai,
                    gadget,
                    dashWindow
                }
            }

            janelaAtual = janelaPai
        }

        return null
    }

    const nuGdgResolvido =
        normalizarNuGdg(nuGdg)

    if (nuGdgResolvido == null) {
        throw new Error(
            "Informe um nuGdg inteiro válido."
        )
    }

    if (
        !nomeArquivo ||
        typeof nomeArquivo !== "string"
    ) {
        throw new Error(
            "Informe o nome do JSP em nomeArquivo."
        )
    }

    const destino =
        encontrarGadgetPai()

    if (!destino) {
        throw new Error(
            "Não foi possível localizar a DashWindow e o dyna-gadget no contexto atual."
        )
    }

    /*
     * =========================================================
     * PEGA A URL REAL DO HTML5 COMPONENT
     *
     * NÃO usa iframe.src.
     *
     * No Sankhya o iframe pode ter:
     *
     * iframe.src = "javascript:''"
     *
     * enquanto o documento dentro dele possui a URL real.
     * =========================================================
     */

    const urlAtual =
        new URL(
            window.location.href
        )

    /*
     * =========================================================
     * GARANTE OS PARÂMETROS PRINCIPAIS
     * =========================================================
     */

    urlAtual.searchParams.set(
        "entryPoint",
        nomeArquivo
    )

    urlAtual.searchParams.set(
        "nuGdg",
        String(nuGdgResolvido)
    )

    /*
     * =========================================================
     * ADICIONA / ATUALIZA PARÂMETROS EXTRAS
     * =========================================================
     */

    if (
        parametros &&
        typeof parametros === "object"
    ) {

        Object.entries(parametros).forEach(
            ([chave, valor]) => {

                if (
                    valor === null ||
                    valor === undefined
                ) {
                    return
                }

                urlAtual.searchParams.set(
                    chave,
                    String(valor)
                )
            }
        )
    }

    const url =
        urlAtual.pathname +
        "?" +
        urlAtual.searchParams.toString()

    console.log(
        "[HTML5] URL REAL:",
        window.location.href
    )

    console.log(
        "[HTML5] URL RECRIADA:",
        url
    )

    /*
     * =========================================================
     * PREPARAÇÃO
     * =========================================================
     */

    destino.documento.body.style.overflow =
        "hidden"

    const alerta =
        destino.documento.querySelector(
            "div.gwt-PopupPanel.alert-box.box-shadow"
        )

    if (alerta) {
        alerta.style.display = "none"
    }

    /*
     * =========================================================
     * AGUARDA
     * =========================================================
     */

    await new Promise(function (resolve) {
        setTimeout(
            resolve,
            atrasoMs
        )
    })

    /*
     * =========================================================
     * CRIA O NOVO IFRAME
     * =========================================================
     */

    const iframe =
        destino.documento.createElement(
            "iframe"
        )

    iframe.src =
        url

    iframe.className =
        "gwt-Frame"

    iframe.style.width =
        "100%"

    iframe.style.height =
        "100%"

    iframe.style.border =
        "0"

    /*
     * =========================================================
     * TROCA O FRAME
     * =========================================================
     *
     * O replaceChildren remove o iframe antigo e coloca
     * somente o novo.
     * =========================================================
     */

    destino.gadget.replaceChildren(
        iframe
    )

    return {
        atualizado: true,
        nuGdg: nuGdgResolvido,
        nomeArquivo,
        url
    }
}