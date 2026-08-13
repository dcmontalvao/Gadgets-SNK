/* 
 * ============================================================ 
 * IA BALANCER 
 * OpenRouter + Groq + Cerebras 
 * ============================================================ 
 * 
 * Uso: 
 * 
 * IABalancer.analisar({ 
 *     prompt: S_PROMPT, 
 *     dados: A_JSON 
 * }).then(function(resposta) {
 *     // ...
 * }); 
 * 
 * OU: 
 * 
 * IABalancer.analisar( 
 *     S_PROMPT, 
 *     A_JSON 
 * ).then(function(resposta) {
 *     // ...
 * });
 * 
 * CONFIGURAÇÃO: 
 * Informe as 3 API Keys no bloco CONFIG abaixo 
 * ou use IABalancer.configurar() em tempo de execução. 
 * 
 * ============================================================ 
 */ 
 
(function (global) { 
 
    "use strict"; 
 
 
    // ========================================================= 
    // CONFIGURAÇÃO DAS API KEYS 
    // ========================================================= 
 
    var CONFIG = { 
 
        OPENROUTER_KEY: "SUA_OPENROUTER_API_KEY", 
 
        GROQ_KEY: "SUA_GROQ_API_KEY", 
 
        CEREBRAS_KEY: "SUA_CEREBRAS_API_KEY" 
 
    }; 
 
 
    // ========================================================= 
    // PROVEDORES 
    // ========================================================= 
 
    var PROVIDERS = { 
 
        GROQ: { 
 
            name: "Groq", 
 
            endpoint: 
                "https://api.groq.com/openai/v1", 
 
            models: [ 
 
                "openai/gpt-oss-20b", 
 
                "llama-3.1-8b-instant" 
 
            ], 
 
            /* 
             * Limite conservador. 
             * Evita mandar uma requisição maior 
             * que os limites gratuitos conhecidos. 
             */ 
 
            maxInputTokens: 5500 
 
        }, 
 
 
        CEREBRAS: { 
 
            name: "Cerebras", 
 
            endpoint: 
                "https://api.cerebras.ai/v1", 
 
            models: [ 
 
                "gpt-oss-120b" 
 
            ], 
 
            maxInputTokens: 7500 
 
        }, 
 
 
        OPENROUTER: { 
 
            name: "OpenRouter", 
 
            endpoint: 
                "https://openrouter.ai/api/v1", 
 
            models: [ 
 
                "openai/gpt-oss-20b:free" 
 
            ], 
 
            maxInputTokens: 6000 
 
        } 
 
    }; 
 
 
    // ========================================================= 
    // ESTADO 
    // ========================================================= 
 
    var STATE = { 
 
        disabledUntil: { 
 
            Groq: 0, 
 
            Cerebras: 0, 
 
            OpenRouter: 0 
 
        }, 
 
 
        errors: { 
 
            Groq: 0, 
 
            Cerebras: 0, 
 
            OpenRouter: 0 
 
        }, 
 
 
        success: { 
 
            Groq: 0, 
 
            Cerebras: 0, 
 
            OpenRouter: 0 
 
        }, 
 
 
        lastProvider: null, 
 
        lastModel: null, 
 
        lastError: null 
 
    }; 
 
 
    // ========================================================= 
    // VERIFICA API KEY 
    // ========================================================= 
 
    function hasKey(key) { 
 
        return !!( 
 
            key && 
 
            typeof key === "string" && 
 
            key.trim() && 
 
            key.indexOf("SUA_") !== 0 
 
        ); 
 
    } 
 
 
    // ========================================================= 
    // OBTÉM API KEY DO PROVEDOR 
    // ========================================================= 
 
    function getKey(providerName) { 
 
        if (providerName === "Groq") { 
 
            return CONFIG.GROQ_KEY; 
 
        } 
 
 
        if (providerName === "Cerebras") { 
 
            return CONFIG.CEREBRAS_KEY; 
 
        } 
 
 
        if (providerName === "OpenRouter") { 
 
            return CONFIG.OPENROUTER_KEY; 
 
        } 
 
 
        return ""; 
 
    } 
 
 
    // ========================================================= 
    // CONVERTE DADOS PARA STRING 
    // ========================================================= 
 
    function stringify(data) { 
 
        if (typeof data === "string") { 
 
            return data; 
 
        } 
 
 
        try { 
 
            return JSON.stringify(data); 
 
        } 
 
        catch (e) { 
 
            return String(data); 
 
        } 
 
    } 
 
 
    // ========================================================= 
    // ESTIMATIVA DE TOKENS 
    // ========================================================= 
 
    function estimateTokens(text) { 
 
        if (!text) { 
 
            return 0; 
 
        } 
 
 
        /* 
         * Estimativa. 
         * 
         * Não substitui um tokenizer real. 
         * Serve apenas para controle de tamanho. 
         */ 
 
        return Math.ceil( 
            String(text).length / 3.5 
        ); 
 
    } 
 
 
    // ========================================================= 
    // LIMPA RESPOSTA 
    // ========================================================= 
 
    function clean(text) { 
 
        return String( 
            text || "Sem resposta da IA." 
        ) 
 
            .replace(/\*\*/g, "") 
 
            .replace(/#/g, "") 
 
            .replace(/`/g, "") 
 
            .trim(); 
 
    } 
 
 
    // ========================================================= 
    // ESPERA 
    // ========================================================= 
 
    function sleep(ms) { 
 
        return new Promise( 
 
            function (resolve) { 
 
                setTimeout( 
                    resolve, 
                    ms 
                ); 
 
            } 
 
        ); 
 
    } 
 
 
    // ========================================================= 
    // ERROS DE AUTENTICAÇÃO 
    // ========================================================= 
 
    function isAuth(status) { 
 
        return ( 
 
            status === 401 || 
 
            status === 402 || 
 
            status === 403 
 
        ); 
 
    } 
 
 
    // ========================================================= 
    // ERROS TEMPORÁRIOS 
    // ========================================================= 
 
    function isTemporary( 
        status, 
        message 
    ) { 
 
        message = 
            String( 
                message || "" 
            ).toLowerCase(); 
 
 
        return ( 
 
            [ 
 
                408, 
 
                409, 
 
                425, 
 
                429, 
 
                500, 
 
                502, 
 
                503, 
 
                504 
 
            ].indexOf(status) >= 0 
 
            || 
 
            message.indexOf( 
                "rate limit" 
            ) >= 0 
 
            || 
 
            message.indexOf( 
                "too many" 
            ) >= 0 
 
            || 
 
            message.indexOf( 
                "timeout" 
            ) >= 0 
 
        ); 
 
    } 
 
 
    // ========================================================= 
    // ERRO DE TAMANHO 
    // ========================================================= 
 
    function isPayload( 
        status, 
        message 
    ) { 
 
        message = 
            String( 
                message || "" 
            ).toLowerCase(); 
 
 
        return ( 
 
            status === 413 
 
            || 
 
            message.indexOf( 
                "request too large" 
            ) >= 0 
 
            || 
 
            message.indexOf( 
                "tokens per minute" 
            ) >= 0 
 
            || 
 
            message.indexOf( 
                "context length" 
            ) >= 0 
 
            || 
 
            message.indexOf( 
                "maximum context" 
            ) >= 0 
 
        ); 
 
    } 
 
 
    // ========================================================= 
    // ANALISA COMPLEXIDADE DA TAREFA 
    // ========================================================= 
 
    function analyzeTask(prompt) { 
 
        var text = 
            String( 
                prompt || "" 
            ).toLowerCase(); 
 
 
        var score = 0; 
 
 
        var complexWords = [ 
 
            "analisar", 
 
            "analise", 
 
            "análise", 
 
            "comparar", 
 
            "comparação", 
 
            "comparacao", 
 
            "correlação", 
 
            "correlacao", 
 
            "previsão", 
 
            "previsao", 
 
            "projeção", 
 
            "projecao", 
 
            "tendência", 
 
            "tendencia", 
 
            "causa", 
 
            "causas", 
 
            "estratégia", 
 
            "estrategia", 
 
            "otimizar", 
 
            "otimização", 
 
            "otimizacao", 
 
            "rentabilidade", 
 
            "margem", 
 
            "financeiro", 
 
            "financeira", 
 
            "dre", 
 
            "orçamento", 
 
            "orcamento", 
 
            "dashboard", 
 
            "fórmula", 
 
            "formula", 
 
            "fórmulas", 
 
            "formulas", 
 
            "gráfico", 
 
            "grafico", 
 
            "código", 
 
            "codigo", 
 
            "programar", 
 
            "programação", 
 
            "programacao", 
 
            "sql", 
 
            "power query", 
 
            "dax" 
 
        ]; 
 
 
        var excelWords = [ 
 
            "excel", 
 
            "planilha", 
 
            "célula", 
 
            "celula", 
 
            "aba", 
 
            "coluna", 
 
            "linha", 
 
            "intervalo", 
 
            "tabela", 
 
            "fórmula", 
 
            "formula", 
 
            "gráfico", 
 
            "grafico", 
 
            "preencher", 
 
            "preencha", 
 
            "alterar", 
 
            "altere", 
 
            "modificar", 
 
            "modifique", 
 
            "criar", 
 
            "crie", 
 
            "excluir", 
 
            "exclua", 
 
            "inserir", 
 
            "insira" 
 
        ]; 
 
 
        var simpleWords = [ 
 
            "olá", 
 
            "ola", 
 
            "oi", 
 
            "bom dia", 
 
            "boa tarde", 
 
            "boa noite", 
 
            "obrigado", 
 
            "obrigada", 
 
            "ok" 
 
        ]; 
 
 
        complexWords.forEach( 
 
            function (word) { 
 
                if ( 
                    text.indexOf(word) >= 0 
                ) { 
 
                    score += 2; 
 
                } 
 
            } 
 
        ); 
 
 
        excelWords.forEach( 
 
            function (word) { 
 
                if ( 
                    text.indexOf(word) >= 0 
                ) { 
 
                    score += 1; 
 
                } 
 
            } 
 
        ); 
 
 
        simpleWords.forEach( 
 
            function (word) { 
 
                if ( 
                    text.indexOf(word) >= 0 
                ) { 
 
                    score -= 3; 
 
                } 
 
            } 
 
        ); 
 
 
        return { 
 
            score: 
                Math.max( 
                    0, 
                    score 
                ), 
 
            simple: 
                score <= 1, 
 
            complex: 
                score >= 5, 
 
            excel: 
                excelWords.some( 
 
                    function (word) { 
 
                        return ( 
                            text.indexOf(word) >= 0 
                        ); 
 
                    } 
 
                ) 
 
        }; 
 
    } 
 
 
    // ========================================================= 
    // REDUZ DADOS QUANDO NECESSÁRIO 
    // ========================================================= 
 
    function compactData( 
        data, 
        maxTokens 
    ) { 
 
        var text = 
            stringify(data); 
 
 
        var originalTokens = 
            estimateTokens(text); 
 
 
        /* 
         * Se já cabe, não altera nada. 
         */ 
 
        if ( 
            originalTokens <= 
            maxTokens 
        ) { 
 
            return { 
 
                text: text, 
 
                truncated: false, 
 
                originalTokens: 
                    originalTokens, 
 
                finalTokens: 
                    originalTokens 
 
            }; 
 
        } 
 
 
        var targetChars = 
            Math.floor( 
                maxTokens * 3.5 
            ); 
 
 
        /* 
         * Tenta tratar arrays. 
         */ 
 
        try { 
 
            var parsed = 
                typeof data === "string" 
 
                    ? JSON.parse(data) 
 
                    : data; 
 
 
            if ( 
                Array.isArray(parsed) 
            ) { 
 
                var result = []; 
 
 
                for ( 
                    var i = 0; 
                    i < parsed.length; 
                    i++ 
                ) { 
 
                    var candidate = 
                        JSON.stringify( 
 
                            result.concat( 
                                [parsed[i]] 
                            ) 
 
                        ); 
 
 
                    if ( 
                        candidate.length > 
                        targetChars 
                    ) { 
 
                        break; 
 
                    } 
 
 
                    result.push( 
                        parsed[i] 
                    ); 
 
                } 
 
 
                var arrayText = 
                    JSON.stringify( 
                        result 
                    ); 
 
 
                return { 
 
                    text: 
                        arrayText, 
 
                    truncated: 
                        result.length < 
                        parsed.length, 
 
                    originalTokens: 
                        originalTokens, 
 
                    finalTokens: 
                        estimateTokens( 
                            arrayText 
                        ), 
 
                    originalItems: 
                        parsed.length, 
 
                    finalItems: 
                        result.length 
 
                }; 
 
            } 
 
 
            /* 
             * Tenta tratar objetos. 
             */ 
 
            if ( 
 
                parsed && 
 
                typeof parsed === "object" && 
 
                !Array.isArray(parsed) 
 
            ) { 
 
                var obj = {}; 
 
                var keys = 
                    Object.keys( 
                        parsed 
                    ); 
 
 
                for ( 
                    var k = 0; 
                    k < keys.length; 
                    k++ 
                ) { 
 
                    var next = {};
                    for (var prop in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                            next[prop] = obj[prop];
                        }
                    } 
 
 
                    next[ 
                        keys[k] 
                    ] = 
                        parsed[ 
                            keys[k] 
                        ]; 
 
 
                    if ( 
                        JSON.stringify( 
                            next 
                        ).length > 
                        targetChars 
                    ) { 
 
                        break; 
 
                    } 
 
 
                    obj = next; 
 
                } 
 
 
                var objectText = 
                    JSON.stringify( 
                        obj 
                    ); 
 
 
                return { 
 
                    text: 
                        objectText, 
 
                    truncated: 
                        Object.keys( 
                            obj 
                        ).length < 
                        keys.length, 
 
                    originalTokens: 
                        originalTokens, 
 
                    finalTokens: 
                        estimateTokens( 
                            objectText 
                        ), 
 
                    originalKeys: 
                        keys.length, 
 
                    finalKeys: 
                        Object.keys( 
                            obj 
                        ).length 
 
                }; 
 
            } 
 
        } 
 
        catch (e) { 
 
            /* 
             * Se não for JSON válido, 
             * usa corte seguro abaixo. 
             */ 
 
        } 
 
 
        /* 
         * Fallback para texto. 
         */ 
 
        return { 
 
            text: 
                text.substring( 
                    0, 
                    targetChars 
                ), 
 
            truncated: true, 
 
            originalTokens: 
                originalTokens, 
 
            finalTokens: 
                maxTokens 
 
        }; 
 
    } 
 
 
    // ========================================================= 
    // RANKING DOS PROVEDORES 
    // ========================================================= 
 
    function rankProviders( 
        promptTokens, 
        dataTokens, 
        task 
    ) { 
 
        var total = 
            promptTokens + 
            dataTokens; 
 
 
        var candidates = []; 
 
 
        /* 
         * GROQ 
         * 
         * Prioridade para tarefas simples 
         * e respostas rápidas. 
         */ 
 
        if ( 
            hasKey( 
                CONFIG.GROQ_KEY 
            ) && 
 
            Date.now() >= 
            STATE.disabledUntil.Groq 
 
        ) { 
 
            var groqScore = 100; 
 
 
            if ( 
                task.simple 
            ) { 
 
                groqScore += 40; 
 
            } 
 
 
            if ( 
                task.excel 
            ) { 
 
                groqScore += 15; 
 
            } 
 
 
            if ( 
                total > 5000 
            ) { 
 
                groqScore -= 30; 
 
            } 
 
 
            candidates.push({ 
 
                provider: 
                    PROVIDERS.GROQ, 
 
                score: 
                    groqScore 
 
            }); 
 
        } 
 
 
        /* 
         * CEREBRAS 
         * 
         * Prioridade para tarefas complexas. 
         */ 
 
        if ( 
            hasKey( 
                CONFIG.CEREBRAS_KEY 
            ) && 
 
            Date.now() >= 
            STATE.disabledUntil.Cerebras 
 
        ) { 
 
            var cerebrasScore = 
                95; 
 
 
            if ( 
                task.complex 
            ) { 
 
                cerebrasScore += 45; 
 
            } 
 
 
            if ( 
                total > 5000 
            ) { 
 
                cerebrasScore += 30; 
 
            } 
 
 
            if ( 
                task.excel 
            ) { 
 
                cerebrasScore += 20; 
 
            } 
 
 
            candidates.push({ 
 
                provider: 
                    PROVIDERS.CEREBRAS, 
 
                score: 
                    cerebrasScore 
 
            }); 
 
        } 
 
 
        /* 
         * OPENROUTER 
         * 
         * Fallback. 
         */ 
 
        if ( 
            hasKey( 
                CONFIG.OPENROUTER_KEY 
            ) && 
 
            Date.now() >= 
            STATE.disabledUntil.OpenRouter 
 
        ) { 
 
            var openRouterScore = 
                70; 
 
 
            if ( 
                task.complex 
            ) { 
 
                openRouterScore += 30; 
 
            } 
 
 
            candidates.push({ 
 
                provider: 
                    PROVIDERS.OPENROUTER, 
 
                score: 
                    openRouterScore 
 
            }); 
 
        } 
 
 
        candidates.sort( 
 
            function (a, b) { 
 
                return ( 
                    b.score - 
                    a.score 
                ); 
 
            } 
 
        ); 
 
 
        return candidates; 
 
    } 
 
 
    // ========================================================= 
    // CHAMADA API 
    // ========================================================= 
 
    function callProvider( 
 
        provider, 
 
        apiKey, 
 
        prompt, 
 
        dataText, 
 
        model 
 
    ) { 
 
        var headers = { 
 
            "Content-Type": 
                "application/json", 
 
            "Authorization": 
                "Bearer " + 
                apiKey 
 
        }; 
 
 
        /* 
         * Headers especiais OpenRouter. 
         */ 
 
        if ( 
            provider.name === 
            "OpenRouter" 
        ) { 
 
            headers[ 
                "HTTP-Referer" 
            ] = 
 
                typeof window !== 
                "undefined" 
 
                    ? window.location.href 
 
                    : "https://localhost"; 
 
 
            headers[ 
                "X-Title" 
            ] = 
                "Excel IA Balancer"; 
 
        } 
 
 
        var body = { 
 
            model: 
                model, 
 
 
            messages: [ 
 
                { 
 
                    role: 
                        "system", 
 
                    content: 
                        prompt 
 
                }, 
 
 
                { 
 
                    role: 
                        "user", 
 
                    content: 
                        "DADOS JSON:\n" + 
                        dataText 
 
                } 
 
            ], 
 
 
            temperature: 
                0.2, 
 
 
            max_tokens: 
                800 
 
        }; 
 
 
        return fetch( 
 
            provider.endpoint + 
            "/chat/completions", 
 
            { 
 
                method: 
                    "POST", 
 
                headers: 
                    headers, 
 
                body: 
                    JSON.stringify( 
                        body 
                    ) 
 
            } 
 
        )
        .catch(function(networkError) {
            var err = new Error("Network Error: " + networkError.message);
            err.status = 0; // Indicativo de falha de rede sem resposta HTTP
            throw err;
        })
        .then(function(response) {
            return response.text().then(function(raw) {
                var data; 
                try { 
                    data = JSON.parse(raw); 
                } catch (e) { 
                    data = { 
                        error: { 
                            message: raw 
                        } 
                    }; 
                } 
 
                if (!response.ok) { 
                    var apiError = new Error( 
                        data && data.error && data.error.message 
                            ? data.error.message 
                            : "HTTP " + response.status 
                    ); 
                    apiError.status = response.status; 
                    throw apiError; 
                } 
 
                var content = data && data.choices && data.choices[0] && data.choices[0].message 
                    ? data.choices[0].message.content 
                    : null; 
 
                if (!content) { 
                    throw new Error("A API não retornou conteúdo."); 
                } 
 
                return { 
                    text: clean(content), 
                    provider: provider.name, 
                    model: model, 
                    usage: data.usage || null 
                };
            });
        });
    } 
 
 
    // ========================================================= 
    // EXECUTA UM PROVEDOR 
    // ========================================================= 
 
    function executeProvider( 
        provider, 
        prompt, 
        dataText 
    ) { 
 
        var apiKey = 
            getKey( 
                provider.name 
            ); 
 
 
        var lastError = null; 

        function tryModel(index) {
            if (index >= provider.models.length) {
                return Promise.reject(lastError || new Error("Nenhum modelo respondeu."));
            }

            var model = provider.models[index];
            
            console.log(
                "[IA BALANCER] Tentando: " + 
                provider.name + " / " + model
            );

            return callProvider(provider, apiKey, prompt, dataText, model)
                .then(function(result) {
                    STATE.success[provider.name]++; 
                    STATE.lastProvider = provider.name; 
                    STATE.lastModel = model; 
                    STATE.lastError = null; 
                    return result; 
                })
                .catch(function(error) {
                    lastError = error; 
                    STATE.errors[provider.name]++; 
                    
                    console.warn(
                        "[IA BALANCER] Falha:", 
                        provider.name, model, error
                    ); 
                    
                    if (isAuth(error.status)) { 
                        STATE.disabledUntil[provider.name] = Date.now() + 60 * 60 * 1000; 
                        return Promise.reject(lastError);
                    } 
                    
                    if (isPayload(error.status, error.message)) { 
                        return Promise.reject(lastError);
                    } 
                    
                    if (isTemporary(error.status, error.message)) { 
                        return sleep(800).then(function() {
                            return tryModel(index + 1);
                        });
                    } 
                    
                    return tryModel(index + 1);
                });
        }
        
        return tryModel(0);
    } 
 
 
    // ========================================================= 
    // FUNÇÃO PRINCIPAL 
    // ========================================================= 
 
    function analisar( 
 
        options, 
 
        dadosOpcional 
 
    ) { 
 
        var prompt; 
 
        var dados; 
 
 
        /* 
         * Formato: 
         * 
         * analisar({ 
         *     prompt: "...", 
         *     dados: ... 
         * }); 
         */ 
 
        if ( 
 
            options && 
 
            typeof options === 
            "object" && 
 
            ( 
 
                Object.prototype 
                    .hasOwnProperty.call( 
                        options, 
                        "prompt" 
                    ) 
 
                || 
 
                Object.prototype 
                    .hasOwnProperty.call( 
                        options, 
                        "dados" 
                    ) 
 
            ) 
 
        ) { 
 
            prompt = 
                options.prompt;
 
 
            dados = 
                options.dados; 
 
        } 
 
 
        /* 
         * Formato antigo: 
         * 
         * analisar( 
         *     S_PROMPT, 
         *     A_JSON 
         * ); 
         */ 
 
        else { 
 
            prompt = 
                options;
 
 
            dados = 
                dadosOpcional; 
 
        } 
 
 
        if ( 
            typeof prompt !== "string" || prompt.trim() === ""
        ) { 
 
            return Promise.reject(new Error( 
 
                "O parâmetro " + 
                "prompt é obrigatório e deve ser uma string não vazia." 
 
            ));
 
        } 
 
 
        var dataText = 
            stringify( 
                dados 
            ); 
 
 
        var promptTokens = 
            estimateTokens( 
                prompt 
            ); 
 
 
        var dataTokens = 
            estimateTokens( 
                dataText 
            ); 
 
 
        var task = 
            analyzeTask( 
                prompt 
            ); 
 
 
        console.log( 
            "==========================================" 
        ); 
 
 
        console.log( 
            "[IA BALANCER] " + 
            "Prompt:", 
            promptTokens, 
            "tokens" 
        ); 
 
 
        console.log( 
            "[IA BALANCER] " + 
            "Dados:", 
            dataTokens, 
            "tokens" 
        ); 
 
 
        console.log( 
            "[IA BALANCER] " + 
            "Total:", 
            promptTokens + 
            dataTokens, 
            "tokens" 
        ); 
 
 
        console.log( 
            "[IA BALANCER] " + 
            "Tarefa:", 
 
            task.complex 
 
                ? "COMPLEXA" 
 
                : task.simple 
 
                    ? "SIMPLES" 
 
                    : "NORMAL" 
 
        ); 
 
 
        /* 
         * Escolhe a ordem dos provedores. 
         */ 
 
        var ranking = 
            rankProviders( 
 
                promptTokens, 
 
                dataTokens, 
 
                task 
 
            ); 
 
 
        if ( 
            !ranking.length 
        ) { 
 
            throw new Error( 
 
                "Nenhuma API Key " + 
                "foi configurada." 
 
            ); 
 
        } 
 
 
        var errors = []; 
 
        function tryProvider(index) {
            if (index >= ranking.length) {
                return Promise.reject(new Error(
                    "Nenhuma IA conseguiu processar a solicitação:\n" + 
                    errors.join("\n")
                ));
            }

            var provider = ranking[index].provider;
            
            var dataBudget = provider.maxInputTokens - promptTokens - 250; 
            if (dataBudget < 500) { 
                dataBudget = 500; 
            } 
            
            var compacted = compactData(dados, dataBudget); 
            
            console.log(
                "[IA BALANCER] Selecionado: " + provider.name + 
                " | Score: " + ranking[index].score + 
                " | Dados: " + compacted.finalTokens + " tokens" + 
                (compacted.truncated ? " | DADOS REDUZIDOS" : "")
            );
            
            return executeProvider(provider, prompt, compacted.text)
                .then(function(result) {
                    console.log(
                        "[IA BALANCER] SUCESSO: " + 
                        result.provider + " " + result.model
                    );
                    return result.text;
                })
                .catch(function(error) {
                    errors.push(
                        provider.name + ": " + 
                        (error.message || error)
                    );
                    
                    console.warn(
                        "[IA BALANCER] Provider falhou:", 
                        provider.name, error
                    );
                    
                    return tryProvider(index + 1);
                });
        }
        
        return tryProvider(0);
    } 
 
 
    // ========================================================= 
    // STATUS 
    // ========================================================= 
 
    function status() { 
 
        return { 
 
            Groq: { 
 
                configurado: 
                    hasKey( 
                        CONFIG.GROQ_KEY 
                    ), 
 
                sucesso: 
                    STATE.success.Groq, 
 
                erros: 
                    STATE.errors.Groq, 
 
                bloqueadoAte: 
                    STATE.disabledUntil.Groq 
 
            }, 
 
 
            Cerebras: { 
 
                configurado: 
                    hasKey( 
                        CONFIG.CEREBRAS_KEY 
                    ), 
 
                sucesso: 
                    STATE.success.Cerebras, 
 
                erros: 
                    STATE.errors.Cerebras, 
 
                bloqueadoAte: 
                    STATE.disabledUntil.Cerebras 
 
            }, 
 
 
            OpenRouter: { 
 
                configurado: 
                    hasKey( 
                        CONFIG.OPENROUTER_KEY 
                    ), 
 
                sucesso: 
                    STATE.success.OpenRouter, 
 
                erros: 
                    STATE.errors.OpenRouter, 
 
                bloqueadoAte: 
                    STATE.disabledUntil.OpenRouter 
 
            }, 
 
 
            ultimoProvider: 
                STATE.lastProvider, 
 
 
            ultimoModelo: 
                STATE.lastModel, 
 
 
            ultimoErro: 
                STATE.lastError 
 
        }; 
 
    } 
 
 
    // ========================================================= 
    // CONFIGURAR CHAVES EM TEMPO DE EXECUÇÃO E OPÇÕES
    // ========================================================= 
 
    function configurar(options) { 
        if (!options) { 
            return; 
        } 
 
        // 1. Set API Keys
        if (options.openrouter) { 
            CONFIG.OPENROUTER_KEY = options.openrouter; 
        } 
        if (options.groq) { 
            CONFIG.GROQ_KEY = options.groq; 
        } 
        if (options.cerebras) { 
            CONFIG.CEREBRAS_KEY = options.cerebras; 
        } 
        
        // 2. Allow deep configuration of providers
        if (options.providers) {
            for (var providerKey in options.providers) {
                if (Object.prototype.hasOwnProperty.call(options.providers, providerKey)) {
                    var providerOptions = options.providers[providerKey];
                    if (PROVIDERS[providerKey]) {
                        // Override properties on the provider
                        for (var prop in providerOptions) {
                            if (Object.prototype.hasOwnProperty.call(providerOptions, prop)) {
                                PROVIDERS[providerKey][prop] = providerOptions[prop];
                            }
                        }
                    }
                }
            }
        }
    } 
 
 
    // ========================================================= 
    // EXPORTAÇÃO 
    // ========================================================= 
 
    var API = { 
 
        analisar: 
            analisar, 
 
        configurar: 
            configurar, 
 
        status: 
            status 
 
    }; 
 
 
    /* 
     * Navegador / Excel Add-in 
     */ 
 
    if ( 
        typeof window !== 
        "undefined" 
    ) { 
 
        window.IABalancer = 
            API; 
 
    } 
 
 
    /* 
     * Node / bundlers 
     */ 
 
    if ( 
 
        typeof module !== 
        "undefined" && 
 
        module.exports 
 
    ) { 
 
        module.exports = 
            API; 
 
    } 
 
 
})( 
    typeof window !== 
    "undefined" 
 
        ? window 
 
        : globalThis 
);