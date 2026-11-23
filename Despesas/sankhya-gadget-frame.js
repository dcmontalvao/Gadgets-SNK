/*
 * Sankhya Gadget Frame
 * Biblioteca compartilhada para substituir a moldura padrao do gadget Sankhya
 * por um iframe de tela cheia, sem alterar a logica funcional do painel.
 *
 * Arquivo: Despesas/sankhya-gadget-frame.js
 * Versao: 1.0.0
 *
 * API publica:
 *   SankhyaGadgetFrame.iniciar({
 *     montar: function () { ... }, // inicia o painel quando nao houver expansao
 *     nuGdg: undefined,            // opcional; por padrao, le ?nuGdg= da URL
 *     nomeArquivo: undefined,      // opcional; por padrao, le ?entryPoint= da URL
 *     parametros: {},              // parametros adicionais da URL do componente
 *     atrasoMs: 500,
 *     ocultarAviso: true,
 *     intervaloAvisoMs: 400,
 *     overlay: { titulo, mensagem, logoUrl, id }
 *   });
 *
 * A biblioteca nao inicia automaticamente e nao altera o painel ate que
 * SankhyaGadgetFrame.iniciar(...) seja chamado pelo proprio painel.
 */
(function (global, doc) {
    'use strict';

    var VERSAO = '1.0.0';
    var NOME_FRAME = 'botuvera-expandido';
    var ID_OVERLAY_PADRAO = 'overlay-externo';

    function obterDocumento(janela) {
        try {
            return janela && janela.document ? janela.document : null;
        } catch (erro) {
            return null;
        }
    }

    function obterParametroUrl(nome) {
        try {
            var params = new URLSearchParams(global.location.search || '');
            return params.get(nome);
        } catch (erro) {
            var busca = String(global.location.search || '').replace(/^\?/, '').split('&');
            for (var i = 0; i < busca.length; i++) {
                var partes = busca[i].split('=');
                if (decodeURIComponent(partes[0] || '') === nome) {
                    return decodeURIComponent((partes.slice(1).join('=') || '').replace(/\+/g, ' '));
                }
            }
            return null;
        }
    }

    function obterJanelaRaiz(janela) {
        var topo = janela || global;
        for (var nivel = 0; nivel < 10; nivel++) {
            try {
                if (!topo.parent || topo.parent === topo) break;
                if (!obterDocumento(topo.parent)) break;
                topo = topo.parent;
            } catch (erro) {
                break;
            }
        }
        return topo;
    }

    /*
     * Esconde o rodape "Voce esta em uma tela personalizada" do workspace.
     * O proprio container e ocultado para nao deixar uma faixa vazia.
     * Quando o gadget sai da tela, o rodape original e restaurado.
     */
    function ocultarAvisoTelaPersonalizada(opcoes) {
        opcoes = opcoes || {};

        try {
            if (global.__sankhyaGadgetFrameAviso &&
                global.__sankhyaGadgetFrameAviso.ativo) {
                return { ocultado: true, existente: true };
            }

            var intervaloMs = Number(opcoes.intervaloMs);
            if (!intervaloMs || intervaloMs < 100) intervaloMs = 400;

            var topo = obterJanelaRaiz(global);
            var documentoTopo = obterDocumento(topo);
            if (!documentoTopo) {
                return { ocultado: false, motivo: 'Documento principal indisponivel.' };
            }

            var aviso = documentoTopo.getElementById('avisoTelaPersonalizada');
            if (!aviso) {
                return {
                    ocultado: false,
                    motivo: 'Aviso de tela personalizada nao encontrado (fora do workspace).'
                };
            }

            var rodape = aviso;
            while (rodape.parentElement &&
                !rodape.parentElement.querySelector(':scope > .Taskbar-container')) {
                rodape = rodape.parentElement;
            }

            var pai = rodape.parentElement;
            if (!pai) {
                return { ocultado: false, motivo: 'Rodape do workspace nao localizado.' };
            }

            var alturaRodape = Math.round(rodape.getBoundingClientRect().height);
            var filhos = Array.prototype.slice.call(pai.children);
            var area = null;

            for (var i = 0; i < filhos.length; i++) {
                var filho = filhos[i];
                if (filho !== rodape &&
                    !filho.classList.contains('Taskbar-container') &&
                    filho.style.bottom === alturaRodape + 'px') {
                    area = filho;
                    break;
                }
            }

            if (!area) {
                return { ocultado: false, motivo: 'Area de conteudo do workspace nao localizada.' };
            }

            var displayOriginal = rodape.style.display;
            var bottomOriginal = area.style.bottom;
            var visivel = true;
            var escondido = false;
            var observador = null;
            var temporizador = null;
            var encerrado = false;

            function aplicar() {
                rodape.style.display = 'none';
                area.style.bottom = '0px';
            }

            function restaurar() {
                rodape.style.display = displayOriginal;
                area.style.bottom = bottomOriginal;
            }

            function sincronizar() {
                if (encerrado) return;

                if (visivel && (!escondido ||
                    area.style.bottom !== '0px' ||
                    rodape.style.display !== 'none')) {
                    aplicar();
                    escondido = true;
                } else if (!visivel && escondido) {
                    restaurar();
                    escondido = false;
                }
            }

            function finalizar() {
                if (encerrado) return;
                encerrado = true;

                if (temporizador !== null) {
                    global.clearInterval(temporizador);
                    temporizador = null;
                }
                if (observador) {
                    observador.disconnect();
                    observador = null;
                }
                if (escondido) {
                    restaurar();
                    escondido = false;
                }

                if (global.__sankhyaGadgetFrameAviso) {
                    global.__sankhyaGadgetFrameAviso.ativo = false;
                }
            }

            if (typeof global.IntersectionObserver === 'function') {
                observador = new global.IntersectionObserver(function (entradas) {
                    if (!entradas || !entradas.length) return;
                    visivel = entradas[entradas.length - 1].isIntersecting;
                    sincronizar();
                });
                observador.observe(doc.documentElement);
            }

            temporizador = global.setInterval(sincronizar, intervaloMs);
            global.addEventListener('pagehide', finalizar, { once: true });

            global.__sankhyaGadgetFrameAviso = {
                ativo: true,
                finalizar: finalizar
            };

            sincronizar();
            return { ocultado: true };
        } catch (erro) {
            return { ocultado: false, motivo: 'Sem acesso a janela principal.' };
        }
    }

    /*
     * Cria um overlay no documento do workspace (quando acessivel), cobrindo
     * visualmente o intervalo entre a chamada e a criacao do iframe expandido.
     */
    function criarOverlayExterno(opcoes) {
        opcoes = opcoes || {};

        function obterDocumentoAlvo(janelaAlvo) {
            return obterDocumento(janelaAlvo);
        }

        var janela = opcoes.janela || global;
        var documentoPai = obterDocumentoAlvo(janela.parent);
        var documento = documentoPai && documentoPai.body ? documentoPai : obterDocumentoAlvo(janela);

        if (!documento || !documento.body) {
            throw new Error('Nao foi possivel acessar o documento para exibir o overlay.');
        }

        var id = opcoes.id || ID_OVERLAY_PADRAO;
        var overlayExistente = documento.getElementById(id);

        if (overlayExistente) {
            return criarControleOverlay(overlayExistente, documento, janela);
        }

        var overlay = documento.createElement('div');
        overlay.id = id;
        overlay.setAttribute('role', 'status');
        overlay.setAttribute('aria-live', 'polite');

        Object.assign(overlay.style, {
            position: 'fixed',
            inset: '0',
            zIndex: '2147483647',
            display: 'grid',
            placeItems: 'center',
            background: '#ffffff',
            color: '#00341c',
            fontFamily: 'Arial, sans-serif',
            opacity: '1',
            transition: 'opacity 180ms ease-out'
        });

        var corpo = documento.createElement('div');
        Object.assign(corpo.style, {
            display: 'grid',
            justifyItems: 'center',
            gap: '14px',
            textAlign: 'center'
        });

        if (typeof opcoes.montarCorpo === 'function') {
            opcoes.montarCorpo({
                documento: documento,
                corpo: corpo,
                overlay: overlay
            });
        } else {
            if (opcoes.logoUrl) {
                var logo = documento.createElement('img');
                logo.src = opcoes.logoUrl;
                logo.alt = '';
                logo.setAttribute('aria-hidden', 'true');
                Object.assign(logo.style, {
                    width: '58px',
                    height: '68px',
                    objectFit: 'contain'
                });
                corpo.appendChild(logo);
            }

            var tituloElemento = documento.createElement('strong');
            tituloElemento.textContent = opcoes.titulo || 'Carregando...';
            tituloElemento.style.fontSize = '22px';

            var spinner = documento.createElement('span');
            Object.assign(spinner.style, {
                width: '24px',
                height: '24px',
                border: '3px solid #eff5e7',
                borderTopColor: '#00642c',
                borderRadius: '50%',
                animation: 'sankhya-gadget-frame-girar 0.8s linear infinite'
            });

            var mensagemElemento = documento.createElement('span');
            mensagemElemento.setAttribute('data-mensagem-overlay', '1');
            mensagemElemento.textContent = opcoes.mensagem || 'Aguarde um momento.';

            corpo.appendChild(tituloElemento);
            corpo.appendChild(spinner);
            corpo.appendChild(mensagemElemento);
        }

        var estilo = documento.createElement('style');
        estilo.textContent =
            '@keyframes sankhya-gadget-frame-girar {' +
            'to { transform: rotate(360deg); }' +
            '}';

        overlay.appendChild(corpo);
        overlay.appendChild(estilo);
        documento.body.appendChild(overlay);

        return criarControleOverlay(overlay, documento, janela);
    }

    function criarControleOverlay(overlay, documento, janela) {
        return {
            elemento: overlay,

            remover: function (opcoes) {
                opcoes = opcoes || {};
                var atrasoMs = opcoes.atrasoMs;
                if (atrasoMs === undefined) atrasoMs = 180;

                overlay.style.opacity = '0';
                overlay.style.pointerEvents = 'none';

                janela.setTimeout(function () {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                }, atrasoMs);
            },

            atualizarMensagem: function (novaMensagem) {
                var mensagemElemento = overlay.querySelector('[data-mensagem-overlay]');
                if (mensagemElemento) mensagemElemento.textContent = String(novaMensagem);
            }
        };
    }

    function normalizarNuGdg(valor) {
        var numero = Number(valor);
        return Number.isInteger(numero) && numero >= 0 ? numero : null;
    }

    function encontrarGadgetPai() {
        var janelaAtual = global;

        for (var nivel = 0; nivel < 10; nivel++) {
            var janelaPai;

            try {
                janelaPai = janelaAtual.parent;
            } catch (erro) {
                return null;
            }

            if (!janelaPai || janelaPai === janelaAtual) return null;

            var documentoPai = obterDocumento(janelaPai);
            if (!documentoPai) return null;

            var gadget = documentoPai.querySelector('.dyna-gadget');
            var dashWindow = documentoPai.querySelector('.DashWindow');

            if (gadget && dashWindow) {
                return {
                    documento: documentoPai,
                    gadget: gadget,
                    dashWindow: dashWindow
                };
            }

            janelaAtual = janelaPai;
        }

        return null;
    }

    function recriarFrameDoGadget(opcoes) {
        opcoes = opcoes || {};

        return new Promise(function (resolve, reject) {
            try {
                var ocultarAviso = opcoes.ocultarAviso !== false;

                /*
                 * A pagina carrega novamente dentro do iframe expandido.
                 * O nome identifica essa segunda execucao e evita um ciclo
                 * infinito de substituicao de iframe.
                 */
                if (global.name === NOME_FRAME) {
                    if (ocultarAviso) {
                        ocultarAvisoTelaPersonalizada({
                            intervaloMs: opcoes.intervaloAvisoMs
                        });
                    }
                    resolve({
                        atualizado: false,
                        motivo: 'O gadget ja esta expandido.'
                    });
                    return;
                }

                var nuGdgResolvido = normalizarNuGdg(opcoes.nuGdg);
                if (nuGdgResolvido === null) {
                    reject(new Error('Informe um nuGdg inteiro valido.'));
                    return;
                }

                if (!opcoes.nomeArquivo || typeof opcoes.nomeArquivo !== 'string') {
                    reject(new Error('Informe o nome do JSP em nomeArquivo.'));
                    return;
                }

                var destino = encontrarGadgetPai();
                if (!destino) {
                    reject(new Error(
                        'Nao foi possivel localizar a DashWindow e o dyna-gadget no contexto atual.'
                    ));
                    return;
                }

                var camposReservados = [
                    'entrypoint', 'nugdg', 'params', 'parametros',
                    'uid', 'instance', 'instancia', 'gadgetid'
                ];

                var query = new URLSearchParams();
                query.set('entryPoint', opcoes.nomeArquivo);
                query.set('nuGdg', String(nuGdgResolvido));

                var parametros = opcoes.parametros || {};
                Object.keys(parametros).forEach(function (chave) {
                    if (camposReservados.indexOf(chave.toLowerCase()) >= 0) return;
                    if (parametros[chave] === null || parametros[chave] === undefined) return;
                    query.set(chave, String(parametros[chave]));
                });

                var url = '/mge/html5component.mge?' + query.toString();
                destino.documento.body.style.overflow = 'hidden';

                var alerta = destino.documento.querySelector(
                    'div.gwt-PopupPanel.alert-box.box-shadow'
                );
                if (alerta) alerta.style.display = 'none';

                var atrasoMs = Number(opcoes.atrasoMs);
                if (!atrasoMs || atrasoMs < 0) atrasoMs = 500;

                global.setTimeout(function () {
                    try {
                        var iframe = destino.documento.createElement('iframe');
                        iframe.src = url;
                        iframe.name = NOME_FRAME;
                        iframe.className = 'gwt-Frame';
                        iframe.style.width = '100%';
                        iframe.style.height = '100%';
                        iframe.style.border = '0';

                        if (typeof destino.gadget.replaceChildren === 'function') {
                            destino.gadget.replaceChildren(iframe);
                        } else {
                            while (destino.gadget.firstChild) {
                                destino.gadget.removeChild(destino.gadget.firstChild);
                            }
                            destino.gadget.appendChild(iframe);
                        }

                        resolve({
                            atualizado: true,
                            nuGdg: nuGdgResolvido,
                            nomeArquivo: opcoes.nomeArquivo,
                            url: url
                        });
                    } catch (erroSubstituicao) {
                        reject(erroSubstituicao);
                    }
                }, atrasoMs);
            } catch (erro) {
                reject(erro);
            }
        });
    }

    function expandirGadget(opcoes) {
        opcoes = opcoes || {};

        try {
            var nuGdg = opcoes.nuGdg;
            if (nuGdg === undefined || nuGdg === null || nuGdg === '') {
                nuGdg = obterParametroUrl('nuGdg');
            }

            var arquivo = opcoes.nomeArquivo;
            if (!arquivo) {
                arquivo = obterParametroUrl('entryPoint') || '';
            }
            arquivo = String(arquivo).replace(/^\.\//, '');

            var overlayOpcoes = opcoes.overlay || {};
            var overlay = criarOverlayExterno({
                id: overlayOpcoes.id || ID_OVERLAY_PADRAO,
                titulo: overlayOpcoes.titulo || 'Carregando...',
                mensagem: overlayOpcoes.mensagem || 'Aguarde um momento.',
                logoUrl: overlayOpcoes.logoUrl || '',
                montarCorpo: overlayOpcoes.montarCorpo
            });

            return recriarFrameDoGadget({
                nuGdg: nuGdg,
                nomeArquivo: arquivo,
                parametros: opcoes.parametros || {},
                atrasoMs: opcoes.atrasoMs,
                ocultarAviso: opcoes.ocultarAviso,
                intervaloAvisoMs: opcoes.intervaloAvisoMs
            }).then(function (resultado) {
                if (!resultado || !resultado.atualizado) {
                    overlay.remover();
                    return false;
                }
                return true;
            }, function () {
                overlay.remover();
                return false;
            });
        } catch (erro) {
            return Promise.resolve(false);
        }
    }

    /*
     * Ponto de entrada para os paineis.
     * - Se estiver dentro do gadget do Sankhya, substitui a moldura e aguarda
     *   o novo iframe executar a mesma biblioteca.
     * - Se ja estiver expandido ou estiver fora do workspace, chama montar().
     *
     * Retorna Promise<boolean>: true quando iniciou a expansao; false quando
     * deve seguir com a montagem normal do painel.
     */
    function iniciar(opcoes) {
        opcoes = opcoes || {};

        return expandirGadget(opcoes).then(function (expandido) {
            if (!expandido && typeof opcoes.montar === 'function') {
                opcoes.montar();
            }
            return expandido;
        });
    }

    global.SankhyaGadgetFrame = {
        versao: VERSAO,
        iniciar: iniciar
    };

})(window, document);
