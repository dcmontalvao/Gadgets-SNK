// Código extraído do Código colado(10).html
// Separação estrutural: lógica original preservada.

/* ============================================================
   Feedback visual (toasts) e controle das etapas
   ============================================================ */
const ICONES_TOAST = { ok: 'check-circle', erro: 'alert-octagon', alerta: 'alert-triangle', info: 'info' };

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

// Registros enviados em paralelo por lote. Aumentar acelera a importação,
// mas exige mais do servidor Sankhya.
const TAMANHO_DO_LOTE = 25;
