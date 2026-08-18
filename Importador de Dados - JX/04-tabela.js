// Código extraído do Código colado(10).html
// Separação estrutural: lógica original preservada.

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
            tooltip: true
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
