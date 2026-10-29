function executarGitHub(P_LINK_GIT , BASE_FOLDER  , GITHUB_TOKEN ) {
    'use strict';

    var RAW_URL = String(typeof P_LINK_GIT !== 'undefined' ? P_LINK_GIT : '').trim();
    var PASTA_RAW = '';
    var REPO_RAW = '';
    var BASE_FOLDER_ABSOLUTO = '';
    var MARCADOR_BASE_FOLDER = '$' + '{BASE_FOLDER}';

    function tokenGitHubConfigurado() {
        var token = String(typeof GITHUB_TOKEN !== 'undefined' ? GITHUB_TOKEN : '').trim();

        return token &&
               token !== 'COLE_SEU_TOKEN_AQUI' &&
               token.indexOf('COLE_') !== 0;
    }

    function analisarUrlGitHub(url) {
        var valor = removerQueryHash(String(url || '').trim());
        var match;

        match = valor.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/refs\/heads\/([^/]+)\/(.+)$/i);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                ref: match[3],
                path: match[4]
            };
        }

        match = valor.match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(.+)$/i);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                ref: match[3],
                path: match[4]
            };
        }

        match = valor.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
        if (match) {
            return {
                owner: match[1],
                repo: match[2],
                ref: match[3],
                path: match[4]
            };
        }

        return null;
    }

    function codificarCaminhoGitHub(caminho) {
        return String(caminho || '')
            .split('/')
            .map(function (parte) {
                return encodeURIComponent(parte);
            })
            .join('/');
    }

    function montarUrlApiConteudo(info) {
        if (!info) {
            return '';
        }

        return 'https://api.github.com/repos/' +
               encodeURIComponent(info.owner) + '/' +
               encodeURIComponent(info.repo) + '/contents/' +
               codificarCaminhoGitHub(info.path) +
               '?ref=' + encodeURIComponent(info.ref);
    }

    function montarHeadersGitHub(accept) {
        var headers = {
            'Accept': accept || 'application/vnd.github.raw+json'
        };

        if (tokenGitHubConfigurado()) {
            headers.Authorization = 'Bearer ' + String(typeof GITHUB_TOKEN !== 'undefined' ? GITHUB_TOKEN : '').trim();
        }

        return headers;
    }

    async function baixarTextoGitHub(url, tipo, acceptPublico) {
        var info = analisarUrlGitHub(url);
        var autenticado = tokenGitHubConfigurado() && !!info;
        var urlRequisicao = autenticado ? montarUrlApiConteudo(info) : adicionarCacheBuster(url);
        var headers = autenticado
            ? montarHeadersGitHub('application/vnd.github.raw+json')
            : {
                'Accept': acceptPublico || '*/*'
            };

        var resposta = await fetch(urlRequisicao, {
            method: 'GET',
            cache: 'no-store',
            mode: 'cors',
            credentials: 'omit',
            redirect: 'follow',
            headers: headers
        });

        if (!resposta.ok) {
            throw new Error(
                (tipo || 'Recurso') + ' respondeu HTTP ' +
                resposta.status + ' (' + resposta.statusText + '): ' + url +
                (autenticado ? ' [GitHub API autenticada]' : '')
            );
        }

        return await resposta.text();
    }

    function removerQueryHash(url) {
        return String(url || '').split('#')[0].split('?')[0];
    }

    function normalizarUrlPrincipal(url) {
        var valor = String(url || '').trim();
        var match;

        if (!valor) {
            return valor;
        }

        match = valor.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/i);
        if (match) {
            return 'https://raw.githubusercontent.com/' + match[1] + '/' + match[2] + '/' + match[3];
        }

        return valor;
    }

    function obterRaizRepositorio(url) {
        var match = String(url || '').match(/^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\//i);

        if (!match) {
            return '';
        }

        return 'https://raw.githubusercontent.com/' + match[1] + '/' + match[2] + '/';
    }

    function garantirBarraFinal(valor) {
        var texto = String(valor || '');

        if (!texto) {
            return texto;
        }

        return texto.charAt(texto.length - 1) === '/' ? texto : texto + '/';
    }

    function removerBarrasFinais(valor) {
        return String(valor || '').replace(/\/+$/, '');
    }

    function montarBaseFolderAbsoluto() {
        var pasta = String(typeof BASE_FOLDER !== 'undefined' ? BASE_FOLDER : '').trim();

        if (!pasta) {
            return '';
        }

        try {
            return removerBarrasFinais(new URL(garantirBarraFinal(pasta), window.location.href).href);
        } catch (erro) {
            console.warn('[Executor GitHub] Não foi possível tornar BASE_FOLDER absoluto:', pasta, erro);
            return removerBarrasFinais(pasta);
        }
    }

    function aplicarBaseFolder(conteudo) {
        var texto = String(conteudo || '');

        if (!MARCADOR_BASE_FOLDER || texto.indexOf(MARCADOR_BASE_FOLDER) < 0) {
            return texto;
        }

        if (!BASE_FOLDER_ABSOLUTO) {
            console.warn('[Executor GitHub] BASE_FOLDER está vazio. O marcador será mantido:', MARCADOR_BASE_FOLDER);
            return texto;
        }

        return texto.split(MARCADOR_BASE_FOLDER).join(BASE_FOLDER_ABSOLUTO);
    }

    function ehUrlBaseFolder(url) {
        var valor = removerQueryHash(String(url || ''));
        var pasta = removerQueryHash(BASE_FOLDER_ABSOLUTO);

        if (!pasta) {
            return false;
        }

        return valor === pasta || valor.indexOf(pasta + '/') === 0;
    }

    function resolverUrlLocal(valor, baseUrl) {
        var original = aplicarBaseFolder(String(valor || '').trim());
        var semBarras;

        if (!original) {
            return original;
        }

        if (/^(?:data:|blob:|javascript:|mailto:|tel:|#)/i.test(original)) {
            return original;
        }

        if (/^https?:\/\//i.test(original)) {
            return original;
        }

        if (/^\/\//.test(original)) {
            return window.location.protocol + original;
        }

        if (BASE_FOLDER_ABSOLUTO) {
            semBarras = original.replace(/^\/+/, '');

            if (semBarras.indexOf(String(typeof BASE_FOLDER !== 'undefined' ? BASE_FOLDER : '').replace(/^\/+/, '')) === 0) {
                try {
                    return new URL(original, window.location.href).href;
                } catch (erroBase) {
                    console.warn('[Executor GitHub] Falha ao resolver recurso do BASE_FOLDER:', original, erroBase);
                    return original;
                }
            }
        }

        if (original.charAt(0) === '/') {
            return new URL(original.replace(/^\/+/, ''), PASTA_RAW).href;
        }

        return new URL(original, baseUrl || PASTA_RAW).href;
    }

    function ehArquivoDoRepositorio(url) {
        var valor = String(url || '');

        if (!REPO_RAW) {
            return false;
        }

        return valor.indexOf(REPO_RAW) === 0;
    }

    function adicionarCacheBuster(url) {
        var separador = String(url || '').indexOf('?') >= 0 ? '&' : '?';
        return url + separador + 'executor_cache=' + Date.now();
    }

    async function baixarRecurso(url, tipo) {
        return await baixarTextoGitHub(url, tipo, '*/*');
    }

    function ajustarUrlsCss(css, cssUrl) {
        var conteudo = aplicarBaseFolder(String(css || ''));

        conteudo = conteudo.replace(
            /url\(\s*(['"]?)([^'"\)]+)\1\s*\)/gi,
            function (match, aspas, valor) {
                var caminho = String(valor || '').trim();

                if (!caminho || /^(?:data:|blob:|https?:|\/\/|#)/i.test(caminho)) {
                    return match;
                }

                return 'url("' + resolverUrlLocal(caminho, cssUrl) + '")';
            }
        );

        conteudo = conteudo.replace(
            /@import\s+(['"])([^'"]+)\1/gi,
            function (match, aspas, valor) {
                var caminho = String(valor || '').trim();

                if (!caminho || /^(?:data:|blob:|https?:|\/\/|#)/i.test(caminho)) {
                    return match;
                }

                return '@import "' + resolverUrlLocal(caminho, cssUrl) + '"';
            }
        );

        return conteudo;
    }

    function ajustarSrcset(valor, baseUrl) {
        return aplicarBaseFolder(String(valor || ''))
            .split(',')
            .map(function (item) {
                var parte = item.trim();
                var pedacos;

                if (!parte) {
                    return parte;
                }

                pedacos = parte.split(/\s+/);
                pedacos[0] = resolverUrlLocal(pedacos[0], baseUrl);
                return pedacos.join(' ');
            })
            .join(', ');
    }

    async function normalizarHtml(html) {
        var conteudo = aplicarBaseFolder(String(html || '').replace(/^\uFEFF/, ''));
        var parser;
        var doc;
        var baseTag;
        var folhasEstilo;
        var scripts;
        var i;
        var link;
        var hrefOriginal;
        var hrefResolvido;
        var css;
        var style;
        var script;
        var srcOriginal;
        var srcResolvido;
        var codigo;

        if (!conteudo.trim()) {
            throw new Error('O GitHub retornou um arquivo HTML vazio.');
        }

        if (!/<html[\s>]/i.test(conteudo)) {
            throw new Error('O conteúdo principal recebido não parece ser um HTML válido.');
        }

        parser = new DOMParser();
        doc = parser.parseFromString(conteudo, 'text/html');

        if (!doc || !doc.documentElement) {
            throw new Error('Não foi possível interpretar o HTML principal recebido do GitHub.');
        }

        baseTag = doc.querySelector('base');

        if (!baseTag) {
            baseTag = doc.createElement('base');

            if (doc.head.firstChild) {
                doc.head.insertBefore(baseTag, doc.head.firstChild);
            } else {
                doc.head.appendChild(baseTag);
            }
        }

        baseTag.setAttribute('href', PASTA_RAW);

        doc.querySelectorAll('img[src], source[src], video[src], audio[src], iframe[src], input[src], embed[src], object[data]').forEach(function (el) {
            var atributo = el.hasAttribute('data') && el.tagName.toLowerCase() === 'object' ? 'data' : 'src';
            var valor = el.getAttribute(atributo);

            if (valor) {
                el.setAttribute(atributo, resolverUrlLocal(valor, PASTA_RAW));
            }
        });

        doc.querySelectorAll('[poster]').forEach(function (el) {
            el.setAttribute('poster', resolverUrlLocal(el.getAttribute('poster'), PASTA_RAW));
        });

        doc.querySelectorAll('[srcset]').forEach(function (el) {
            el.setAttribute('srcset', ajustarSrcset(el.getAttribute('srcset'), PASTA_RAW));
        });

        doc.querySelectorAll('a[href], form[action]').forEach(function (el) {
            var atributo = el.hasAttribute('action') ? 'action' : 'href';
            var valor = el.getAttribute(atributo);

            if (!valor || /^(?:javascript:|mailto:|tel:|#)/i.test(valor)) {
                return;
            }

            if (valor.indexOf(MARCADOR_BASE_FOLDER) >= 0) {
                el.setAttribute(atributo, resolverUrlLocal(valor, PASTA_RAW));
            }
        });

        folhasEstilo = Array.from(doc.querySelectorAll('link[rel~="stylesheet"][href]'));

        for (i = 0; i < folhasEstilo.length; i++) {
            link = folhasEstilo[i];
            hrefOriginal = link.getAttribute('href');
            hrefResolvido = resolverUrlLocal(hrefOriginal, PASTA_RAW);

            if (ehUrlBaseFolder(hrefResolvido)) {
                link.setAttribute('href', hrefResolvido);
                continue;
            }

            if (ehArquivoDoRepositorio(hrefResolvido)) {
                try {
                    css = await baixarRecurso(hrefResolvido, 'CSS');
                    style = doc.createElement('style');
                    style.setAttribute('data-executor-origem', hrefResolvido);
                    style.textContent = ajustarUrlsCss(css, hrefResolvido);
                    link.replaceWith(style);
                } catch (erroCss) {
                    console.warn('[Executor GitHub] CSS ignorado; carregamento continuará:', hrefResolvido, erroCss);
                    link.remove();
                }
            } else {
                link.setAttribute('href', hrefResolvido);
            }
        }

        doc.querySelectorAll('link[href]').forEach(function (item) {
            var href;

            if (item.matches('link[rel~="stylesheet"]')) {
                return;
            }

            href = item.getAttribute('href');

            if (href) {
                item.setAttribute('href', resolverUrlLocal(href, PASTA_RAW));
            }
        });

        doc.querySelectorAll('style').forEach(function (item) {
            if (!item.hasAttribute('data-executor-origem')) {
                item.textContent = ajustarUrlsCss(item.textContent, PASTA_RAW);
            }
        });

        doc.querySelectorAll('[style]').forEach(function (el) {
            el.setAttribute('style', ajustarUrlsCss(el.getAttribute('style'), PASTA_RAW));
        });

        scripts = Array.from(doc.querySelectorAll('script[src]'));

        for (i = 0; i < scripts.length; i++) {
            script = scripts[i];
            srcOriginal = script.getAttribute('src');
            srcResolvido = resolverUrlLocal(srcOriginal, PASTA_RAW);

            if (ehUrlBaseFolder(srcResolvido)) {
                script.setAttribute('src', srcResolvido);
                continue;
            }

            if (ehArquivoDoRepositorio(srcResolvido)) {
                try {
                    codigo = await baixarRecurso(srcResolvido, 'JavaScript');
                    codigo = aplicarBaseFolder(codigo);

                    script.removeAttribute('src');
                    script.removeAttribute('integrity');
                    script.removeAttribute('crossorigin');
                    script.setAttribute('data-executor-origem', srcResolvido);
                    script.textContent = codigo + '\n//# sourceURL=' + srcResolvido;
                } catch (erroJs) {
                    console.warn('[Executor GitHub] JavaScript ignorado; carregamento continuará:', srcResolvido, erroJs);
                    script.remove();
                }
            } else {
                script.setAttribute('src', srcResolvido);
            }
        }

        doc.querySelectorAll('script:not([src])').forEach(function (item) {
            if (!item.hasAttribute('data-executor-origem')) {
                item.textContent = aplicarBaseFolder(item.textContent);
            }
        });

        return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    }

    async function baixarHtml() {
        if (!RAW_URL) {
            throw new Error('P_LINK_GIT não contém a URL do HTML principal.');
        }

        return await baixarTextoGitHub(
            RAW_URL,
            'HTML principal',
            'text/html,text/plain;q=0.9,*/*;q=0.8'
        );
    }

    async function executarHtml(html) {
        var htmlFinal = await normalizarHtml(html);

        document.open();
        document.write(htmlFinal);
        document.close();
    }

    window.carregarAplicacao = async function () {
        try {
            var html = await baixarHtml();
            await executarHtml(html);
        } catch (erro) {
            console.error('[Executor GitHub] Erro fatal somente no HTML principal:', erro);
        }
    };

    RAW_URL = normalizarUrlPrincipal(RAW_URL);
    PASTA_RAW = RAW_URL.substring(0, RAW_URL.lastIndexOf('/') + 1);
    REPO_RAW = obterRaizRepositorio(RAW_URL);
    BASE_FOLDER_ABSOLUTO = montarBaseFolderAbsoluto();

    console.log(
        '[Executor GitHub V2] Autenticação:',
        tokenGitHubConfigurado() ? 'TOKEN ATIVO' : 'SEM TOKEN - somente conteúdo público'
    );

    return window.carregarAplicacao();
}
