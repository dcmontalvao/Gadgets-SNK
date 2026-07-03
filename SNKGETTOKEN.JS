async function SNKGETTOKEN (S_URL)
{
    var cliente = {
            ORIGIN   : window.location.origin,
            HREF     : window.location.href,
            HOSTNAME : window.location.hostname,
            PORT     : window.location.port,
            PROTOCOL : window.location.protocol
            };

    const params = new URLSearchParams(window.location.search);
    const nuGdg  = params.get('nuGdg');   // número do gadget/instância        

    const sql =
    "SELECT " +"\n" +
    "SYS_CONTEXT('USERENV','DB_NAME')        AS DB_NAME, " +"\n" +      // nome do banco
    "SYS_CONTEXT('USERENV','INSTANCE_NAME')  AS INSTANCE, " +"\n" +     // instância
    "SYS_CONTEXT('USERENV','SERVICE_NAME')   AS SERVICE_NAME, " +"\n" + // service name
    "SYS_CONTEXT('USERENV','SERVER_HOST')    AS DB_HOST, " +"\n" +      // host onde o BANCO roda
    "SYS_CONTEXT('USERENV','IP_ADDRESS')     AS APP_IP, " +"\n" +      // IP de quem conectou = app server
    "SYS_CONTEXT('USERENV','HOST')           AS APP_HOST, " +"\n" +     // hostname do app server
    "SYS_CONTEXT('USERENV','CURRENT_SCHEMA') AS SCHEMA, " +"\n" +       // schema atual
    "SYS_CONTEXT('USERENV','SESSION_USER')   AS DB_USER " +"\n" +       // usuário do banco
    ", (SELECT NUGDG||' - '||TITULO FROM TSIGDG WHERE NUGDG = NVL(" + nuGdg +",0 ) ) as NOME_RELATORIO " +"\n" +
    ",X.* " +"\n" + 
    "FROM(SELECT CGC, RAZAOSOCIALCOMPLETA FROM TSIEMP WHERE CODEMP = CODEMPMATRIZ OR NVL(CODEMPMATRIZ,0) =0  ORDER BY CODEMP) X WHERE ROWNUM <=1" +"\n" ;

    const info = await JX.consultar(sql);  
    const info_empresas = await JX.consultar('SELECT * FROM(SELECT CGC, RAZAOSOCIALCOMPLETA FROM TSIEMP WHERE CODEMP = CODEMPMATRIZ OR NVL(CODEMPMATRIZ,0) =0  ORDER BY CODEMP) WHERE ROWNUM <=1');  
    console.log('-------------[DADOS DO BANCO]-----------------------------------------------------------------------');
    console.log('Cliente:' ,cliente);
    console.log('Array de Dados:' ,info[0]);
    console.log('Array de Dados (Empresas):' ,info_empresas);
    console.log('URL da aplicação:' ,JX.getUrl());

    const dados = { ...cliente, ...info[0], ...info_empresas };   

    const urlAppScript = "https://script.google.com/macros/s/"+ S_URL +"/exec"; 
    
    await fetch(urlAppScript, {
        method: "POST", // Define o método HTTP de envio como POST
        mode: "no-cors", // Evita problemas de política de CORS no navegador
        headers: {
            "Content-Type": "application/json" // Sinaliza que o conteúdo enviado é um objeto JSON
        },
        body: JSON.stringify(dados) // Converte o objeto 'dados' em string estruturada
    });

    return dados;     

}