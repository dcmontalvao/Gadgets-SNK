// Código extraído do Código colado(10).html
// Separação estrutural: lógica original preservada.

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
