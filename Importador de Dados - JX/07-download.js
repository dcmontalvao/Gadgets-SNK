// Código extraído do Código colado(10).html
// Separação estrutural: lógica original preservada.

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
