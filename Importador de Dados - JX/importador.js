
                /* ============================================================
                  Feedback visual (toasts) e controle das etapas
                  ============================================================ */
                const ICONES_TOAST = { ok: 'check-circle', erro: 'alert-octagon', alerta: 'alert-triangle', info: 'info' };
                let p_nome_tabela_Insert = '';

                function mostrarToast(mensagem, tipo, duracao) {
                    tipo = tipo || 'info';
                    const $toast = $(
                        '<div class="toast toast-' + tipo + '" role="status">' +
                            '<i data-feather="' + (ICONES_TOAST[tipo] || 'info') + '" class="w-4 h-4 mt-0.5 flex-shrink-0"></i>' +
                            '<span class="flex-1 whitespace-pre-line"></span>' +
                            '<button class="text-gray-400 hover:text-gray-600" aria-label="Fechar aviso"><i data-feather="x" class="w-4 h-4"></i></button>' +
                        '</div>'
                    );
                    $toast.find('span').text(mensagem);
                    $toast.find('button').on('click', () => fecharToast($toast));
                    $('#areaToasts').append($toast);
                    feather.replace();
                    setTimeout(() => fecharToast($toast), duracao || 6000);
                    return $toast;
                }
                function fecharToast($toast) {
                    if (!$toast || !$toast.length || $toast.hasClass('saindo')) return;
                    $toast.addClass('saindo');
                    setTimeout(() => $toast.remove(), 200);
                }

                function definirEtapa(numero) {
                    [1, 2, 3].forEach(function(n) {
                        const $etapa = $('#etapa' + n);
                        $etapa.removeClass('ativa concluida');
                        if (n < numero) $etapa.addClass('concluida');
                        if (n === numero) $etapa.addClass('ativa');
                    });
                }

                function formatarTamanhoArquivo(bytes) {
                    if (!bytes && bytes !== 0) return '';
                    const unidades = ['B', 'KB', 'MB', 'GB'];
                    let i = 0, valor = bytes;
                    while (valor >= 1024 && i < unidades.length - 1) { valor /= 1024; i++; }
                    return valor.toFixed(i === 0 ? 0 : 1).replace('.', ',') + ' ' + unidades[i];
                }

                function atualizarContadores(rotulo) {
                    const total = xlsxtableData.length;
                    $('#contadorRegistros').text(total + ' ' + (rotulo || 'registro(s) identificado(s)'));
                    const comErro = xlsxtableData.filter(r => r._status && r._status !== '').length;
                    $('#contadorErros').toggleClass('hidden', comErro === 0).text(comErro + ' com erro');
                }

                function limparCGC_CPF(texto, substituirPor = '') {
                    if (texto === null || texto === undefined) return texto;
                    try {
                        return String(texto).replace(/[\.\/\- ]/g, substituirPor);
                    } catch (erro) {
                        return texto;
                    }
                }

                var arr = [{value: "", type: "IN"}];
                function executeQueryPromise(query, args) {
                    args = args || [];
                    console.log('EXECUTANDO QUERY:', query, args);
                    return new Promise(function(resolve, reject) {
                        executeQuery(query, args, function(value) { resolve(value); }, function(error) { reject(error); });
                    });
                }

                let xlsxtableData = [];
                let tabelaDados = null;
                let cancelarImportacao = false;
                let contadorRowId = 0;

                let titulos_cabecalho = {};
                let campos_insert = [];
                let nomesDasChavesPK = [];
                let colunasData = [];
                let colunasExibicaoData = [];
                let a_vlrs_padrao = {};
                let A_camposObrigatorios = [];
                let colunasExibicaoMoeda = [];

                let RESULT_TDDOPC = [];

                // Opções da TDDOPC organizadas por campo
                let opcoesCampos = {};

                // Registros enviados em paralelo por lote. Aumentar acelera a importação,
                // mas exige mais do servidor Sankhya.
                

                async function carregarDicionarioSankhya() {
                    var query = `
                            SELECT 
                                CAM.NOMECAMPO,
                                CAM.DESCRCAMPO,
                                CAM.TIPCAMPO,

                                CASE
                                    WHEN EXISTS (
                                        SELECT 1
                                        FROM ALL_CONSTRAINTS UC
                                        INNER JOIN ALL_CONS_COLUMNS UCC
                                            ON UCC.OWNER = UC.OWNER
                                        AND UCC.CONSTRAINT_NAME = UC.CONSTRAINT_NAME
                                        WHERE UC.OWNER = SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA')
                                        AND UC.CONSTRAINT_TYPE = 'P'
                                        AND UC.TABLE_NAME = INS.NOMETAB
                                        AND UCC.COLUMN_NAME = CAM.NOMECAMPO
                                    )
                                    THEN 'S'
                                END AS PK,

                                INS.NOMETAB,
                                TAB.DESCRTAB,
                                ADC.DATA_DEFAULT,
                                ADC.NULLABLE,
                                INS.NOMEINSTANCIA,
                                CAM.NUCAMPO

                            FROM TDDINS INS

                            INNER JOIN TDDTAB TAB
                                ON TAB.NOMETAB = INS.NOMETAB

                            INNER JOIN TDDCAM CAM
                                ON CAM.NOMETAB = TAB.NOMETAB
                            AND CAM.CALCULADO = 'N'

                            LEFT JOIN ALL_TAB_COLUMNS ADC
                                ON ADC.OWNER = SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA')
                            AND ADC.TABLE_NAME = INS.NOMETAB
                            AND ADC.COLUMN_NAME = CAM.NOMECAMPO

                            WHERE INS.NOMEINSTANCIA = 
                    `;
                    query += "'" + P_NOME_INSTANCIA + "' ";




                    try {
                        const resultado_json = await executeQueryPromise(query);
                        console.log('RETORNO QUERY PRINCIPAL:', resultado_json);
                        const resultado = JSON.parse(resultado_json);

                        if (!resultado || resultado.length === 0) 
                        {
                            throw new Error('A consulta principal não retornou registros para a instância: ' + P_NOME_INSTANCIA);
                        }

                        let query_opc = `
                                        SELECT  
                                            TDDCAM.NOMECAMPO,
                                            TDDOPC.NUCAMPO
                                        ,TDDOPC.VALOR
                                        ,REGEXP_REPLACE(
                                            TDDOPC.OPCAO,
                                            '[^[:alnum:]À-ÿ ]',
                                            ' '
                                        ) AS OPCAO
                                        ,TDDOPC.ORDEM
                                            
                                        FROM TDDCAM 
                                        INNER JOIN TDDOPC  ON TDDCAM.NUCAMPO=TDDOPC.NUCAMPO
                                        WHERE TDDCAM.NOMETAB = `;

                        query_opc += "'" + resultado[0].NOMETAB + "'";
                        
                        
                        console.log('QUERIES:', query, query_opc);
                        const TDDOPC_json = await executeQueryPromise(query_opc);
                        console.log('RETORNO BRUTO TDDOPC:', TDDOPC_json);
                        RESULT_TDDOPC = JSON.parse(TDDOPC_json);
                        

                        // Organiza as opções da TDDOPC por NOMECAMPO
                        opcoesCampos = {};

                        RESULT_TDDOPC.forEach(function(opcao) {
                            const campo = opcao.NOMECAMPO;

                            if (!campo) return;

                            if (!opcoesCampos[campo]) {
                                opcoesCampos[campo] = [];
                            }

                            opcoesCampos[campo].push({
                                VALOR: opcao.VALOR,
                                OPCAO: opcao.OPCAO,
                                PADRAO: opcao.PADRAO,
                                ORDEM: opcao.ORDEM,
                                CONTROLE: opcao.CONTROLE,
                                DOMAIN: opcao.DOMAIN
                            });
                        });

                        Object.keys(opcoesCampos).forEach(function(campo) {
                            opcoesCampos[campo].sort(function(a, b) {
                                return (Number(a.ORDEM) || 0) - (Number(b.ORDEM) || 0);
                            });
                        });


                      document.getElementById('tituloPagina_top').innerText = 'Importador\n' + resultado[0].DESCRTAB;
                      document.getElementById('Obj_titulo').innerText = 'Importador\n' + resultado[0].DESCRTAB;

                      P_NOME_INSTANCIA = resultado[0].NOMEINSTANCIA;
                        resultado.forEach(linha => {
                            const nomeCampo = linha.NOMECAMPO;
                            titulos_cabecalho[nomeCampo] = linha.DESCRCAMPO;
                            
                            campos_insert.push(nomeCampo);
                            if (linha.PK === 'S') nomesDasChavesPK.push(nomeCampo);
                            if (linha.TIPCAMPO === 'D' || linha.TIPCAMPO === 'H') colunasData.push(nomeCampo);
                            if (linha.TIPCAMPO === 'F') colunasExibicaoMoeda.push(nomeCampo);
                            if (linha.DATA_DEFAULT !== null && linha.DATA_DEFAULT !== undefined) {

                                let valorDefault = String(linha.DATA_DEFAULT).trim();

                                if (
                                    valorDefault.length >= 2 &&
                                    valorDefault.startsWith("'") &&
                                    valorDefault.endsWith("'")
                                ) {
                                    valorDefault = valorDefault.substring(
                                        1,
                                        valorDefault.length - 1
                                    );
                                }

                                if (
                                    valorDefault !== '' &&
                                    valorDefault.toUpperCase() !== 'NULL'
                                ) {
                                    a_vlrs_padrao[nomeCampo] = valorDefault;
                                }
                            }
                            if (
                                    linha.NULLABLE === 'N' &&
                                    linha.PK !== 'S' &&
                                    (linha.DATA_DEFAULT === null ||
                                    linha.DATA_DEFAULT === undefined ||
                                    String(linha.DATA_DEFAULT).trim() === '' ||
                                    String(linha.DATA_DEFAULT).trim().toUpperCase() === 'NULL')
                                ) {
                                    A_camposObrigatorios.push(nomeCampo);
                                }
                        });
                        colunasExibicaoData = colunasData;
                      // if (!titulos_cabecalho.CGC_CPF) titulos_cabecalho.CGC_CPF = 'CNPJ / CPF';
                        montarTabelaCamposModelo();
                    } catch (erro) {
                        console.error("Erro ao carregar dicionário de dados do Sankhya:", erro);
                        document.getElementById('tituloPagina_top').innerText = 'Importador';
                        mostrarToast('Erro ao carregar o dicionário de dados. Verifique o console.', 'erro', 9000);
                    }
                }

                const idiomaPtBr = {
                    "pt-br": {
                        "data": { "loading": "Carregando...", "error": "Erro ao carregar" },
                        "pagination": {
                            "page_size": "Registros por página",
                            "first": "Primeira",
                            "first_title": "Primeira Página",
                            "last": "Última",
                            "last_title": "Última Página",
                            "prev": "Anterior",
                            "prev_title": "Página Anterior",
                            "next": "Próxima",
                            "next_title": "Próxima Página",
                            "all": "Todos",
                            "counter": { "showing": "Mostrando", "of": "de", "rows": "registros", "pages": "páginas" }
                        },
                        "headerFilters": { "default": "filtrar..." }
                    }
                };

                function formatadorData(cell) {
                    const v = cell.getValue();
                    if (v === '' || v === null || v === undefined) return '';
                    if (v instanceof Date) return v.toLocaleDateString('pt-BR');
                    return String(v);
                }

                function formatadorMoeda(cell) {
                    let v = cell.getValue();
                    if (v === '' || v === null || v === undefined) return '';
                    if (typeof v === 'string') v = parseFloat(v.replace(/\./g, '').replace(',', '.'));
                    if (isNaN(v)) return cell.getValue();
                    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                }

                document.addEventListener('DOMContentLoaded', async function() {
                    feather.replace();
                    AOS.init({ duration: 600 });
                    await carregarDicionarioSankhya();

                    $('#baixarErrosBtn').on('click', baixarDadosRestantes);
                    $('#selectFileBtn').on('click', (e) => { e.stopPropagation(); abrirSeletorDeArquivo(); });
                    $('#fileInput').on('click', (e) => e.stopPropagation());
                    $('#fileInput').on('change', (e) => handleFile(e.target.files[0]));
                    $('#removeFileBtn, #clearBtn').on('click', () => location.reload());
                    $('#submitBtn').on('click', salvarDadosEmLotes);

                    $('#btnCancelarImportacao').on('click', function() {
                        if (confirm('Deseja realmente cancelar a importação?\n\nOs registros que já foram enviados permanecerão salvos no Sankhya.')) {
                            cancelarImportacao = true;
                            $(this).prop('disabled', true);
                            atualizarLoadingStatus('Cancelando...');
                        }
                    });

                    const dropzone = $('#dropzone');
                    dropzone.on('click', function(e) {
                        if (e.target.id === 'fileInput' || $(e.target).closest('#selectFileBtn').length) return;
                        abrirSeletorDeArquivo();
                    });
                    dropzone.on('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirSeletorDeArquivo(); }
                    });
                    dropzone.on('dragover', (e) => { e.preventDefault(); dropzone.addClass('active'); });
                    dropzone.on('dragleave', () => dropzone.removeClass('active'));
                    dropzone.on('drop', (e) => {
                        e.preventDefault(); dropzone.removeClass('active');
                        const files = e.originalEvent.dataTransfer.files;
                        if (files.length) handleFile(files[0]);
                    });

                    $(document).on('keydown', function(e) {
                        if (e.key === 'Escape' && !$('#modalModelo').hasClass('hidden')) fecharModalModelo();
                    });
                });

                function abrirSeletorDeArquivo() {
                    document.getElementById('fileInput').click();
                }

                function handleFile(file) {
                    if (!file) return;
                    $('#fileName').text(file.name);
                    $('#fileMeta').text(formatarTamanhoArquivo(file.size) + ' · lido em ' + new Date().toLocaleTimeString('pt-BR'));
                    $('#fileInfo, #tableSection').removeClass('hidden');
                    $('#dropzone').hide();
                    definirEtapa(2);

                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                        processData(jsonData);
                    };
                    reader.readAsArrayBuffer(file);
                }
                function processData(data) {
                    if (data.length < 2) { mostrarToast('Planilha sem dados.', 'alerta'); return; }

                    // 1. Lê os cabeçalhos da planilha
                    let headers = data[0].map(h => String(h).trim().toUpperCase());

                    // 2. Remove colunas internas que possam ter vindo do download (ex: _STATUS, _ROWID)
                    headers = headers.filter(h => h !== '_STATUS' && h !== '_ROWID');

                    const headerMap = {};
                    headers.forEach((h, i) => headerMap[h] = i);

                    contadorRowId = 0;
                    xlsxtableData = [];
                    for (let i = 1; i < data.length; i++) {
                        const row = data[i];
                        if (!row.length) continue;
                        const objSankhya = {};
                        headers.forEach(header => {
                            let val = row[headerMap[header]];
                            if (val === undefined || val === null) val = '';

                            // Se o Excel trouxer a descrição da TDDOPC, converte para o VALOR real
                            const opcoesDoCampo = opcoesCampos[header] || [];
                            if (val !== '' && opcoesDoCampo.length > 0) {
                                const opcaoEncontrada = opcoesDoCampo.find(function(opcao) {
                                    return String(opcao.OPCAO) === String(val);
                                });

                                if (opcaoEncontrada) {
                                    val = opcaoEncontrada.VALOR;
                                }
                            }

                            if (colunasData.includes(header) && val !== '') {
                                val = (val instanceof Date) ? val.toLocaleDateString('pt-BR') : val;
                            }
                            objSankhya[header] = val;
                        });
                        // Adiciona campos internos para controle (não aparecem na planilha original)
                        objSankhya['_rowId'] = 'r' + (contadorRowId++);
                        objSankhya['_status'] = '';
                        xlsxtableData.push(objSankhya);
                    }

                    // 3. Guarda os cabeçalhos originais (sem _status) para o download posterior
                    window.cabecalhosPlanilha = headers.slice();

                    // 4. Adiciona a coluna "Status" na exibição da tabela
                    const allHeaders = headers.concat(['_status']);
                    montarTabela(allHeaders);
                    atualizarContadores('registro(s) identificado(s)');
                    mostrarToast(xlsxtableData.length + ' registro(s) carregado(s) da planilha.', 'ok', 4000);
                    document.getElementById('tableSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                function montarTabela(headers) {
                    const columns = headers.map(h => {
                        if (h === '_status') {
                            return {
                                title: 'Status',
                                field: '_status',
                                width: 260,
                                formatter: function(cell) {
                                    const val = cell.getValue();
                                    if (!val) {
                                        return '<span class="chip chip-neutro">Pendente</span>';
                                    }
                                    const texto = $('<div>').text(val).html();
                                    return '<span class="chip chip-erro" title="' + texto + '">' + texto + '</span>';
                                },
                                headerFilter: false,
                                resizable: true,
                                hozAlign: 'left'
                            };
                        }

                        const col = {
                            title: titulos_cabecalho[h] || h,
                            field: h,
                            minWidth: 110,
                            headerFilter: "input",
                            headerFilterPlaceholder: "filtrar...",
                            resizable: true,
                            tooltip: true,

                            // Opções da TDDOPC associadas ao campo
                            opcoes: opcoesCampos[h] || []
                        };
                        if (colunasExibicaoData.includes(h)) {
                            col.formatter = formatadorData;
                            col.hozAlign = "center";
                            col.width = 150;
                        } else if (colunasExibicaoMoeda.includes(h)) {
                            col.formatter = formatadorMoeda;
                            col.hozAlign = "right";
                        }
                        return col;
                    });

                    if (tabelaDados) tabelaDados.destroy();
                    tabelaDados = new Tabulator("#dataTable", {
                        data: xlsxtableData,
                        columns: columns,
                        layout: "fitColumns",
                        height: "auto",
                        movableColumns: true,
                        pagination: true,
                        paginationSize: 10,
                        paginationSizeSelector: [10, 25, 50, 100],
                        paginationCounter: "rows",
                        locale: "pt-br",
                        langs: idiomaPtBr,
                        placeholder: "Nenhum dado encontrado",
                        rowFormatter: function(row) {
                            const data = row.getData();
                            const el = row.getElement();
                            const comErro = !!(data._status && data._status !== '');
                            el.classList.toggle('linha-com-erro', comErro);
                        }
                    });
                }

                let inicioImportacao = 0;

                function formatarDuracao(segundos) {
                    if (!isFinite(segundos) || segundos < 0) return '';
                    const min = Math.floor(segundos / 60);
                    const seg = Math.round(segundos % 60);
                    return min > 0 ? min + 'min ' + seg + 's' : seg + 's';
                }

                function mostrarLoading(titulo, statusInicial) {
                    cancelarImportacao = false;
                    inicioImportacao = Date.now();
                    $('#btnCancelarImportacao').prop('disabled', false);
                    $('#loadingTitulo').text(titulo || 'Processando...');
                    $('#loadingStatus').text(statusInicial || 'Aguarde, não feche esta janela.');
                    setProgresso(0, xlsxtableData.length);
                    $('#loadingOverlay').removeClass('hidden');
                    feather.replace();
                }
                function atualizarLoadingStatus(status) { $('#loadingStatus').text(status); }
                function setProgresso(atual, total) {
                    total = total || 0;
                    const pct = total > 0 ? Math.round((atual / total) * 100) : 0;
                    $('#loadingBarra').css('width', pct + '%');
                    $('#loadingPercent').text(pct + '%');
                    $('#loadingContador').text(atual + ' de ' + total + ' registros');

                    const decorrido = (Date.now() - inicioImportacao) / 1000;
                    if (atual > 0 && atual < total && decorrido > 1) {
                        const restante = (decorrido / atual) * (total - atual);
                        $('#loadingTempo').text('~' + formatarDuracao(restante) + ' restantes');
                    } else {
                        $('#loadingTempo').text('');
                    }
                }
                function esconderLoading() { $('#loadingOverlay').addClass('hidden'); }

                function ImportacaoCanceladaError(enviados) {
                    const err = new Error('Importação cancelada pelo usuário.');
                    err.cancelado = true;
                    err.enviados = enviados;
                    return err;
                }

                async function garantirLote(chaves) {
                    const filtro = {
                        CODEMP: chaves.CODEMP,
                        NUMLOTE: chaves.NUMLOTE,
                        REFERENCIA: chaves.REFERENCIA
                    };

                    console.log('Verificando lote:', filtro);

                    try {
                        const query = 'SELECT * FROM TCBLOT WHERE CODEMP = ' + chaves.CODEMP + ' AND NUMLOTE = ' + chaves.NUMLOTE + ' AND REFERENCIA = ' +"'" + chaves.REFERENCIA + "'";
                        const resultado = await JX.consultar(query);

                        console.log('Resultado da consulta de lote:',query, resultado);

                        // Lote já existe
                        if (resultado && resultado.length > 0) {
                            console.log('Lote já existe:', chaves.NUMLOTE);
                            return true;
                        }

                        // Lote não existe
                        console.log('Lote não existe. Criando:', chaves.NUMLOTE);

                        const novoLote = {
                            CODEMP: chaves.CODEMP,
                            NUMLOTE: chaves.NUMLOTE,
                            REFERENCIA: chaves.REFERENCIA
                        };

                        try {
                            const criado = await JX.salvar(
                                novoLote,
                                'MestreLote',
                                {
                                  //  'TOTLOTE': 0,
                                    'SITUACAO': 'A',
                                    'COMENTARIOS': 'Lote criado automaticamente pelo sistema de importação'
                                    ,'DTMOV': chaves.REFERENCIA
                                    ,'ULTLANC': 0
                                }
                            );

                            console.log('Retorno da criação do lote:', criado);

                            if (criado && criado.status === '0') {
                                console.error(
                                    'Erro ao criar lote ' + chaves.NUMLOTE + ':',
                                    criado.statusMessage
                                );
                                console.log('Detalhes do lote:', criado);
                                // NÃO interrompe o processamento
                                return false;
                            }

                            console.log(
                                'Lote criado com sucesso:',
                                chaves.NUMLOTE
                            );

                            return true;

                        } catch (erroCriacao) {
                            console.error(
                                'Exceção ao criar lote ' + chaves.NUMLOTE + ':',
                                erroCriacao
                            );

                            // NÃO lança o erro novamente
                            return false;
                        }

                    } catch (erroConsulta) {
                        console.error(
                            'Erro ao consultar lote ' + chaves.NUMLOTE + ':',
                            erroConsulta
                        );

                        // NÃO interrompe o processamento
                        return false;
                    }
                }


                async function inserirItensEmLotes(valoresPadrao, registros) {
                    const pendentes = registros.slice();
                    const totalOriginal = pendentes.length;
                    const idsSalvos = new Set();
                    let processados = 0;

                    const sincronizarTabela = function() {
                        xlsxtableData = pendentes.filter(r => !idsSalvos.has(r._rowId));
                        if (tabelaDados) tabelaDados.replaceData(xlsxtableData);
                        atualizarContadores('registro(s) restante(s)');
                    };

                    for (let i = 0; i < totalOriginal; i += TAMANHO_DO_LOTE) {
                        if (cancelarImportacao) {
                            sincronizarTabela();
                            throw ImportacaoCanceladaError(processados);
                        }

                        const bloco = pendentes.slice(i, i + TAMANHO_DO_LOTE);
                        const loteAtual = Math.floor(i / TAMANHO_DO_LOTE) + 1;
                        const totalLotes = Math.ceil(totalOriginal / TAMANHO_DO_LOTE);
                        console.log('Processando lote ' + loteAtual + ' com ' + bloco.length + ' registros.');
                        atualizarLoadingStatus('Enviando para o Sankhya... Lote ' + loteAtual + ' de ' + totalLotes);

                        const promessas = bloco.map(async registro => {
                            const chaves = {};
                            const campos = {};

                            Object.keys(registro).forEach(k => {
                                if (k === '_rowId' || k === '_status') return;
                                let val = registro[k];

                                if (nomesDasChavesPK.includes(k)) {
                                    chaves[k] = (val !== '' && val !== undefined && val !== null) ? val : 0;
                                } else {
                                    if (colunasData.includes(k) && val !== '' && val !== null) {
                                        if (val instanceof Date) val = val.toLocaleDateString('pt-BR');
                                    }
                                    if ((val === '' || val === undefined || val === null) && valoresPadrao[k] !== undefined) {
                                        val = valoresPadrao[k];
                                    }
                                    if (val !== '' && val !== null && val !== undefined) {
                                        campos[k] = val;
                                    }
                                }
                            });

                            Object.keys(valoresPadrao).forEach(k => {
                                if (!nomesDasChavesPK.includes(k) && campos[k] === undefined && registro[k] === undefined) {
                                    campos[k] = valoresPadrao[k];
                                }
                            });

                            if (Array.isArray(campos_insert) && campos_insert.length > 0) {
                                Object.keys(campos).forEach(k => {
                                    if (!campos_insert.includes(k)) delete campos[k];
                                });
                            }

                            console.log('=== TENTANDO PERSISTIR ===');
                            console.log('INSTÂNCIA:', P_NOME_INSTANCIA);
                            console.log('CHAVES:', JSON.stringify(chaves));
                            console.log('CAMPOS:', JSON.stringify(campos));
                            
                          if (p_nome_tabela_Insert.includes('TGFFIN')) 
                                {
                                    // NUFIN
                                    let valNufin = registro['NUFIN'];
                                    if (!(valNufin !== undefined && valNufin !== null && valNufin !== '' && valNufin !== 0 && valNufin !== '0')) {
                                        try {
                                            var resNufinJson = await executeQueryPromise("SELECT SEQ_TGFFIN_NUFIN.NEXTVAL AS NUFIN FROM DUAL");
                                            var resNufin = JSON.parse(resNufinJson);
                                            chaves['NUFIN'] = (resNufin.length > 0) ? resNufin[0].NUFIN : 0;
                                            console.log('NUFIN gerado para registro ' + registro._rowId + ': ' + chaves['NUFIN']);
                                        } catch (errConsulta) {
                                            return { rowId: registro._rowId, success: false, error: 'Erro NUFIN: ' + errConsulta.message };
                                        }
                                    } else {
                                        chaves['NUFIN'] = valNufin;
                                    }
                            }

                          if (P_NOME_INSTANCIA.includes('Lançamentos')) {
                                try {
                                    await garantirLote(chaves);
                                } catch (erro) {
                                    console.warn('Falha ao garantir lote para Lançamentos, mas seguindo fluxo:', erro.message);
                                }
                            }
                        
                            // Salvar – retorna objeto de resultado em vez de lançar exceção
                            return JX.salvar(chaves, P_NOME_INSTANCIA, campos)
                                .then(function(retorno) {
                                    if (retorno && retorno.statusMessage) {
                                        console.error('Erro ao salvar registro ' + registro._rowId + ': ' , retorno);
                                        return { rowId: registro._rowId, success: false, error: retorno.statusMessage };
                                    }
                                    return { rowId: registro._rowId, success: true };
                                })
                                .catch(function(err) {
                                    return { rowId: registro._rowId, success: false, error: err.message || String(err) };
                                });
                        });

                        // Aguarda o bloco inteiro (nunca rejeita, porque tratamos todos os erros)
                        const resultados = await Promise.all(promessas);
                        console.log('Lote ' + loteAtual + ' finalizado.');

                        // 1. Marca erros nos registros (antes de qualquer remoção)
                        resultados.filter(r => !r.success).forEach(falha => {
                            const reg = bloco.find(r => r._rowId === falha.rowId);
                            if (reg) {
                                reg._status = falha.error;
                            }
                        });

                        // 2. Marca os sucessos, que saem da lista exibida
                        resultados.filter(r => r.success).forEach(ok => idsSalvos.add(ok.rowId));

                        // 3. Atualiza tabela uma única vez (agora com os erros já preenchidos)
                        sincronizarTabela();

                        processados += bloco.length;
                        setProgresso(Math.min(processados, totalOriginal), totalOriginal);
                    }
                }
                async function salvarDadosEmLotes() {
                    if (xlsxtableData.length === 0) { mostrarToast('Nenhum dado para importar.', 'alerta'); return; }

                    const btn = $('#submitBtn');
                    btn.prop('disabled', true).html('<i data-feather="loader" class="animate-spin"></i> Processando...');
                    feather.replace();
                    definirEtapa(3);

                var valoresPadrao = a_vlrs_padrao ;




                    mostrarLoading('Importando ' + P_NOME_INSTANCIA, 'Enviando registros...');

                    try {
                        await inserirItensEmLotes(valoresPadrao, xlsxtableData);
                        esconderLoading();

                        if (xlsxtableData.length === 0) {
                            mostrarToast('Importação finalizada com sucesso! Todos os registros foram integrados.', 'ok', 4000);
                            setTimeout(() => location.reload(), 2000);
                        } else {
                            mostrarToast('Importação concluída com falhas.\n' + xlsxtableData.length + ' registro(s) NÃO foram importados. Verifique a coluna "Status".', 'erro', 12000);
                            definirEtapa(2);
                        }
                    } catch (e) {
                        esconderLoading();
                        if (e && e.cancelado) {
                            mostrarToast('Importação cancelada. ' + e.enviados + ' registro(s) já haviam sido salvos.', 'alerta', 9000);
                        } else {
                            console.error("Erro crítico:", e);
                            mostrarToast('Erro crítico: ' + (e.message || e), 'erro', 12000);
                        }
                        definirEtapa(2);
                    } finally {
                        btn.prop('disabled', false).html('<i data-feather="send"></i> Importar para o Sankhya');
                        feather.replace();
                    }
                }

                function downloadFile(filename) {
                    const a = document.createElement("a");
                    a.href = "${BASE_FOLDER}/" + filename;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }

                function baixarDadosRestantes() {
                    if (!xlsxtableData || xlsxtableData.length === 0) {
                        mostrarToast('Nenhum registro para baixar.', 'alerta');
                        return;
                    }

                    // Usa os nomes técnicos das colunas (ex: VLRDESDOB, DTVENC) + "_STATUS"
                    const colunas = (window.cabecalhosPlanilha || []).concat(['_STATUS']);

                    // Monta array de arrays (primeira linha = cabeçalhos técnicos)
                    const dados = [colunas.slice()]; // já são os nomes técnicos, sem tradução

                    xlsxtableData.forEach(reg => {
                        const linha = colunas.map(col => {
                            if (col === '_STATUS') {
                                // Pega o valor de _status (mensagem de erro)
                                return reg['_status'] !== undefined ? reg['_status'] : '';
                            }
                            // Para as demais colunas, pega o valor original (nome técnico)
                            return reg[col] !== undefined ? reg[col] : '';
                        });
                        dados.push(linha);
                    });

                    // Cria planilha e faz download
                    const ws = XLSX.utils.aoa_to_sheet(dados);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Erros");
                    XLSX.writeFile(wb, "Registros_Restantes_" + P_NOME_INSTANCIA + "_.xlsx");
                    mostrarToast('Download da planilha iniciado.', 'ok', 4000);
                }

                        function montarTabelaCamposModelo() {
                            var camposObrigatoriosModelo = [
                                                                ...nomesDasChavesPK,
                                                                ...A_camposObrigatorios.filter(
                                                                    campo => !nomesDasChavesPK.includes(campo)
                                                                )
                                                                ,'USOPROD'
                                                            ];
                            var htmlTabela = '';
                            var camposJaListados = [];

                            camposObrigatoriosModelo.forEach(function(campo) {
                                var titulo = (titulos_cabecalho && titulos_cabecalho[campo]) ? titulos_cabecalho[campo] : campo;
                                htmlTabela += '<tr class="linha-campo campo-obrigatorio border-b border-gray-100" data-busca="' + (titulo + ' ' + campo).toLowerCase() + '">' +
                                                '<td class="px-4 py-2.5 text-center">' +
                                                    '<input type="checkbox" class="campo-modelo-check w-4 h-4 accent-indigo-600 rounded" data-campo="' + campo + '" checked disabled>' +
                                                '</td>' +
                                                '<td class="px-4 py-2.5 text-gray-700">' + titulo + ' <span class="chip chip-alerta ml-1">Obrigatório</span></td>' +
                                                '<td class="px-4 py-2.5 text-gray-400 text-xs font-mono">' + campo + '</td>' +
                                              '</tr>';
                                camposJaListados.push(campo);
                            });

                            if (titulos_cabecalho && Object.keys(titulos_cabecalho).length > 0) {
                                var camposDicionario = Object.keys(titulos_cabecalho).sort(function(a, b) {
                                    return titulos_cabecalho[a].localeCompare(titulos_cabecalho[b]);
                                });
                                camposDicionario.forEach(function(campo) {
                                    if (campo && !camposJaListados.includes(campo)) {
                                        var titulo = titulos_cabecalho[campo] || campo;
                                        htmlTabela += '<tr class="linha-campo border-b border-gray-100 bg-white" data-busca="' + (titulo + ' ' + campo).toLowerCase() + '">' +
                                                        '<td class="px-4 py-2.5 text-center">' +
                                                            '<input type="checkbox" class="campo-modelo-check w-4 h-4 accent-indigo-600 rounded" data-campo="' + campo + '">' +
                                                        '</td>' +
                                                        '<td class="px-4 py-2.5 text-gray-700">' + titulo + '</td>' +
                                                        '<td class="px-4 py-2.5 text-gray-400 text-xs font-mono">' + campo + '</td>' +
                                                      '</tr>';
                                    }
                                });
                            }
                            $('#tabelaCamposModelo').html(htmlTabela);
                            atualizarContadorCamposModelo();
                        }

                        function atualizarContadorCamposModelo() {
                            var marcados = $('.campo-modelo-check:checked').length;
                            var total = $('.campo-modelo-check').length;
                            $('#contadorCamposModelo').text(marcados + ' de ' + total + ' campo(s) selecionado(s)');
                        }

                        function marcarTodosCamposModelo(marcar) {
                            $('.campo-modelo-check:not(:disabled)').each(function() {
                                if ($(this).closest('tr').is(':visible')) $(this).prop('checked', marcar);
                            });
                            atualizarContadorCamposModelo();
                        }

                        $(document).on('change', '.campo-modelo-check', atualizarContadorCamposModelo);
                        $(document).on('input', '#buscaCampoModelo', function() {
                            var termo = $(this).val().toLowerCase().trim();
                            var visiveis = 0;
                            $('#tabelaCamposModelo tr').each(function() {
                                var casa = !termo || ($(this).data('busca') || '').indexOf(termo) !== -1;
                                $(this).toggle(casa);
                                if (casa) visiveis++;
                            });
                            $('#semResultadoCampos').toggleClass('hidden', visiveis > 0);
                        });

                        function abrirModalModelo() {
                            $('#modalModelo').removeClass('hidden');
                            $('#buscaCampoModelo').val('').trigger('input');
                            feather.replace();
                            setTimeout(() => $('#buscaCampoModelo').focus(), 50);
                        }
                        function fecharModalModelo() {
                            $('#modalModelo').addClass('hidden');
                        }
                        async function gerarEWhatsappBaixarModelo() {
                            var selecionados = [];
                            $('.campo-modelo-check:checked').each(function() {
                                var campo = $(this).attr('data-campo'); 
                                if (campo) selecionados.push(campo);
                            });
                            if (selecionados.length === 0) {
                                mostrarToast('Selecione ao menos um campo para gerar o modelo.', 'alerta');
                                return;
                            }

                            if (typeof ExcelJS === 'undefined') {
                                mostrarToast('Biblioteca ExcelJS não carregada. Não foi possível gerar a validação de dados.', 'erro', 9000);
                                return;
                            }

                            try {
                                var workbook = new ExcelJS.Workbook();
                                var worksheet = workbook.addWorksheet('Modelo');
                                var opcoesWorksheet = workbook.addWorksheet('_OPCOES');

                                // Cabeçalhos técnicos do modelo
                                var headerRow = worksheet.addRow(selecionados);

                                headerRow.eachCell(function(cell) {
                                    cell.font = { bold: true };
                                    cell.alignment = { vertical: 'middle' };
                                });

                                // Mantém as larguras das colunas
                                selecionados.forEach(function(campo, indice) {
                                    worksheet.getColumn(indice + 1).width = Math.max(15, campo.length + 3);
                                });

                                // Aba auxiliar que ficará oculta e armazenará as listas da TDDOPC
                                opcoesWorksheet.state = 'veryHidden';

                                selecionados.forEach(function(campo, indice) {
                                    var opcoes = opcoesCampos[campo] || [];

                                    if (opcoes.length === 0) return;

                                    var colunaOpcoes = indice + 1;
                                    var letraColuna = XLSX.utils.encode_col(colunaOpcoes - 1);

                                    // Guarda somente a descrição para aparecer no dropdown.
                                    // O VALOR real fica na coluna seguinte para manter o vínculo
                                    // com a TDDOPC e permitir a conversão no carregamento do Excel.
                                    opcoes.forEach(function(opcao, linha) {
                                        opcoesWorksheet.getCell(linha + 1, colunaOpcoes).value =
                                            opcao.OPCAO !== null && opcao.OPCAO !== undefined
                                                ? String(opcao.OPCAO)
                                                : String(opcao.VALOR ?? '');
                                    });

                                    var nomeLista = 'Lista_' + String(campo)
                                        .replace(/[^A-Za-z0-9_]/g, '_')
                                        .replace(/^[^A-Za-z_]+/, '');

                                    if (!nomeLista || nomeLista === 'Lista_') {
                                        nomeLista = 'Lista_Campo_' + indice;
                                    }

                                    nomeLista = nomeLista.substring(0, 200) + '_' + indice;

                                    workbook.definedNames.add(
                                        "'_OPCOES'!$" + letraColuna + "$1:$" + letraColuna + "$" + opcoes.length,
                                        nomeLista
                                    );

                                    // Validação para 999 linhas de preenchimento do modelo.
                                    worksheet.dataValidations.add(
                                        letraColuna + '2:' + letraColuna + '1000',
                                        {
                                            type: 'list',
                                            allowBlank: true,
                                            formulae: ['=' + nomeLista],
                                            showErrorMessage: true,
                                            errorStyle: 'stop',
                                            errorTitle: 'Valor inválido',
                                            error: 'Selecione uma opção disponível na lista.',
                                            showInputMessage: true,
                                            promptTitle: campo,
                                            prompt: 'Selecione uma opção da lista da TDDOPC.'
                                        }
                                    );
                                });

                                var buffer = await workbook.xlsx.writeBuffer();

                                var blob = new Blob(
                                    [buffer],
                                    {
                                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                                    }
                                );

                                var url = URL.createObjectURL(blob);
                                var link = document.createElement('a');

                                link.href = url;
                                link.download = 'Modelo_Importacao' + P_NOME_INSTANCIA + '.xlsx';

                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);

                                setTimeout(function() {
                                    URL.revokeObjectURL(url);
                                }, 1000);

                                fecharModalModelo();
                                mostrarToast('Modelo gerado com ' + selecionados.length + ' campo(s) e validações da TDDOPC.', 'ok', 5000);

                            } catch (erro) {
                                console.error('Erro ao gerar modelo XLSX com validação:', erro);
                                mostrarToast('Erro ao gerar o modelo com validação de dados. Verifique o console.', 'erro', 9000);
                            }
                        }
                        