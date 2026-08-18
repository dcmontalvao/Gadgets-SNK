// Código extraído do Código colado(10).html
// Separação estrutural: lógica original preservada.

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
