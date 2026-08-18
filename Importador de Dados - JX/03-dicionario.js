// Código extraído do Código colado(10).html
// Separação estrutural: lógica original preservada.

async function carregarDicionarioSankhya() {
    var query = `
WITH pk_data AS (
    SELECT 
        UC.TABLE_NAME,
        UCC.COLUMN_NAME,
        ROW_NUMBER() OVER (
            PARTITION BY UC.TABLE_NAME, UCC.COLUMN_NAME
            ORDER BY UC.OWNER
        ) AS RN
    FROM ALL_CONSTRAINTS UC
    JOIN ALL_CONS_COLUMNS UCC
        ON UC.OWNER = UCC.OWNER
       AND UC.CONSTRAINT_NAME = UCC.CONSTRAINT_NAME
    WHERE UC.OWNER = SYS_CONTEXT('USERENV','CURRENT_SCHEMA')
      AND UC.CONSTRAINT_TYPE = 'P'
)
SELECT 
    CAM.NOMECAMPO,
    CAM.DESCRCAMPO,
    CAM.TIPCAMPO,
    CASE 
        WHEN PK.COLUMN_NAME IS NOT NULL THEN 'S'
    END AS PK,
    INS.NOMETAB,
    TAB.DESCRTAB,
    ADC.DATA_DEFAULT
    ,ADC.NULLABLE
    ,INS.NOMEINSTANCIA
FROM TDDINS INS 
INNER JOIN TDDTAB TAB 
    ON TAB.NOMETAB = INS.NOMETAB
INNER JOIN TDDCAM CAM 
    ON CAM.NOMETAB = TAB.NOMETAB 
   AND CAM.CALCULADO = 'N'
LEFT JOIN pk_data PK  
    ON PK.TABLE_NAME = INS.NOMETAB 
   AND PK.COLUMN_NAME = CAM.NOMECAMPO 
   AND PK.RN = 1
LEFT JOIN ALL_TAB_COLUMNS ADC
    ON ADC.OWNER = SYS_CONTEXT('USERENV','CURRENT_SCHEMA')
   AND ADC.TABLE_NAME = INS.NOMETAB
   AND ADC.COLUMN_NAME = CAM.NOMECAMPO
WHERE INS.nuinstancia = 
    `;
    query += "'" +  + "' \n order by cam.ordem";
    try {
        const resultado_json = await executeQueryPromise(query);
        const resultado = JSON.parse(resultado_json);
       document.getElementById('tituloPagina_top').innerText = 'Importador\n' + resultado[0].DESCRTAB;
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
