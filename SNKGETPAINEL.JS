/**
 * Consulta as credenciais de um painel no Google Apps Script.
 * Nenhum token GitHub ou chave de acesso fica gravado neste arquivo.
 *
 * Uso: const painel = await SNKGETPAINEL(ID_DEPLOY_APPS_SCRIPT, CHAVE_ACESSO);
 * Retorno (chave válida): { GITHUB_TOKEN: '...', P_LINK_GIT: '...' }
 * Retorno (chave inválida ou painel inativo): null
 *
 * OBS: credenciais retornadas ao navegador são visíveis ao usuário do navegador.
 */
async function SNKGETPAINEL(S_URL, CHAVE_ACESSO) {
    'use strict';

    var idAppScript = String(S_URL || '').trim();
    var chave = String(CHAVE_ACESSO || '').trim();

    if (!idAppScript || !chave) {
        return null;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(idAppScript)) {
        throw new Error('[SNKGETPAINEL] ID do Apps Script inválido.');
    }

    var origem = window.location.origin;
    var identificador = 'snkgetpainel_' + Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(function (n) { return n.toString(16).padStart(2, '0'); }).join('');
    var url = 'https://script.google.com/macros/s/' + encodeURIComponent(idAppScript) + '/exec';

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

        function finalizar(erro, valor) {
            if (encerrado) return;
            encerrado = true;
            limpar();
            if (erro) reject(erro);
            else resolve(valor);
        }

        function receber(evento) {
            // HtmlService usa origem googleusercontent.com dentro de um iframe do Google.
            var permitido = evento.origin === 'https://script.google.com' ||
                /^https:\/\/[a-z0-9.-]+\.googleusercontent\.com$/i.test(evento.origin);
            if (!permitido) return;
            var msg = evento.data;
            if (!msg || msg.tipo !== 'SNKGETPAINEL_RESULT' || msg.id !== identificador) return;
            var dados = msg.dados;
            if (dados === null) return finalizar(null, null);
            if (!dados || typeof dados.GITHUB_TOKEN !== 'string' ||
                    typeof dados.P_LINK_GIT !== 'string') {
                return finalizar(new Error('[SNKGETPAINEL] Resposta inválida do Apps Script.'));
            }
            finalizar(null, { GITHUB_TOKEN: dados.GITHUB_TOKEN, P_LINK_GIT: dados.P_LINK_GIT });
        }

        function campo(nome, valor) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = nome;
            input.value = valor;
            form.appendChild(input);
        }

        frame.name = identificador;
        frame.setAttribute('aria-hidden', 'true');
        frame.style.cssText = 'display:none;width:0;height:0;border:0;';
        form.method = 'POST';
        form.action = url;
        form.target = identificador;
        form.style.display = 'none';
        campo('chave', chave);
        campo('origem', origem);
        campo('requisicao', identificador);
        window.addEventListener('message', receber);
        document.body.appendChild(frame);
        document.body.appendChild(form);
        timer = window.setTimeout(function () {
            finalizar(new Error('[SNKGETPAINEL] Sem resposta do Apps Script (30 segundos).'));
        }, 30000);
        try { form.submit(); }
        catch (erro) { finalizar(erro); }
    });
}
