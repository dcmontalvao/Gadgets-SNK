/**
 * SNKGETPAINEL — consulta um painel no Apps Script vinculado à planilha.
 *
 * Uso (dentro de função async ou <script type="module">):
 *   const painel = await SNKGETPAINEL(ID_APPS_SCRIPT, CHAVE_ACESSO);
 *
 * Chave não encontrada/inativa: null.
 * Encontrada: { GITHUB_TOKEN, P_LINK_GIT }.
 * Nenhuma credencial está embutida neste arquivo.
 *
 * O Apps Script precisa disponibilizar um doPost compatível com o arquivo
 * SNKGETPAINEL.gs, que retorna a resposta via postMessage.
 */
async function SNKGETPAINEL(S_URL, CHAVE_ACESSO) {
    'use strict';

    var idAppScript = String(S_URL == null ? '' : S_URL).trim();
    var chave = String(CHAVE_ACESSO == null ? '' : CHAVE_ACESSO).trim();

    if (!idAppScript || !chave) return null;

    // Aceita o ID da implantação, exatamente como em SNKGETTOKEN.
    if (!/^[A-Za-z0-9_-]+$/.test(idAppScript)) {
        throw new Error('[SNKGETPAINEL] ID da implantação inválido.');
    }
    if (!document || !window || !window.location || !window.location.origin) {
        throw new Error('[SNKGETPAINEL] Ambiente de navegador indisponível.');
    }

    // Identifica a resposta desta execução para não misturar chamadas paralelas.
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    var requisicao = 'snkgetpainel_' + Array.from(bytes, function (n) {
        return n.toString(16).padStart(2, '0');
    }).join('');
    var origem = window.location.origin;
    var url = 'https://script.google.com/macros/s/' + idAppScript + '/exec';

    if (!document.body) {
        await new Promise(function (resolve) {
            document.addEventListener('DOMContentLoaded', resolve, { once: true });
        });
    }

    return new Promise(function (resolve, reject) {
        var frame = document.createElement('iframe');
        var form = document.createElement('form');
        var timer;
        var encerrado = false;

        function limpar() {
            window.clearTimeout(timer);
            window.removeEventListener('message', receber);
            if (form.parentNode) form.parentNode.removeChild(form);
            if (frame.parentNode) frame.parentNode.removeChild(frame);
        }

        function finalizar(erro, resultado) {
            if (encerrado) return;
            encerrado = true;
            limpar();
            if (erro) reject(erro);
            else resolve(resultado);
        }

        function receber(evento) {
            // O HtmlService do Apps Script envia mensagens de um host Google.
            var google = evento.origin === 'https://script.google.com' ||
                /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/i.test(evento.origin);
            if (!google) return;

            var mensagem = evento.data;
            if (!mensagem || mensagem.tipo !== 'SNKGETPAINEL_RESULT' ||
                    mensagem.id !== requisicao) return;

            if (mensagem.dados == null) {
                finalizar(null, null);
                return;
            }

            var dados = mensagem.dados;
            if (typeof dados !== 'object' ||
                typeof dados.GITHUB_TOKEN !== 'string' ||
                typeof dados.P_LINK_GIT !== 'string') {
                finalizar(new Error('[SNKGETPAINEL] Resposta inválida do Apps Script.'));
                return;
            }

            // Somente os dois campos solicitados; nada é gravado em window/localStorage.
            finalizar(null, {
                GITHUB_TOKEN: dados.GITHUB_TOKEN,
                P_LINK_GIT: dados.P_LINK_GIT
            });
        }

        function adicionarCampo(nome, valor) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = nome;
            input.value = valor;
            form.appendChild(input);
        }

        frame.name = requisicao;
        frame.setAttribute('aria-hidden', 'true');
        frame.style.cssText = 'display:none;width:0;height:0;border:0';
        form.action = url;
        form.method = 'POST';
        form.target = requisicao;
        form.style.display = 'none';
        adicionarCampo('chave', chave);
        adicionarCampo('origem', origem);
        adicionarCampo('requisicao', requisicao);

        window.addEventListener('message', receber);
        document.body.appendChild(frame);
        document.body.appendChild(form);

        timer = window.setTimeout(function () {
            finalizar(new Error('[SNKGETPAINEL] Apps Script não respondeu em 30 segundos.'));
        }, 30000);

        try {
            form.submit();
        } catch (erro) {
            finalizar(erro);
        }
    });
}
