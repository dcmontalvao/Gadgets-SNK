// Código extraído do Código colado(10).html
// Separação estrutural: lógica original preservada.

function montarTabelaCamposModelo() {
            var camposObrigatoriosModelo = [
                                                ...nomesDasChavesPK,
                                                ...A_camposObrigatorios.filter(
                                                    campo => !nomesDasChavesPK.includes(campo)
                                                )
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
        function gerarEWhatsappBaixarModelo() {
            var selecionados = [];
            $('.campo-modelo-check:checked').each(function() {
                var campo = $(this).attr('data-campo'); 
                if (campo) selecionados.push(campo);
            });
            if (selecionados.length === 0) {
                mostrarToast('Selecione ao menos um campo para gerar o modelo.', 'alerta');
                return;
            }
            var dadosExcel = [selecionados];
            var ws = XLSX.utils.aoa_to_sheet(dadosExcel);
            var colWidths = selecionados.map(function(campo) {
                return { wpx: Math.max(100, campo.length * 12) };
            });
            ws['!cols'] = colWidths;
            var wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Modelo");
            XLSX.writeFile(wb, "Modelo_Importacao" + P_NOME_INSTANCIA + ".xlsx");
            fecharModalModelo();
            mostrarToast('Modelo gerado com ' + selecionados.length + ' campo(s).', 'ok', 4000);
        }
