<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" isELIgnored="false"%>
<!DOCTYPE html>
<%@ page import="java.util.*" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib prefix="snk" uri="/WEB-INF/tld/sankhyaUtil.tld" %>
<html>
<head>
    <snk:load />
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memoria de Calculo - Contabilizacao</title>
    <script src="https://cdn.jsdelivr.net/gh/wansleynery/SankhyaJX/jx.min.js"></script>
    <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, "Segoe UI", Roboto, Arial, sans-serif; margin: 0; padding: 16px; background: #f4f6f9; color: #1b2733; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        .sub { color: #64748b; font-size: 12px; margin-bottom: 16px; }
        .barra { display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap; background: #fff; padding: 14px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,.08); margin-bottom: 16px; }
        .campo { display: flex; flex-direction: column; gap: 4px; }
        .campo label { font-size: 11px; color: #475569; font-weight: 600; }
        .campo input, .campo select { padding: 8px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; min-width: 140px; }
        .empresa-select { position: relative; min-width: 280px; }
        .empresa-toggle { width: 280px; text-align: left; padding: 8px 10px; background: #fff; color: #1b2733; border: 1px solid #cbd5e1; font-weight: 400; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .empresa-toggle:hover { background: #f8fafc; }
        .empresas-box { position: absolute; z-index: 50; top: calc(100% + 4px); left: 0; width: 360px; max-height: 320px; overflow-y: auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,.12); padding: 8px; }
        .empresa-acoes { display: flex; gap: 6px; padding: 4px 4px 8px; border-bottom: 1px solid #eef2f6; margin-bottom: 6px; }
        .empresa-acao { padding: 5px 8px; background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 11px; font-weight: 600; }
        .empresa-acao:hover { background: #e2e8f0; }
        .empresa-item { display: flex; align-items: center; gap: 7px; padding: 5px 4px; font-size: 12px; cursor: pointer; }
        .empresa-item:hover { background: #f8fafc; }
        .empresa-item input { margin: 0; min-width: auto; }
        .empresa-vazia { color: #64748b; font-size: 12px; padding: 8px 4px; }
        button { padding: 9px 18px; background: #1f4e78; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
        button:hover { background: #163a5a; }
        button:disabled { background: #94a3b8; cursor: not-allowed; }
        .cards { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
        .card { background: #fff; border-radius: 8px; padding: 12px 16px; min-width: 130px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
        .card .rot { font-size: 11px; color: #64748b; text-transform: uppercase; }
        .card .val { font-size: 18px; font-weight: 700; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; background: #fff; font-size: 13px; }
        th { background: #1f4e78; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; position: sticky; top: 0; }
        td { padding: 7px 10px; border-bottom: 1px solid #eef2f6; vertical-align: top; }
        tr:hover td { background: #f8fafc; }
        .tabwrap { border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
        .num { text-align: right; font-variant-numeric: tabular-nums; }
        .st { font-weight: 600; padding: 2px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap; }
        .st-OK { background: #dcfce7; color: #166534; }
        .st-DIVERGENTE { background: #fee2e2; color: #991b1b; }
        .st-CONFIG { background: #fef3c7; color: #92400e; }
        .st-ERRO { background: #e0e7ff; color: #3730a3; }
        .st-VARIAVEL { background: #f1f5f9; color: #475569; }
        .st-NAOAPL { background: #f8fafc; color: #94a3b8; }
        .trace { font-family: "SF Mono", Consolas, monospace; font-size: 11px; color: #475569; white-space: pre; line-height: 1.5; }
        .trace .v { color: #16a34a; }
        .trace .f { color: #dc2626; }
        .trace .val { color: #7c3aed; font-weight: 600; }
        .trace .pd { color: #0891b2; }
        details { margin-top: 4px; }
        summary { cursor: pointer; color: #1f4e78; font-size: 11px; }
        .formula { font-family: "SF Mono", Consolas, monospace; font-size: 11px; color: #64748b; max-width: 360px; word-break: break-word; }
        #loader { text-align: center; color: #64748b; padding: 30px; font-size: 14px; white-space: pre-wrap; }
        .erro-box { background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:14px; border-radius:8px; font-family:"SF Mono",Consolas,monospace; font-size:12px; white-space:pre-wrap; text-align:left; }
        .hidden { display: none; }
        .resumo-linha { font-size: 12px; color: #475569; margin: 4px 0 12px; }
        .doc-row { cursor: default; }
        .doc-row:hover td { background: #f8fafc; }
        .expand-btn {
            width: 26px;
            height: 26px;
            padding: 0;
            border-radius: 5px;
            background: #1f4e78;
            font-size: 18px;
            line-height: 26px;
            font-weight: 700;
        }
        .expand-btn:hover { background: #163a5a; }
        .expand-btn.open { background: #64748b; }
        .detalhe-row td { padding: 0; background: #f8fafc; }
        .detalhe-box {
            padding: 14px;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }
        .detalhe-status {
            color: #64748b;
            font-size: 12px;
            padding: 8px 0;
            white-space: pre-wrap;
        }
        .detalhe-erro {
            background:#fef2f2;
            border:1px solid #fecaca;
            color:#991b1b;
            padding:12px;
            border-radius:6px;
            font-family:"SF Mono",Consolas,monospace;
            font-size:11px;
            white-space:pre-wrap;
        }
        .detalhe-resumo {
            display:flex;
            gap:8px;
            flex-wrap:wrap;
            margin-bottom:10px;
        }
        .detalhe-resumo .mini-card {
            background:#fff;
            border:1px solid #e2e8f0;
            border-radius:6px;
            padding:7px 10px;
            min-width:110px;
        }
        .detalhe-resumo .mini-card .rot {
            font-size:10px;
            color:#64748b;
            text-transform:uppercase;
        }
        .detalhe-resumo .mini-card .val {
            font-size:14px;
            font-weight:700;
            margin-top:2px;
        }
        .detalhe-table {
            width:100%;
            border-collapse:collapse;
            background:#fff;
            font-size:12px;
        }
        .detalhe-table th {
            background:#475569;
            color:#fff;
            padding:7px 8px;
            font-size:10px;
            text-transform:uppercase;
            position:static;
        }
        .detalhe-table td {
            padding:6px 8px;
            border-bottom:1px solid #eef2f6;
            vertical-align:top;
        }

        .tabela-toolbar {
            background:#fff;
            padding:12px;
            border-bottom:1px solid #e2e8f0;
            display:flex;
            gap:8px;
            align-items:flex-end;
            flex-wrap:wrap;
        }
        .tabela-toolbar .filtro {
            display:flex;
            flex-direction:column;
            gap:4px;
        }
        .tabela-toolbar label {
            font-size:10px;
            font-weight:700;
            color:#64748b;
            text-transform:uppercase;
        }
        .tabela-toolbar input,
        .tabela-toolbar select {
            height:34px;
            padding:7px 9px;
            border:1px solid #cbd5e1;
            border-radius:6px;
            font-size:12px;
            background:#fff;
            min-width:125px;
        }
        .tabela-toolbar .busca {
            min-width:260px;
        }
        .filtro-contador {
            margin-left:auto;
            color:#64748b;
            font-size:11px;
            padding-bottom:8px;
            white-space:nowrap;
        }
        .sortable {
            cursor:pointer !important;
            user-select:none;
            white-space:nowrap;
        }
        .sortable:hover {
            background:#163a5a !important;
        }
        .sortable .seta {
            display:inline-block;
            margin-left:4px;
            opacity:.7;
            font-size:9px;
        }
        .paginacao {
            background:#fff;
            border-top:1px solid #e2e8f0;
            padding:10px 12px;
            display:flex;
            justify-content:center;
            align-items:center;
            gap:5px;
            flex-wrap:wrap;
        }
        .pag-btn {
            min-width:32px;
            height:30px;
            padding:0 9px;
            border:1px solid #cbd5e1;
            background:#fff;
            color:#334155;
            border-radius:5px;
            font-size:12px;
            cursor:pointer;
        }
        .pag-btn:hover {
            background:#f1f5f9;
        }
        .pag-btn.ativo {
            background:#1f4e78;
            color:#fff;
            border-color:#1f4e78;
        }
        .pag-btn:disabled {
            opacity:.45;
            cursor:not-allowed;
        }
        .pag-info {
            font-size:11px;
            color:#64748b;
            margin:0 8px;
            white-space:nowrap;
        }
        .filtro-limpar {
            height:34px;
            padding:0 12px;
            background:#64748b;
            font-size:12px;
        }
        .filtro-limpar:hover {
            background:#475569;
        }

    </style>
</head>

<body>
    <h1>Memoria de Calculo da Contabilizacao</h1>
    <div class="sub">Lista os documentos por referencia e empresa. Cada documento pode ser expandido para conferir a memoria de calculo.</div>

    <snk:query var="parametros">
        SELECT USU.CODUSU, USU.NOMEUSU FROM TSIUSU USU WHERE USU.CODUSU = ${userID}
    </snk:query>

    <div class="barra">
        <div class="campo">
            <label>Referencia inicial</label>
            <input type="date" id="dataInicial" />
        </div>

        <div class="campo">
            <label>Referencia final</label>
            <input type="date" id="dataFinal" />
        </div>

        <div class="campo" id="campoEmpresas">
            <label>Empresas</label>
            <div class="empresa-select">
                <button type="button" id="btnEmpresas" class="empresa-toggle" onclick="toggleEmpresas()">
                    Carregando empresas...
                </button>
                <div id="empresasBox" class="empresas-box hidden"></div>
            </div>
        </div>

        <button id="btn" onclick="processarCompetencia()">Listar documentos</button>
    </div>

    <div id="loader" class="hidden"></div>
    <div id="cards" class="cards hidden"></div>
    <div id="resumo" class="resumo-linha hidden"></div>
    <div id="tabela" class="tabwrap hidden"></div>

<script>

var arr = [{ value: "", type: "IN" }];
var empresasDisponiveis = [];



// =====================================================================
// PARSE SEGURO
// =====================================================================
function parseSeguro(resp, rotulo){
    if (resp == null) return {ok:false, msg:'['+rotulo+'] retorno vazio (null)'};
    var txt = String(resp);
    var t = txt.replace(/^\uFEFF/, '').replace(/^\)\]\}',?\s*/, '').trim();
    if (t.charAt(0) !== '[' && t.charAt(0) !== '{'){
        return {ok:false, msg:'['+rotulo+'] o banco retornou (nao-JSON):\n' + txt.slice(0, 800)};
    }
    try { return {ok:true, dados: JSON.parse(t)}; }
    catch (e){
        try {
            var saneado = t.replace(/"(?:[^"\\]|\\.)*"/g, function(str){
                return str.replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/\t/g,'\\t');
            });
            return {ok:true, dados: JSON.parse(saneado)};
        } catch (e2){
            var pos = (String(e.message).match(/position (\d+)/) || [])[1];
            var trecho = pos ? txt.slice(Math.max(0, pos-50), Number(pos)+50) : txt.slice(0,400);
            return {ok:false, msg:'['+rotulo+'] JSON invalido'+(pos?' (pos '+pos+')':'')+':\n...'+trecho+'...'};
        }
    }
}
function mostrarErro(msg){
    console.error(msg);
    document.getElementById('loader').innerHTML = '<div class="erro-box">' + escapeHtml(msg) + '</div>';
    show('loader');
    document.getElementById('btn').disabled = false;
}

// decodifica Base64 (vindo do Oracle, pode ter quebras de linha) -> texto UTF-8.
// A formula chega EXATAMENTE como esta na TGFCTB, sem nenhuma alteracao.
function b64DecodeUtf8(b64){
    if (b64 == null) return '';
    var s = String(b64).replace(/\s+/g,'');   // Oracle quebra base64 a cada 64 chars
    var bin;
    try { bin = atob(s); } catch(e){ return String(b64); }
    try {
        return decodeURIComponent(bin.split('').map(function(c){
            return '%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    } catch(e2){ return bin; }  // ASCII puro: binary ja e o texto
}

// =====================================================================
// ENGINE DE FORMULAS DO SANKHYA
// Tokenizer + parser recursivo (gera AST) + avaliador.
// Interpreta a linguagem: IF, VAL, PDES, VALORIMPOSTO*, funcoes Oracle
// (SUM/COUNT/MAX/FC_*), concatenacao com +, aspas simples e duplas,
// aninhamento em qualquer profundidade. Nao usa replace de padrao.
// =====================================================================

function normal(s){ return String(s == null ? '' : s).replace(/\\n/g,' ').replace(/\s+/g,' ').trim(); }
function q(sql){ return sql.replace(/\s+/g,' ').trim(); }
function hashStr(s){ var h=0; for(var i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))|0; } return Math.abs(h); }

// ---------- TOKENIZER ----------
function tokenize(src){
    var toks=[], i=0, n=src.length;
    function isIdStart(c){ return /[A-Za-z_]/.test(c); }
    function isIdPart(c){ return /[A-Za-z0-9_.]/.test(c); }
    while(i<n){
        var c=src[i];
        if(c===' '||c==='\t'||c==='\r'||c==='\n'){ i++; continue; }
        if(c==='\\' && src[i+1]==='n'){ i+=2; continue; }
        if(c==="'"||c==='"'){
            var quote=c, j=i+1, val='';
            while(j<n){
                if(src[j]==='\\' && j+1<n){ val+=src[j+1]; j+=2; continue; }
                if(src[j]===quote){ j++; break; }
                val+=src[j]; j++;
            }
            toks.push({t:'STR', v:val}); i=j; continue;
        }
        if(/[0-9]/.test(c)){
            var k=i, num='';
            while(k<n && /[0-9.]/.test(src[k])){ num+=src[k]; k++; }
            toks.push({t:'NUM', v:num}); i=k; continue;
        }
        if(isIdStart(c)){
            var m=i, id='';
            while(m<n && isIdPart(src[m])){ id+=src[m]; m++; }
            toks.push({t:'IDENT', v:id}); i=m; continue;
        }
        var two=src.substr(i,2);
        if(two==='<>'||two==='<='||two==='>='){ toks.push({t:'OP', v:two}); i+=2; continue; }
        if(c==='('){ toks.push({t:'LP'}); i++; continue; }
        if(c===')'){ toks.push({t:'RP'}); i++; continue; }
        if(c===','){ toks.push({t:'COMMA'}); i++; continue; }
        if('+-*/=<>'.indexOf(c)>=0){ toks.push({t:'OP', v:c}); i++; continue; }
        i++;  // caractere desconhecido: ignora (robustez)
    }
    toks.push({t:'EOF'});
    return toks;
}

// ---------- PARSER (descida recursiva -> AST) ----------
function parse(toks){
    var p=0;
    function peek(){ return toks[p]; }
    function next(){ return toks[p++]; }
    function expect(t){ if(toks[p].t!==t) throw new Error('esperado '+t); return toks[p++]; }

    function parseExpr(){ return parseOr(); }
    function parseOr(){
        var left=parseAnd();
        while(peek().t==='IDENT' && peek().v.toUpperCase()==='OR'){ next(); left={type:'logic',op:'OR',left:left,right:parseAnd()}; }
        return left;
    }
    function parseAnd(){
        var left=parseCmp();
        while(peek().t==='IDENT' && peek().v.toUpperCase()==='AND'){ next(); left={type:'logic',op:'AND',left:left,right:parseCmp()}; }
        return left;
    }
    function parseCmp(){
        var left=parseAdd();
        if(peek().t==='OP' && ['=','<>','<','>','<=','>='].indexOf(peek().v)>=0){
            var op=next().v; return {type:'cmp',op:op,left:left,right:parseAdd()};
        }
        if(peek().t==='IDENT' && peek().v.toUpperCase()==='IN'){
            next(); expect('LP'); var items=[];
            if(peek().t!=='RP'){ items.push(parseExpr()); while(peek().t==='COMMA'){ next(); items.push(parseExpr()); } }
            expect('RP'); return {type:'in',left:left,items:items};
        }
        if(peek().t==='IDENT' && peek().v.toUpperCase()==='NOT'){
            var save=p; next();
            if(peek().t==='IDENT' && peek().v.toUpperCase()==='IN'){
                next(); expect('LP'); var it2=[];
                if(peek().t!=='RP'){ it2.push(parseExpr()); while(peek().t==='COMMA'){ next(); it2.push(parseExpr()); } }
                expect('RP'); return {type:'notin',left:left,items:it2};
            }
            p=save;
        }
        return left;
    }
    function parseAdd(){
        var left=parseMul();
        while(peek().t==='OP' && (peek().v==='+'||peek().v==='-')){ var op=next().v; left={type:'arith',op:op,left:left,right:parseMul()}; }
        return left;
    }
    function parseMul(){
        var left=parseUnary();
        while(peek().t==='OP' && (peek().v==='*'||peek().v==='/')){ var op=next().v; left={type:'arith',op:op,left:left,right:parseUnary()}; }
        return left;
    }
    function parseUnary(){
        if(peek().t==='OP' && peek().v==='-'){ next(); return {type:'neg',arg:parseUnary()}; }
        return parsePrimary();
    }
    function parsePrimary(){
        var tk=peek();
        if(tk.t==='NUM'){ next(); return {type:'num',value:parseFloat(tk.v),raw:tk.v}; }
        if(tk.t==='STR'){ next(); return {type:'str',value:tk.v}; }
        if(tk.t==='LP'){ next(); var e=parseExpr(); expect('RP'); return e; }
        /*if(tk.t==='IDENT'){
            var name=next().v;
            if(peek().t==='LP'){
                next(); var args=[];
                if(peek().t!=='RP'){ args.push(parseExpr()); while(peek().t==='COMMA'){ next(); args.push(parseExpr()); } }
                expect('RP'); return {type:'call',name:name,args:args};
            }
            return {type:'ident',name:name};
        }*/
       if(tk.t==='IDENT'){
            var name=next().v;
            if(peek().t==='LP'){
                next(); var args=[];
                if(peek().t!=='RP'){ 
                    args.push(parseExpr()); 
                    while(peek().t==='COMMA'){ 
                        next(); 
                        /* --- INICIO DA ADICAO INCREMENTAL --- */
                        if(peek().t==='RP'){
                            args.push({type:'ident', name:'NULL'});
                            break;
                        }
                        /* --- FIM DA ADICAO INCREMENTAL --- */
                        args.push(parseExpr()); 
                    } 
                }
                expect('RP'); return {type:'call',name:name,args:args};
            }
            return {type:'ident',name:name};
        }
        throw new Error('token inesperado');
    }
    return parseExpr();
}

// ---------- AST -> texto SQL (para dentro do PDES) ----------
function astToSqlText(node, doc){
    switch(node.type){
        case 'num': return node.raw;
        case 'str': return node.value;
        case 'ident': {
            var campo=node.name.replace(/^Formula\./i,'').toUpperCase();
            if(doc.hasOwnProperty(campo) && doc[campo]!=null) return String(doc[campo]);
            return node.name;
        }
        case 'arith':
            if(node.op==='+') return astToSqlText(node.left,doc)+' '+astToSqlText(node.right,doc);
            return astToSqlText(node.left,doc)+' '+node.op+' '+astToSqlText(node.right,doc);
        case 'call': {
            var inner=node.args.map(function(a){ return astToSqlText(a,doc); }).join(',');
            return node.name+'('+inner+')';
        }
        case 'in': return astToSqlText(node.left,doc)+' IN ('+node.items.map(function(a){return astToSqlText(a,doc);}).join(',')+')';
        case 'notin': return astToSqlText(node.left,doc)+' NOT IN ('+node.items.map(function(a){return astToSqlText(a,doc);}).join(',')+')';
        case 'cmp': return astToSqlText(node.left,doc)+' '+node.op+' '+astToSqlText(node.right,doc);
        case 'logic': return astToSqlText(node.left,doc)+' '+node.op+' '+astToSqlText(node.right,doc);
        case 'neg': return '-'+astToSqlText(node.arg,doc);
        default: return '';
    }
}

function pdesSql(argsNodes, doc){
    var col=astToSqlText(argsNodes[0],doc);
    var tab=astToSqlText(argsNodes[1],doc);
    var cond=argsNodes[2]?astToSqlText(argsNodes[2],doc):'1=1';
    return q('SELECT '+col+' AS V FROM '+tab+' WHERE '+cond+' AND ROWNUM<=1');
}

// ---------- COLETA de PDES (para o gadget resolver via executeQuery) ----------
function coletaPdesNode(node, doc, acc){
    if(!node || typeof node!=='object') return;
    if(node.type==='call' && node.name.toUpperCase()==='PDES'){
        var sql=pdesSql(node.args, doc);
        var key='PDES_'+hashStr(sql);
        node.__pdesKey=key;
        acc[key]={chave:key, sql:sql};
        return; // nao desce nos args do PDES (sao texto SQL)
    }
    ['left','right','arg'].forEach(function(k){ if(node[k]) coletaPdesNode(node[k],doc,acc); });
    if(node.args) node.args.forEach(function(a){ coletaPdesNode(a,doc,acc); });
    if(node.items) node.items.forEach(function(a){ coletaPdesNode(a,doc,acc); });
}

// ---------- AVALIADOR da AST ----------
function evalNode(node, doc, trace){
    switch(node.type){
        case 'num': return node.value;
        case 'str': return node.value;
        case 'ident': {
            var campo=node.name.replace(/^Formula\./i,'').toUpperCase();
            if(doc.hasOwnProperty(campo)) return doc[campo];
            if(doc.__CUS && doc.__CUS[node.name.toUpperCase()]!=null) return doc.__CUS[node.name.toUpperCase()];
            return null;
        }
        case 'neg': { var v=evalNode(node.arg,doc,trace); return v==null?null:-Number(v); }
        case 'arith': {
            var a=evalNode(node.left,doc,trace), b=evalNode(node.right,doc,trace);
            if(a==null||b==null) return null;
            a=Number(a); b=Number(b);
            switch(node.op){ case '+':return a+b; case '-':return a-b; case '*':return a*b; case '/':return b===0?null:a/b; }
            return null;
        }
        case 'cmp': {
            var l=evalNode(node.left,doc,trace), r=evalNode(node.right,doc,trace);
            if(l==null||r==null) return null;
            var ln=Number(l), rn=Number(r);
            var bothNum=!isNaN(ln)&&!isNaN(rn)&&String(l).trim()!==''&&String(r).trim()!=='';
            var A=bothNum?ln:String(l), B=bothNum?rn:String(r);
            var res;
            switch(node.op){
                case '=': res=A===B; break;   case '<>': res=A!==B; break;
                case '<': res=A<B; break;      case '>': res=A>B; break;
                case '<=': res=A<=B; break;    case '>=': res=A>=B; break;
                default: res=null;
            }
            return res;
        }
        case 'in': { var lv=evalNode(node.left,doc,trace); if(lv==null)return null; return node.items.some(function(it){var iv=evalNode(it,doc,trace);return Number(iv)===Number(lv)||String(iv)===String(lv);}); }
        case 'notin': { var l2=evalNode(node.left,doc,trace); if(l2==null)return null; return !node.items.some(function(it){var iv=evalNode(it,doc,trace);return Number(iv)===Number(l2)||String(iv)===String(l2);}); }
        case 'logic': {
            var la=evalNode(node.left,doc,trace), lb=evalNode(node.right,doc,trace);
            if(node.op==='OR'){ if(la===true||lb===true)return true; if(la==null||lb==null)return null; return false; }
            if(node.op==='AND'){ if(la===false||lb===false)return false; if(la==null||lb==null)return null; return true; }
            return null;
        }
        case 'call': {
            var fn=node.name.toUpperCase();
            if(fn==='IF'){
                var cond=evalNode(node.args[0],doc,trace);
                if(trace) trace.push({tipo:'IF', cond:astToSqlText(node.args[0],doc), res:cond});
                if(cond==null) return null;
                return cond===true ? evalNode(node.args[1],doc,trace) : evalNode(node.args[2],doc,trace);
            }
            if(fn==='VAL'){ return evalNode(node.args[0],doc,trace); }
            if(fn==='PDES'){
                var pv=(doc.__PDES && node.__pdesKey!=null && doc.__PDES[node.__pdesKey]!==undefined)?doc.__PDES[node.__pdesKey]:null;
                if(trace) trace.push({tipo:'VALOR', txt:'PDES', val:pv, ok:pv!=null});
                return pv;
            }
            if(fn==='VALORIMPOSTOCAB'||fn==='VALORIMPOSTOFIN'||fn==='VALORIMPOSTODIN'){
                var cod=evalNode(node.args[0],doc,trace);
                var tipo=node.args[2]?String(evalNode(node.args[2],doc,trace)):'V';
                var key=fn.replace('VALORIMPOSTO','')+'_'+cod+'_'+tipo;
                return (doc.__IMP && doc.__IMP[key]!=null)?doc.__IMP[key]:null;
            }
            return null; // funcao desconhecida fora de PDES
        }
    }
    return null;
}

// ---------- INTERFACE COMPATIVEL com o resto do gadget ----------
// avaliaFormula(formula, doc) -> {valor, incalc, trace}
function avaliaFormula(formula, doc){
    var trace=[];
    try{
        var ast=E_cache(formula);
        var v=evalNode(ast, doc, trace);
        if(v!=null && trace.length===0) trace.push({tipo:'VALOR', txt:normal(formula), val:v, ok:true});
        return { valor: v==null?null:Number(v), incalc: v==null, trace:trace };
    }catch(e){
        return { valor:null, incalc:true, trace:[{tipo:'ERRO', txt:e.message}] };
    }
}

// cache de AST por formula (evita reparsear a mesma formula)
var __astCache={};
function E_cache(formula){
    var key=formula;
    if(__astCache[key]) return __astCache[key];
    var ast=parse(tokenize(formula));
    __astCache[key]=ast;
    return ast;
}

// extraiDeps(formula, doc) -> {imp:[{fn,cod,tipo}], pdes:[{chave,sql}]}
function extraiDeps(formula, doc){
    var imp=[], pdes=[];
    try{
        var ast=E_cache(formula);
        // impostos
        (function walkImp(node){
            if(!node||typeof node!=='object') return;
            if(node.type==='call'){
                var fn=node.name.toUpperCase();
                if(fn==='VALORIMPOSTOCAB'||fn==='VALORIMPOSTOFIN'||fn==='VALORIMPOSTODIN'){
                    var cod=node.args[0]?astToSqlText(node.args[0],doc):'0';
                    var tipo=node.args[2]?String(node.args[2].value||'V'):'V';
                    imp.push({fn:fn.replace('VALORIMPOSTO',''), cod:cod, tipo:tipo});
                }
            }
            ['left','right','arg'].forEach(function(k){ if(node[k]) walkImp(node[k]); });
            if(node.args) node.args.forEach(walkImp);
            if(node.items) node.items.forEach(walkImp);
        })(ast);
        // pdes
        var acc={}; coletaPdesNode(ast, doc, acc);
        Object.keys(acc).forEach(function(k){ pdes.push(acc[k]); });
    }catch(e){}
    return {imp:imp, pdes:pdes};
}

// =====================================================================
// INTEGRACAO SANKHYA
// =====================================================================
function q(sql){ return sql.replace(/\s+/g,' ').trim(); }

function carregarEmpresas(){
    var SQL_EMPRESAS = q(
        "select codemp, codemp || ' - ' || nomefantasia empresa from tsiemp order by 1"
    );

    executeQuery(SQL_EMPRESAS, arr, function(resp){
        var p = parseSeguro(resp, 'SQL_EMPRESAS');

        if (!p.ok){
            document.getElementById('btnEmpresas').textContent = 'Erro ao carregar empresas';
            console.error(p.msg);
            return;
        }

        empresasDisponiveis = p.dados || [];
        montarEmpresas();
    }, function(v){
        document.getElementById('btnEmpresas').textContent = 'Erro ao carregar empresas';
        console.error('[SQL_EMPRESAS] erro:\n' + v);
    });
}

function montarEmpresas(){
    var box = document.getElementById('empresasBox');
    if (!box) return;

    if (!empresasDisponiveis.length){
        box.innerHTML = '<div class="empresa-vazia">Nenhuma empresa encontrada.</div>';
        document.getElementById('btnEmpresas').textContent = 'Nenhuma empresa';
        return;
    }

    var html =
        '<div class="empresa-acoes">' +
            '<button type="button" class="empresa-acao" onclick="marcarTodasEmpresas(true)">Marcar todas</button>' +
            '<button type="button" class="empresa-acao" onclick="marcarTodasEmpresas(false)">Desmarcar todas</button>' +
        '</div>';

    empresasDisponiveis.forEach(function(E){
        html +=
            '<label class="empresa-item">' +
                '<input type="checkbox" class="empresa-check" value="' +
                    escapeHtml(String(E.CODEMP || E.CODEMP || '')) + '" checked ' +
                'onchange="atualizarTextoEmpresas()">' +
                '<span>' + escapeHtml(String(E.EMPRESA || '')) + '</span>' +
            '</label>';
    });

    box.innerHTML = html;
    atualizarTextoEmpresas();
}

function toggleEmpresas(){
    var box = document.getElementById('empresasBox');
    if (!box) return;
    box.classList.toggle('hidden');
}

function marcarTodasEmpresas(marcar){
    var checks = document.querySelectorAll('.empresa-check');
    for (var i=0; i<checks.length; i++) checks[i].checked = marcar;
    atualizarTextoEmpresas();
}

function obterEmpresasSelecionadas(){
    var checks = document.querySelectorAll('.empresa-check:checked');
    var result = [];

    for (var i=0; i<checks.length; i++){
        var valor = Number(checks[i].value);
        if (!isNaN(valor) && valor > 0) result.push(valor);
    }

    return result;
}

function atualizarTextoEmpresas(){
    var btn = document.getElementById('btnEmpresas');
    if (!btn) return;

    var checks = document.querySelectorAll('.empresa-check');
    var selecionadas = document.querySelectorAll('.empresa-check:checked');

    if (!checks.length){
        btn.textContent = 'Nenhuma empresa';
        return;
    }

    if (selecionadas.length === checks.length){
        btn.textContent = 'Todas as empresas';
        return;
    }

    if (selecionadas.length === 0){
        btn.textContent = 'Nenhuma empresa selecionada';
        return;
    }

    btn.textContent = selecionadas.length + ' empresa' +
        (selecionadas.length === 1 ? '' : 's') + ' selecionada' +
        (selecionadas.length === 1 ? '' : 's');
}

function formatarData(data){
    if (!data) return '';
    var p = data.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : data;
}

window.addEventListener('load', function(){
    carregarEmpresas();
});

document.addEventListener('click', function(e){
    var campo = document.getElementById('campoEmpresas');
    var box = document.getElementById('empresasBox');
    if (campo && box && !campo.contains(e.target)) box.classList.add('hidden');
});

function processarCompetencia(){
    var dataInicial = document.getElementById('dataInicial').value;
    var dataFinal = document.getElementById('dataFinal').value;

    if (!dataInicial || !dataFinal){
        alert('Informe a referencia inicial e final.');
        return;
    }

    if (dataInicial > dataFinal){
        alert('A referencia inicial nao pode ser maior que a referencia final.');
        return;
    }

    var empresas = obterEmpresasSelecionadas();

    if (!empresas.length){
        alert('Selecione pelo menos uma empresa.');
        return;
    }

    setLoader('Buscando documentos da referencia ' + formatarData(dataInicial) + ' ate ' + formatarData(dataFinal) + '...');
    hide('cards');
    hide('resumo');
    hide('tabela');
    document.getElementById('btn').disabled = true;

    /*
     * PRIMEIRA ETAPA:
     * Apenas lista todos os documentos da competencia.
     *
     * A competencia segue a mesma referencia utilizada pelo codigo
     * original: TRUNC(DHBAIXA,'MM').
     *
     * Nenhuma parte do motor de formulas, TGFCTB, PDES, impostos ou
     * comparacao com TCBLAN e alterada nesta etapa.
     */
    var SQL_DOCUMENTOS = q(
        "SELECT " +
        "  TO_CHAR(TRUNC(V.DHBAIXA,'MM'),'YYYY-MM-DD') AS REFERENCIA, " +
        "  V.NUFIN, " +
        "  NVL(V.NUNOTA,0) AS NUNOTA, " +
        "  NVL(V.NUMNOTA,0) AS NUMNOTA, " +
        "  NVL(V.CODPARC,0) AS CODPARC, " +
        "  NVL(TGFPAR.NOMEPARC,'NDA') AS PARCEIRO, " +
        "  NVL(V.CODEMP,0) AS CODEMP, " +
        "  NVL(TSIEMP.NOMEFANTASIA, NVL(V.CODEMP,0)) AS EMPRESA, " +
        "  NVL(V.CODTIPOPERBAIXA,0) AS TOP, " +
        "  NVL(V.VLRBAIXA,0) AS VLRBAIXA, " +
        "  NVL(V.DHBAIXA,TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHBAIXA " +
        "FROM VGFFINRAT V " +
        "LEFT JOIN TGFPAR ON TGFPAR.CODPARC = V.CODPARC " +
        "LEFT JOIN TSIEMP ON TSIEMP.CODEMP = V.CODEMP " +
        "WHERE V.DHBAIXA >= TO_DATE('" + dataInicial + "','YYYY-MM-DD') " +
        "  AND V.DHBAIXA < TO_DATE('" + dataFinal + "','YYYY-MM-DD') + 1 " +
        "  AND V.CODEMP IN (" + empresas.join(',') + ") " +
        "ORDER BY V.NUFIN"
    );

    console.log('SQL_DOCUMENTOS:\n' + SQL_DOCUMENTOS);

    executeQuery(SQL_DOCUMENTOS, arr, function(resp){
        var p = parseSeguro(resp, 'SQL_DOCUMENTOS');

        if (!p.ok){
            return mostrarErro(p.msg + '\n\nQUERY:\n' + SQL_DOCUMENTOS);
        }

        var docs = p.dados || [];

        if (!docs.length){
            document.getElementById('btn').disabled = false;
            return mostrarErro(
                'Nenhum documento encontrado para a referencia ' +
                formatarData(dataInicial) + ' ate ' + formatarData(dataFinal) + '.'
            );
        }

        montarListaCompetencia(docs, formatarData(dataInicial) + ' ate ' + formatarData(dataFinal));
        document.getElementById('btn').disabled = false;

    }, function(v){
        mostrarErro('[SQL_DOCUMENTOS] erro:\n' + v);
    });
}


var tabelaDocumentos = {
    docs: [],
    filtrados: [],
    competencia: '',
    pagina: 1,
    porPagina: 25,
    ordemCampo: 'NUFIN',
    ordemDir: 'asc',
    busca: '',
    empresa: '',
    top: ''
};


function montarListaCompetencia(docs, competencia){
    var totalValor = 0;

    docs.forEach(function(D){
        totalValor += Number(D.VLRBAIXA || 0);
    });

    tabelaDocumentos.docs = docs.slice();
    window.__docsCompetencia = tabelaDocumentos.docs;
    tabelaDocumentos.competencia = competencia;
    tabelaDocumentos.pagina = 1;
    tabelaDocumentos.ordemCampo = 'NUFIN';
    tabelaDocumentos.ordemDir = 'asc';
    tabelaDocumentos.busca = '';
    tabelaDocumentos.empresa = '';
    tabelaDocumentos.top = '';

    document.getElementById('cards').innerHTML =
        card('Referencia', competencia) +
        card('Documentos', docs.length) +
        card('Valor das baixas', 'R$ ' + fmt(totalValor));

    show('cards');

    document.getElementById('resumo').textContent =
        docs.length + ' documento' + (docs.length === 1 ? '' : 's') +
        ' encontrado' + (docs.length === 1 ? '' : 's') +
        ' na referencia ' + competencia +
        '. Clique no + para abrir a memoria de calculo de cada documento.';

    show('resumo');

    renderTabelaDocumentos();
    show('tabela');
    hide('loader');
}


function obterListaEmpresasTabela(){
    var mapa = {};
    (tabelaDocumentos.docs || []).forEach(function(D){
        var cod = String(D.CODEMP == null ? '' : D.CODEMP);
        var nome = String(D.EMPRESA || D.CODEMP || '');
        if (cod && !mapa[cod]){
            mapa[cod] = {cod:cod, nome:nome};
        }
    });

    return Object.keys(mapa).map(function(k){
        return mapa[k];
    }).sort(function(a,b){
        return Number(a.cod)-Number(b.cod);
    });
}


function obterListaTOPsTabela(){
    var mapa = {};
    (tabelaDocumentos.docs || []).forEach(function(D){
        var top = String(D.TOP == null ? '' : D.TOP);
        if (top) mapa[top] = true;
    });

    return Object.keys(mapa).sort(function(a,b){
        var na=Number(a), nb=Number(b);
        if (!isNaN(na) && !isNaN(nb)) return na-nb;
        return a.localeCompare(b);
    });
}


function aplicarFiltrosTabela(){
    var busca = String(tabelaDocumentos.busca || '').toLowerCase().trim();
    var empresa = String(tabelaDocumentos.empresa || '');
    var top = String(tabelaDocumentos.top || '');

    tabelaDocumentos.filtrados = tabelaDocumentos.docs.filter(function(D){
        var texto = [
            D.NUFIN,
            D.PARCEIRO,
            D.CODEMP,
            D.EMPRESA,
            D.TOP,
            D.NUNOTA,
            D.NUMNOTA,
            D.VLRBAIXA,
            D.DHBAIXA
        ].join(' ').toLowerCase();

        if (busca && texto.indexOf(busca) < 0) return false;
        if (empresa && String(D.CODEMP) !== empresa) return false;
        if (top && String(D.TOP) !== top) return false;

        return true;
    });

    ordenarDocumentosTabela();

    var totalPaginas = Math.max(1, Math.ceil(
        tabelaDocumentos.filtrados.length / tabelaDocumentos.porPagina
    ));

    if (tabelaDocumentos.pagina > totalPaginas){
        tabelaDocumentos.pagina = totalPaginas;
    }
}


function ordenarDocumentosTabela(){
    var campo = tabelaDocumentos.ordemCampo;
    var dir = tabelaDocumentos.ordemDir === 'desc' ? -1 : 1;

    tabelaDocumentos.filtrados.sort(function(a,b){
        var va = a[campo];
        var vb = b[campo];

        if (campo === 'VLRBAIXA'){
            va = Number(va || 0);
            vb = Number(vb || 0);
        } else if (campo === 'NUFIN' ||
                   campo === 'CODEMP' ||
                   campo === 'TOP' ||
                   campo === 'NUNOTA' ||
                   campo === 'NUMNOTA'){
            va = Number(va || 0);
            vb = Number(vb || 0);

            if (isNaN(va)) va = String(a[campo] || '');
            if (isNaN(vb)) vb = String(b[campo] || '');
        } else if (campo === 'DHBAIXA'){
            va = new Date(a[campo] || 0).getTime() || 0;
            vb = new Date(b[campo] || 0).getTime() || 0;
        } else {
            va = String(va == null ? '' : va).toLowerCase();
            vb = String(vb == null ? '' : vb).toLowerCase();
        }

        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
    });
}


function renderTabelaDocumentos(){
    aplicarFiltrosTabela();

    var empresas = obterListaEmpresasTabela();
    var tops = obterListaTOPsTabela();

    var inicio = (tabelaDocumentos.pagina - 1) * tabelaDocumentos.porPagina;
    var fim = inicio + tabelaDocumentos.porPagina;

    var paginaDocs = tabelaDocumentos.filtrados.slice(inicio, fim);

    var html =
        '<div class="tabela-toolbar">' +

            '<div class="filtro">' +
                '<label>Filtro geral</label>' +
                '<input class="busca" type="text" id="filtroBuscaTabela" ' +
                    'placeholder="NUFIN, parceiro, nota, valor..." ' +
                    'value="' + escapeHtml(tabelaDocumentos.busca) + '" ' +
                    'oninput="alterarFiltroTabela(\'busca\', this.value)" />' +
            '</div>' +

            '<div class="filtro">' +
                '<label>Empresa</label>' +
                '<select id="filtroEmpresaTabela" onchange="alterarFiltroTabela(\'empresa\', this.value)">' +
                    '<option value="">Todas</option>';

    empresas.forEach(function(E){
        html +=
            '<option value="' + escapeHtml(E.cod) + '"' +
            (tabelaDocumentos.empresa === E.cod ? ' selected' : '') +
            '>' +
            escapeHtml(E.cod + ' - ' + E.nome) +
            '</option>';
    });

    html +=
            '</select>' +
        '</div>' +

        '<div class="filtro">' +
            '<label>TOP</label>' +
            '<select id="filtroTOPTabela" onchange="alterarFiltroTabela(\'top\', this.value)">' +
                '<option value="">Todas</option>';

    tops.forEach(function(T){
        html +=
            '<option value="' + escapeHtml(T) + '"' +
            (tabelaDocumentos.top === T ? ' selected' : '') +
            '>' + escapeHtml(T) + '</option>';
    });

    html +=
            '</select>' +
        '</div>' +

        '<div class="filtro">' +
            '<label>Por pagina</label>' +
            '<select onchange="alterarFiltroTabela(\'porPagina\', this.value)">' +
                '<option value="25"' + (tabelaDocumentos.porPagina === 25 ? ' selected' : '') + '>25</option>' +
                '<option value="50"' + (tabelaDocumentos.porPagina === 50 ? ' selected' : '') + '>50</option>' +
                '<option value="100"' + (tabelaDocumentos.porPagina === 100 ? ' selected' : '') + '>100</option>' +
                '<option value="200"' + (tabelaDocumentos.porPagina === 200 ? ' selected' : '') + '>200</option>' +
            '</select>' +
        '</div>' +

        '<button type="button" class="filtro-limpar" onclick="limparFiltrosTabela()">Limpar</button>' +

        '<div class="filtro-contador">' +
            tabelaDocumentos.filtrados.length +
            ' de ' + tabelaDocumentos.docs.length + ' documentos' +
        '</div>' +

    '</div>' +

    '<table>' +
        '<thead>' +
            '<tr>' +
                '<th style="width:42px"></th>' +
                criarThOrdenacao('NUFIN', 'NUFIN') +
                criarThOrdenacao('PARCEIRO', 'Parceiro') +
                criarThOrdenacao('CODEMP', 'Empresa') +
                criarThOrdenacao('TOP', 'TOP') +
                criarThOrdenacao('NUNOTA', 'NUNOTA') +
                criarThOrdenacao('NUMNOTA', 'NUMNOTA') +
                criarThOrdenacao('VLRBAIXA', 'Valor baixa', true) +
                criarThOrdenacao('DHBAIXA', 'Data baixa') +
            '</tr>' +
        '</thead>' +
        '<tbody>';

    if (!paginaDocs.length){
        html +=
            '<tr>' +
                '<td colspan="9" style="text-align:center;padding:24px;color:#64748b">' +
                    'Nenhum documento encontrado com os filtros atuais.' +
                '</td>' +
            '</tr>';
    }

    paginaDocs.forEach(function(D){
        var idx = tabelaDocumentos.docs.indexOf(D);

        /*
         * idx usa o documento original para preservar o estado de cada
         * linha expansivel mesmo quando a lista esta filtrada/ordenada.
         */
        if (idx < 0) idx = tabelaDocumentos.docs.findIndex(function(X){
            return String(X.NUFIN) === String(D.NUFIN);
        });

        var detalheId = 'detalhe_' + idx;
        var botaoId = 'expand_' + idx;

        html +=
            '<tr class="doc-row">' +
                '<td style="text-align:center">' +
                    '<button type="button" class="expand-btn" id="' + botaoId +
                    '" onclick="toggleDocumento(' + idx + ')">+</button>' +
                '</td>' +
                '<td>' + escapeHtml(String(D.NUFIN || '')) + '</td>' +
                '<td>' + escapeHtml(String(D.PARCEIRO || 'NDA')) + '</td>' +
                '<td>' + escapeHtml(String(D.EMPRESA || D.CODEMP || '')) + '</td>' +
                '<td>' + escapeHtml(String(D.TOP || '')) + '</td>' +
                '<td>' + escapeHtml(String(D.NUNOTA || '')) + '</td>' +
                '<td>' + escapeHtml(String(D.NUMNOTA || '')) + '</td>' +
                '<td class="num">' + fmt(D.VLRBAIXA) + '</td>' +
                '<td>' + escapeHtml(String(D.DHBAIXA || '')) + '</td>' +
            '</tr>' +
            '<tr class="detalhe-row hidden" id="' + detalheId + '">' +
                '<td colspan="9">' +
                    '<div class="detalhe-box">' +
                        '<div class="detalhe-status">Clique no + para validar o documento.</div>' +
                    '</div>' +
                '</td>' +
            '</tr>';
    });

    html +=
        '</tbody>' +
    '</table>' +
    montarPaginacaoTabela();

    document.getElementById('tabela').innerHTML = html;
}


function criarThOrdenacao(campo, titulo, numerico){
    var seta = '';

    if (tabelaDocumentos.ordemCampo === campo){
        seta = tabelaDocumentos.ordemDir === 'asc' ? '▲' : '▼';
    } else {
        seta = '↕';
    }

    return '<th class="sortable' + (numerico ? ' num' : '') +
        '" onclick="ordenarTabelaPor(\'' + campo + '\')">' +
        escapeHtml(titulo) +
        ' <span class="seta">' + seta + '</span>' +
    '</th>';
}


function ordenarTabelaPor(campo){
    if (tabelaDocumentos.ordemCampo === campo){
        tabelaDocumentos.ordemDir =
            tabelaDocumentos.ordemDir === 'asc' ? 'desc' : 'asc';
    } else {
        tabelaDocumentos.ordemCampo = campo;
        tabelaDocumentos.ordemDir = 'asc';
    }

    tabelaDocumentos.pagina = 1;
    renderTabelaDocumentos();
}


function alterarFiltroTabela(tipo, valor){
    if (tipo === 'busca') tabelaDocumentos.busca = String(valor || '');
    if (tipo === 'empresa') tabelaDocumentos.empresa = String(valor || '');
    if (tipo === 'top') tabelaDocumentos.top = String(valor || '');

    if (tipo === 'porPagina'){
        tabelaDocumentos.porPagina = Number(valor) || 25;
        tabelaDocumentos.pagina = 1;
    }

    if (tipo !== 'porPagina'){
        tabelaDocumentos.pagina = 1;
    }

    renderTabelaDocumentos();

    /*
     * Devolve o foco para o campo de busca para permitir digitacao
     * continua sem comportamento estranho.
     */
    if (tipo === 'busca'){
        var campo = document.getElementById('filtroBuscaTabela');
        if (campo){
            campo.focus();
            try {
                campo.setSelectionRange(campo.value.length, campo.value.length);
            } catch(e){}
        }
    }
}


function limparFiltrosTabela(){
    tabelaDocumentos.busca = '';
    tabelaDocumentos.empresa = '';
    tabelaDocumentos.top = '';
    tabelaDocumentos.pagina = 1;

    renderTabelaDocumentos();
}


function irPaginaTabela(pagina){
    var total = Math.max(1, Math.ceil(
        tabelaDocumentos.filtrados.length / tabelaDocumentos.porPagina
    ));

    pagina = Number(pagina);

    if (pagina < 1) pagina = 1;
    if (pagina > total) pagina = total;

    tabelaDocumentos.pagina = pagina;
    renderTabelaDocumentos();
}


function montarPaginacaoTabela(){
    var total = Math.max(1, Math.ceil(
        tabelaDocumentos.filtrados.length / tabelaDocumentos.porPagina
    ));

    var atual = tabelaDocumentos.pagina;

    var inicio = Math.max(1, atual - 2);
    var fim = Math.min(total, atual + 2);

    var html =
        '<div class="paginacao">' +
            '<button type="button" class="pag-btn" ' +
                (atual === 1 ? 'disabled' : '') +
                ' onclick="irPaginaTabela(' + (atual-1) + ')">‹</button>';

    for (var p=inicio; p<=fim; p++){
        html +=
            '<button type="button" class="pag-btn ' +
                (p === atual ? 'ativo' : '') +
                '" onclick="irPaginaTabela(' + p + ')">' +
                p +
            '</button>';
    }

    html +=
            '<button type="button" class="pag-btn" ' +
                (atual === total ? 'disabled' : '') +
                ' onclick="irPaginaTabela(' + (atual+1) + ')">›</button>' +
            '<span class="pag-info">' +
                'Pagina ' + atual + ' de ' + total +
            '</span>' +
        '</div>';

    return html;
}



function toggleDocumento(idx){
    var docs = window.__docsCompetencia || [];
    var D = docs[idx];

    if (!D) return;

    var detalhe = document.getElementById('detalhe_' + idx);
    var botao = document.getElementById('expand_' + idx);

    if (!detalhe || !botao) return;

    var aberto = !detalhe.classList.contains('hidden');

    if (aberto){
        detalhe.classList.add('hidden');
        botao.classList.remove('open');
        botao.textContent = '+';
        return;
    }

    detalhe.classList.remove('hidden');
    botao.classList.add('open');
    botao.textContent = '−';

    var box = detalhe.querySelector('.detalhe-box');

    /*
     * Nao refaz a consulta se o documento ja foi validado.
     * Isso permite abrir/fechar o mesmo documento sem repetir as queries.
     */
    if (box.getAttribute('data-carregado') === 'S') return;

    box.setAttribute('data-carregado', 'S');

    box.innerHTML =
        '<div class="detalhe-status">Buscando memoria de calculo do NUFIN ' +
        escapeHtml(String(D.NUFIN)) + '...</div>';

    validarDocumento(String(D.NUFIN), 'detalhe_' + idx);
}


function setDetalheStatus(detalheId, texto){
    var detalhe = document.getElementById(detalheId);
    if (!detalhe) return;

    var box = detalhe.querySelector('.detalhe-box');
    if (!box) return;

    box.innerHTML = '<div class="detalhe-status">' + escapeHtml(texto) + '</div>';
}


function mostrarErroDetalhe(detalheId, msg){
    console.error(msg);

    var detalhe = document.getElementById(detalheId);
    if (!detalhe) return;

    var box = detalhe.querySelector('.detalhe-box');
    if (!box) return;

    box.innerHTML =
        '<div class="detalhe-erro">' +
            escapeHtml(msg) +
        '</div>';
}


function miniCard(rot, val){
    return '<div class="mini-card">' +
        '<div class="rot">' + escapeHtml(String(rot)) + '</div>' +
        '<div class="val">' + escapeHtml(String(val)) + '</div>' +
    '</div>';
}


function montarResultadoDetalhe(D, cfg, mapReal, detalheId){
    var linhas=[], seqsCfg={}, totSim=0, totReal=0, nOk=0, nDiv=0, nErro=0;

    cfg.forEach(function(r){
        seqsCfg[String(r.SEQUENCIA)]=true;

        var res = avaliaFormula(r.FORMULA || '', D);
        var ctaSim=(r.CTACTBCONST==='S')?
            (String(r.CODCTACTB).match(/^\d+$/)?Number(r.CODCTACTB):null):null;

        var real = mapReal[String(r.SEQUENCIA)] || null;
        var vlrSim = res.valor;
        var vlrReal = real ? Number(real.VLRLANC) : null;
        var ctaReal = real ? Number(real.CODCTACTB) : null;

        var status;

        if (res.incalc) status='ERRO';
        else if (!real && (vlrSim==null || Math.abs(vlrSim)<0.005)) status='NAOAPL';
        else if (!real && vlrSim!==0) status='CONFIG';
        else if (ctaSim==null) status='VARIAVEL';
        else if (Math.abs((vlrSim||0)-(vlrReal||0))<0.01 && ctaSim===ctaReal) status='OK';
        else status='DIVERGENTE';

        if (status==='OK') nOk++;
        if (status==='DIVERGENTE') nDiv++;
        if (status==='ERRO') nErro++;

        if (vlrSim!=null) totSim += vlrSim;
        if (vlrReal!=null) totReal += vlrReal;

        linhas.push({
            seq:r.SEQUENCIA,
            dc:r.DC,
            ctaSim:ctaSim,
            ctaSimTxt:r.CODCTACTB,
            vlrSim:vlrSim,
            ctaReal:ctaReal,
            dcReal:real?real.TIPLANC:null,
            vlrReal:vlrReal,
            dif:(vlrSim||0)-(vlrReal||0),
            status:status,
            trace:res.trace,
            formula:normal(r.FORMULA)
        });
    });

    Object.keys(mapReal).forEach(function(sq){
        if (!seqsCfg[sq]){
            var real=mapReal[sq];

            linhas.push({
                seq:sq,
                dc:null,
                ctaSim:null,
                ctaSimTxt:null,
                vlrSim:null,
                ctaReal:Number(real.CODCTACTB),
                dcReal:real.TIPLANC,
                vlrReal:Number(real.VLRLANC),
                dif:-(Number(real.VLRLANC)),
                status:'CONFIG',
                trace:[],
                formula:'(sem config)'
            });
        }
    });

    linhas.sort(function(a,b){
        return Number(a.seq)-Number(b.seq);
    });

    var statusGeral = nErro ?
        'ERRO RESOLUCAO' :
        nDiv ?
            'DIVERGENTE' :
            'OK';

    var html =
        '<div class="detalhe-resumo">' +
            miniCard('Documento', 'NUFIN ' + D.NUFIN) +
            miniCard('TOP', D.TOP) +
            miniCard('Valor baixa', 'R$ ' + fmt(D.VLRBAIXA)) +
            miniCard('Simulado', 'R$ ' + fmt(totSim)) +
            miniCard('Lancado', 'R$ ' + fmt(totReal)) +
            miniCard('Diferenca', 'R$ ' + fmt(totSim-totReal)) +
            miniCard('Resultado', statusGeral) +
        '</div>' +
        '<div class="resumo-linha">' +
            linhas.length + ' sequencias | ' +
            nOk + ' OK | ' +
            nDiv + ' divergentes' +
            (nErro ? ' | ' + nErro + ' com erro de resolucao' : '') +
        '</div>' +
        '<table class="detalhe-table">' +
            '<thead>' +
                '<tr>' +
                    '<th>Seq</th>' +
                    '<th>DC</th>' +
                    '<th>Conta simulada</th>' +
                    '<th class="num">Vlr simulado</th>' +
                    '<th>Conta real</th>' +
                    '<th class="num">Vlr real</th>' +
                    '<th class="num">Dif</th>' +
                    '<th>Status</th>' +
                    '<th>Formula / Memoria</th>' +
                '</tr>' +
            '</thead>' +
            '<tbody>';

    linhas.forEach(function(L){
        var stClass='st-'+(L.status==='NAOAPL'?'NAOAPL':L.status);
        var stLabel={
            OK:'OK',
            DIVERGENTE:'DIVERGENTE',
            CONFIG:'CONFIG SEM LANCTO',
            ERRO:'ERRO RESOLUCAO',
            VARIAVEL:'CONTA VARIAVEL',
            NAOAPL:'NAO APLICAVEL'
        }[L.status];

        html +=
            '<tr>' +
                '<td>' + escapeHtml(String(L.seq)) + '</td>' +
                '<td>' + escapeHtml(String(L.dc || '-')) + '</td>' +
                '<td>' +
                    (L.ctaSim!=null ?
                        escapeHtml(String(L.ctaSim)) :
                        '<span style="color:#94a3b8">' +
                            escapeHtml(String(L.ctaSimTxt || '-')) +
                        '</span>') +
                '</td>' +
                '<td class="num">' + fmt(L.vlrSim) + '</td>' +
                '<td>' +
                    (L.ctaReal!=null ? escapeHtml(String(L.ctaReal)) : '-') +
                    (L.dcReal ?
                        ' <span style="color:#94a3b8">(' +
                        escapeHtml(String(L.dcReal)) +
                        ')</span>' : '') +
                '</td>' +
                '<td class="num">' + fmt(L.vlrReal) + '</td>' +
                '<td class="num" style="' +
                    (Math.abs(L.dif)>=0.01 ?
                        'color:#dc2626;font-weight:600' : '') +
                    '">' + fmt(L.dif) +
                '</td>' +
                '<td><span class="st ' + stClass + '">' +
                    stLabel +
                '</span></td>' +
                '<td class="formula">' +
                    escapeHtml(L.formula) +
                    (L.trace&&L.trace.length ?
                        '<details><summary>memoria de calculo</summary>' +
                        '<div class="trace">' +
                            renderTrace(L.trace) +
                        '</div></details>' : '') +
                '</td>' +
            '</tr>';
    });

    html += '</tbody></table>';

    var detalhe = document.getElementById(detalheId);
    if (!detalhe) return;

    var box = detalhe.querySelector('.detalhe-box');
    if (!box) return;

    box.innerHTML = html;
}


function validarDocumento(nunico, detalheId){
 var SQL_DOC_bkp = q(
        "SELECT " +
        "  TO_CHAR(TRUNC(V.DHBAIXA,'MM'),'YYYY-MM-DD') AS REFERENCIA " +
        " ,NVL(V.CODPARC, 0) AS CODPARC, NVL(V.CODNAT, 0) AS CODNAT, NVL(V.CODPROJ, 0) AS CODPROJ, NVL(V.CODCENCUS, 0) AS CODCENCUS, NVL(V.RECDESP, 0) AS RECDESP, NVL(V.DTNEG, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTNEG, NVL(V.DTVENC, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTVENC, NVL(V.PROVISAO, '') AS PROVISAO, NVL(V.CODTIPTIT, 0) AS CODTIPTIT, NVL(V.VLRLIQUIDO, 0) AS VLRLIQUIDO, NVL(V.VLRDESDOB, 0) AS VLRDESDOB, NVL(V.VLRBAIXA, 0) AS VLRBAIXA, NVL(V.NUFIN, 0) AS NUFIN, NVL(V.NUNOTA, 0) AS NUNOTA, NVL(V.CODEMP, 0) AS CODEMP, NVL(V.NUMNOTA, 0) AS NUMNOTA, NVL(V.CODBCO, 0) AS CODBCO, NVL(V.HISTORICO, '') AS HISTORICO, NVL(V.DHBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHBAIXA, NVL(V.CODVEND, 0) AS CODVEND, NVL(V.CODTIPOPER, 0) AS CODTIPOPER, NVL(V.DHTIPOPER, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHTIPOPER, NVL(V.CODTIPOPERBAIXA, 0) AS CODTIPOPERBAIXA, NVL(V.DHTIPOPERBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHTIPOPERBAIXA, NVL(V.DTBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTBAIXA, NVL(V.NUMCONTRATO, 0) AS NUMCONTRATO, NVL(V.VLRJUROEXTRA, 0) AS VLRJUROEXTRA, NVL(V.VLRMULTAEXTRA, 0) AS VLRMULTAEXTRA, NVL(V.VLRISSEXTRA, 0) AS VLRISSEXTRA, NVL(V.OUTROSIMPOSTOSEXTRA, 0) AS OUTROSIMPOSTOSEXTRA, NVL(V.VLRJUROINC, 0) AS VLRJUROINC, NVL(V.VLRMULTAINC, 0) AS VLRMULTAINC, NVL(V.VLRISSINC, 0) AS VLRISSINC, NVL(V.OUTROSIMPOSTOSINC, 0) AS OUTROSIMPOSTOSINC, NVL(V.VLRATUALIZADO, 0) AS VLRATUALIZADO, NVL(V.VLREMMOEDA, 0) AS VLREMMOEDA, NVL(V.VLRMOEDANEG, 0) AS VLRMOEDANEG, NVL(V.VLRMOEDAVENC, 0) AS VLRMOEDAVENC, NVL(V.VLRBAIXACOMIMP, 0) AS VLRBAIXACOMIMP, NVL(V.IMPNOTA, 0) AS IMPNOTA, NVL(V.SERIENOTA, '') AS SERIENOTA, NVL(V.DESDOBRAMENTO, '') AS DESDOBRAMENTO, NVL(V.DHMOV, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHMOV, NVL(V.DTVENCINIC, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTVENCINIC, NVL(V.DTCONTAB, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTCONTAB, NVL(V.DTCONTABBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTCONTABBAIXA, NVL(V.CODCTABCOINT, 0) AS CODCTABCOINT, NVL(V.CODMOEDA, 0) AS CODMOEDA, NVL(V.NUMDUPL, 0) AS NUMDUPL, NVL(V.DESDOBDUPL, '') AS DESDOBDUPL, NVL(V.NOSSONUM, '') AS NOSSONUM, NVL(V.VLRVENDOR, 0) AS VLRVENDOR, NVL(V.VLRIRF, 0) AS VLRIRF, NVL(V.VLRISS, 0) AS VLRISS, NVL(V.VLRCHEQUE, 0) AS VLRCHEQUE, NVL(V.DESPCART, 0) AS DESPCART, NVL(V.ISSRETIDO, '') AS ISSRETIDO, NVL(V.VLRDESC, 0) AS VLRDESC, NVL(V.VLRMULTA, 0) AS VLRMULTA, NVL(V.VLRINSS, 0) AS VLRINSS, NVL(V.TIPMULTA, '') AS TIPMULTA, NVL(V.VLRJURO, 0) AS VLRJURO, NVL(V.TIPJURO, '') AS TIPJURO, NVL(V.BASEICMS, 0) AS BASEICMS, NVL(V.ALIQICMS, 0) AS ALIQICMS, NVL(V.CODEMPBAIXA, 0) AS CODEMPBAIXA, NVL(V.NUMREMESSA, 0) AS NUMREMESSA, NVL(V.AUTORIZADO, '') AS AUTORIZADO, NVL(V.ORIGEM, '') AS ORIGEM, NVL(V.TIPMARCCHEQ, '') AS TIPMARCCHEQ, NVL(V.NUBCO, 0) AS NUBCO, NVL(V.NUDEV, 0) AS NUDEV, NVL(V.NURENEG, 0) AS NURENEG, NVL(V.CARTA, 0) AS CARTA, NVL(V.RATEADO, '') AS RATEADO, NVL(V.DTENTSAI, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTENTSAI, NVL(V.CODUSUBAIXA, 0) AS CODUSUBAIXA, NVL(V.VLRPROV, 0) AS VLRPROV, NVL(V.IRFRETIDO, '') AS IRFRETIDO, NVL(V.INSSRETIDO, '') AS INSSRETIDO, NVL(V.CARTAODESC, 0) AS CARTAODESC, NVL(V.DTALTER, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTALTER, NVL(V.ORDEMCARGA, 0) AS ORDEMCARGA, NVL(V.CODVEICULO, 0) AS CODVEICULO, NVL(V.CODBARRA, '') AS CODBARRA, NVL(V.CODUSU, 0) AS CODUSU, NVL(V.SEQUENCIA, 0) AS SEQUENCIA, NVL(V.VLRVARCAMBIAL, 0) AS VLRVARCAMBIAL, NVL(V.CODIGOBARRA, '') AS CODIGOBARRA, NVL(V.LINHADIGITAVEL, '') AS LINHADIGITAVEL, NVL(V.VLRDESCEMBUT, 0) AS VLRDESCEMBUT, NVL(V.VLRJUROEMBUT, 0) AS VLRJUROEMBUT, NVL(V.VLRMULTAEMBUT, 0) AS VLRMULTAEMBUT, NVL(V.VLRMOEDA, 0) AS VLRMOEDA, NVL(V.VLRMOEDABAIXA, 0) AS VLRMOEDABAIXA, NVL(V.NUCOMPENS, 0) AS NUCOMPENS, NVL(V.CODCFO, 0) AS CODCFO, NVL(V.VLRMULTANEGOC, 0) AS VLRMULTANEGOC, NVL(V.VLRJURONEGOC, 0) AS VLRJURONEGOC, NVL(V.VLRMULTALIB, 0) AS VLRMULTALIB, NVL(V.VLRJUROLIB, 0) AS VLRJUROLIB, NVL(V.DTBAIXAPREV, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTBAIXAPREV, NVL(V.NUMOS, 0) AS NUMOS, NVL(V.NATUREZAOPERDES, '') AS NATUREZAOPERDES, NVL(V.SERIENFDES, '') AS SERIENFDES, NVL(V.MODELONFDES, '') AS MODELONFDES, NVL(V.CODFUNC, 0) AS CODFUNC, NVL(V.CODCONTATO, 0) AS CODCONTATO, NVL(V.NUAPONTA, 0) AS NUAPONTA, NVL(V.NUMBOR, 0) AS NUMBOR, NVL(V.M2, 0) AS M2, NVL(V.DIGSAFRA, '') AS DIGSAFRA, NVL(V.NFENTSEQFIX, '') AS NFENTSEQFIX, NVL(V.NFCOMPLFIX, 0) AS NFCOMPLFIX, NVL(V.CODPARCRESP, 0) AS CODPARCRESP, NVL(V.PDD, '') AS PDD, NVL(V.CODUSUCOBR, 0) AS CODUSUCOBR, NVL(V.NUIMP, 0) AS NUIMP, NVL(V.NUMNFSE, '') AS NUMNFSE, NVL(V.VLRALIBERAR, 0) AS VLRALIBERAR, NVL(V.CONVENIO, 0) AS CONVENIO, NVL(V.CHAVECTE, '') AS CHAVECTE, NVL(V.CHAVECTEREF, '') AS CHAVECTEREF" +
        " FROM VGFFINRAT V WHERE V.NUFIN = " + Number(nunico) + " AND ROWNUM = 1"

    );

 var SQL_DOC = q(
        "SELECT " +
        "  TO_CHAR(TRUNC(NVL(TGFFIN.DHBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) ,'MM'),'YYYY-MM-DD') AS REFERENCIA " +
"          ,NVL(TGFPAR.NOMEPARC, 'NDA')  as PARCEIRO  "   + "\n" + 
//"         ,NVL(TGFFIN.DHBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) as DTBAIXA "   + "\n" + 
//"         ,NVL(TGFFIN.DHBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) as DTBAIXA2 "   + "\n" + 
"         ,NVL(TGFFIN.DHMOV, TO_DATE('1900-01-01','YYYY-MM-DD')) as DTMOV "   + "\n" + 
//"         ,NVL(TGFFIN.DTENTSAI, TGFFIN.DTNEG) AS DTENTSAI "   + "\n" + 
"         ,NVL(TGFFIN.CODCENCUS, 0)  as FINCENCUS "   + "\n" + 
"         ,NVL(TGFPAR.CODTIPPARC, 0) as PERFILPRINCIPAL "   + "\n" + 
"         ,NVL(TGFPAR.CODCTACTB, 0)  as PARC1CTA "   + "\n" + 
"         ,NVL(TGFPAR.CODCTACTB2, 0)  as PARC2CTA "   + "\n" + 
"         ,NVL(TGFPAR.CODCTACTB3, 0)  as PARC3CTA "   + "\n" + 
"         ,NVL(TGFPAR.CODCTACTB4, 0)  as PARC4CTA "   + "\n" + 
"         ,NVL(TGFPAR.NOMEPARC, 'NDA') AS  NOMEPARC "   + "\n" + 
"         ,NVL(TGFPAR.RAZAOSOCIAL, 'NDA') AS RAZAOSOCIAL  "   + "\n" + 
"         ,NVL(TGFFIN.CODEMP, 0)  as FINCODEMP "   + "\n" + 
"         ,NVL(TGFEMP.CODCTACTB_1, 0)  as EMP1CTA "   + "\n" + 
"         ,NVL(TGFEMP.CODCTACTB_2, 0)  as EMP2CTA "   + "\n" + 
"         ,NVL(TGFEMP.CODCTACTB_3, 0)  as EMP3CTA "   + "\n" + 
"         ,NVL(TGFEMP.CODCENCUS, 0)  as EMPCENCUS "   + "\n" + 
"         ,NVL(TGFEMP.CODCENCUSDESP, 0)  as EMPCENCUS2 "   + "\n" + 
"         ,NVL(TGFFIN.CODPROJ, 0)  AS FINCODPROJ "   + "\n" + 
"         ,NVL(TGFNAT.CODCTACTB, 0)  as NATCTA "   + "\n" + 
"         ,NVL(TGFNAT.CODCTACTB2, 0)  as NATCTA2 "   + "\n" + 
"         ,NVL(TGFNAT.CODHISTCTB, 0)  as CODHISTNAT "   + "\n" + 
"         ,NVL(TGFNAT.CODHISTCTB2, 0) as CODHISTNAT2 "   + "\n" + 
"         ,NVL(TGFMBC.DTLANC, TO_DATE('1900-01-01','YYYY-MM-DD')) DTLANC"   + "\n" + 
"         ,NVL(TGFMBC.VLRLANC, 0)  as VLRLANC"   + "\n" + 
"         ,NVL(TGFMBC.VLRMOEDA, 0) as VLRMOEDALANC "   + "\n" + 
"         ,NVL(TGFMBC.NUMDOC, 0)  as NUMDOC"   + "\n" + 
"         ,NVL(TGFMBC.RECDESP, 0) as MBRECDESP "   + "\n" + 
"         ,NVL(TGFMBC.DHCONCILIACAO, TO_DATE('1900-01-01','YYYY-MM-DD')) as DTCONCILIACAO "   + "\n" + 
"         ,NVL(TSICTA.CODCTACTB, 0)  as BCOCTA "   + "\n" + 
"         ,NVL(TSICTA.DESCRICAO, 'NDA') AS DESCRICAO"   + "\n" + 
"         ,NVL(TSICTA.CODEMP, 0)  as CTACODEMP "   + "\n" + 
//"         ,CASE WHEN TGFMBC.CODCTABCOINT IS NULL THEN TGFFIN.CODCTABCOINT ELSE TGFMBC.CODCTABCOINT END * 1.0 AS CODCTABCOINT "   + "\n" + 
"         ,NVL(TGFFIN.CODCTABCOINT, 0) AS FINCTABCO "   + "\n" + 
"         ,NVL(TGFPAR.TIPPESSOA, 'NDA') AS TIPPESSOA "   + "\n" + 
"         ,NVL(TGFFIN.CARTAODESC, 0) AS TAXAADM "   + "\n" + 
"         ,NVL(TGFTIT.CODCTACTB , 0) AS TITCTA "   + "\n" + 
"         ,NVL(TGFTIT.CODCTACTB2 , 0) AS TIT2CTA "   + "\n" + 
"         ,NVL(TGFTIT.CODCTACTB3, 0) AS TIT3CTA "   + "\n" + 
"         ,NVL((SELECT NOMECONTATO FROM TGFCTT WHERE CODPARC = TGFFIN.CODPARC AND CODCONTATO = TGFFIN.CODCONTATO),'NDA') AS NOMECONTATO "   + "\n" + 
"         ,NVL(TGFFIN.JUROSAVP, 0) AS TOTALJUROSVALORPRESENTE "   + "\n" + 
"         ,NVL(TGFTIT.ESPDOC, 'NDA') AS ESPDOC "   + "\n" + 
        " ,NVL(V.CODPARC, 0) AS CODPARC, NVL(V.CODNAT, 0) AS CODNAT, NVL(V.CODPROJ, 0) AS CODPROJ, NVL(V.CODCENCUS, 0) AS CODCENCUS, NVL(V.RECDESP, 0) AS RECDESP, NVL(V.DTNEG, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTNEG, NVL(V.DTVENC, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTVENC, NVL(V.PROVISAO, '') AS PROVISAO, NVL(V.CODTIPTIT, 0) AS CODTIPTIT, NVL(V.VLRLIQUIDO, 0) AS VLRLIQUIDO, NVL(V.VLRDESDOB, 0) AS VLRDESDOB, NVL(V.VLRBAIXA, 0) AS VLRBAIXA, NVL(V.NUFIN, 0) AS NUFIN, NVL(V.NUNOTA, 0) AS NUNOTA, NVL(V.CODEMP, 0) AS CODEMP, NVL(V.NUMNOTA, 0) AS NUMNOTA, NVL(V.CODBCO, 0) AS CODBCO, NVL(V.HISTORICO, '') AS HISTORICO, NVL(V.DHBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHBAIXA, NVL(V.CODVEND, 0) AS CODVEND, NVL(V.CODTIPOPER, 0) AS CODTIPOPER, NVL(V.DHTIPOPER, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHTIPOPER, NVL(V.CODTIPOPERBAIXA, 0) AS CODTIPOPERBAIXA, NVL(V.DHTIPOPERBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHTIPOPERBAIXA, NVL(V.DTBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTBAIXA, NVL(V.NUMCONTRATO, 0) AS NUMCONTRATO, NVL(V.VLRJUROEXTRA, 0) AS VLRJUROEXTRA, NVL(V.VLRMULTAEXTRA, 0) AS VLRMULTAEXTRA, NVL(V.VLRISSEXTRA, 0) AS VLRISSEXTRA, NVL(V.OUTROSIMPOSTOSEXTRA, 0) AS OUTROSIMPOSTOSEXTRA, NVL(V.VLRJUROINC, 0) AS VLRJUROINC, NVL(V.VLRMULTAINC, 0) AS VLRMULTAINC, NVL(V.VLRISSINC, 0) AS VLRISSINC, NVL(V.OUTROSIMPOSTOSINC, 0) AS OUTROSIMPOSTOSINC, NVL(V.VLRATUALIZADO, 0) AS VLRATUALIZADO, NVL(V.VLREMMOEDA, 0) AS VLREMMOEDA, NVL(V.VLRMOEDANEG, 0) AS VLRMOEDANEG, NVL(V.VLRMOEDAVENC, 0) AS VLRMOEDAVENC, NVL(V.VLRBAIXACOMIMP, 0) AS VLRBAIXACOMIMP, NVL(V.IMPNOTA, 0) AS IMPNOTA, NVL(V.SERIENOTA, '') AS SERIENOTA, NVL(V.DESDOBRAMENTO, '') AS DESDOBRAMENTO, NVL(V.DHMOV, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DHMOV, NVL(V.DTVENCINIC, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTVENCINIC, NVL(V.DTCONTAB, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTCONTAB, NVL(V.DTCONTABBAIXA, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTCONTABBAIXA, NVL(V.CODCTABCOINT, 0) AS CODCTABCOINT, NVL(V.CODMOEDA, 0) AS CODMOEDA, NVL(V.NUMDUPL, 0) AS NUMDUPL, NVL(V.DESDOBDUPL, '') AS DESDOBDUPL, NVL(V.NOSSONUM, '') AS NOSSONUM, NVL(V.VLRVENDOR, 0) AS VLRVENDOR, NVL(V.VLRIRF, 0) AS VLRIRF, NVL(V.VLRISS, 0) AS VLRISS, NVL(V.VLRCHEQUE, 0) AS VLRCHEQUE, NVL(V.DESPCART, 0) AS DESPCART, NVL(V.ISSRETIDO, '') AS ISSRETIDO, NVL(V.VLRDESC, 0) AS VLRDESC, NVL(V.VLRMULTA, 0) AS VLRMULTA, NVL(V.VLRINSS, 0) AS VLRINSS, NVL(V.TIPMULTA, '') AS TIPMULTA, NVL(V.VLRJURO, 0) AS VLRJURO, NVL(V.TIPJURO, '') AS TIPJURO, NVL(V.BASEICMS, 0) AS BASEICMS, NVL(V.ALIQICMS, 0) AS ALIQICMS, NVL(V.CODEMPBAIXA, 0) AS CODEMPBAIXA, NVL(V.NUMREMESSA, 0) AS NUMREMESSA, NVL(V.AUTORIZADO, '') AS AUTORIZADO, NVL(V.ORIGEM, '') AS ORIGEM, NVL(V.TIPMARCCHEQ, '') AS TIPMARCCHEQ, NVL(V.NUBCO, 0) AS NUBCO, NVL(V.NUDEV, 0) AS NUDEV, NVL(V.NURENEG, 0) AS NURENEG, NVL(V.CARTA, 0) AS CARTA, NVL(V.RATEADO, '') AS RATEADO, NVL(V.DTENTSAI, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTENTSAI, NVL(V.CODUSUBAIXA, 0) AS CODUSUBAIXA, NVL(V.VLRPROV, 0) AS VLRPROV, NVL(V.IRFRETIDO, '') AS IRFRETIDO, NVL(V.INSSRETIDO, '') AS INSSRETIDO, NVL(V.CARTAODESC, 0) AS CARTAODESC, NVL(V.DTALTER, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTALTER, NVL(V.ORDEMCARGA, 0) AS ORDEMCARGA, NVL(V.CODVEICULO, 0) AS CODVEICULO, NVL(V.CODBARRA, '') AS CODBARRA, NVL(V.CODUSU, 0) AS CODUSU, NVL(V.SEQUENCIA, 0) AS SEQUENCIA, NVL(V.VLRVARCAMBIAL, 0) AS VLRVARCAMBIAL, NVL(V.CODIGOBARRA, '') AS CODIGOBARRA, NVL(V.LINHADIGITAVEL, '') AS LINHADIGITAVEL, NVL(V.VLRDESCEMBUT, 0) AS VLRDESCEMBUT, NVL(V.VLRJUROEMBUT, 0) AS VLRJUROEMBUT, NVL(V.VLRMULTAEMBUT, 0) AS VLRMULTAEMBUT, NVL(V.VLRMOEDA, 0) AS VLRMOEDA, NVL(V.VLRMOEDABAIXA, 0) AS VLRMOEDABAIXA, NVL(V.NUCOMPENS, 0) AS NUCOMPENS, NVL(V.CODCFO, 0) AS CODCFO, NVL(V.VLRMULTANEGOC, 0) AS VLRMULTANEGOC, NVL(V.VLRJURONEGOC, 0) AS VLRJURONEGOC, NVL(V.VLRMULTALIB, 0) AS VLRMULTALIB, NVL(V.VLRJUROLIB, 0) AS VLRJUROLIB, NVL(V.DTBAIXAPREV, TO_DATE('1900-01-01','YYYY-MM-DD')) AS DTBAIXAPREV, NVL(V.NUMOS, 0) AS NUMOS, NVL(V.NATUREZAOPERDES, '') AS NATUREZAOPERDES, NVL(V.SERIENFDES, '') AS SERIENFDES, NVL(V.MODELONFDES, '') AS MODELONFDES, NVL(V.CODFUNC, 0) AS CODFUNC, NVL(V.CODCONTATO, 0) AS CODCONTATO, NVL(V.NUAPONTA, 0) AS NUAPONTA, NVL(V.NUMBOR, 0) AS NUMBOR, NVL(V.M2, 0) AS M2, NVL(V.DIGSAFRA, '') AS DIGSAFRA, NVL(V.NFENTSEQFIX, '') AS NFENTSEQFIX, NVL(V.NFCOMPLFIX, 0) AS NFCOMPLFIX, NVL(V.CODPARCRESP, 0) AS CODPARCRESP, NVL(V.PDD, '') AS PDD, NVL(V.CODUSUCOBR, 0) AS CODUSUCOBR, NVL(V.NUIMP, 0) AS NUIMP, NVL(V.NUMNFSE, '') AS NUMNFSE, NVL(V.VLRALIBERAR, 0) AS VLRALIBERAR, NVL(V.CONVENIO, 0) AS CONVENIO, NVL(V.CHAVECTE, '') AS CHAVECTE, NVL(V.CHAVECTEREF, '') AS CHAVECTEREF" +
        " FROM VGFFINRAT V INNER JOIN TGFFIN ON TGFFIN.NUFIN = V.NUFIN left join TGFMBC on TGFMBC.NUBCO = TGFFIN.NUBCO left join TSICTA on TGFMBC.CODCTABCOINT = TSICTA.CODCTABCOINT , TGFTOP , TGFPAR , TGFEMP , TGFNAT , TGFTIT WHERE TGFFIN.CODTIPOPERBAIXA = TGFTOP.CODTIPOPER AND TGFFIN.DHTIPOPERBAIXA = TGFTOP.DHALTER AND TGFTOP.ATUALCTB = 'S' AND TGFFIN.CODPARC = TGFPAR.CODPARC AND TGFFIN.CODEMP = TGFEMP.CODEMP AND TGFFIN.CODNAT = TGFNAT.CODNAT AND TGFFIN.DHBAIXA IS NOT NULL AND (TGFFIN.PROVISAO = 'N' OR (TGFFIN.ORIGEM = 'F' AND TGFFIN.DHBAIXA IS NOT NULL)) AND TGFFIN.CODTIPTIT = TGFTIT.CODTIPTIT "
        + "AND TGFFIN.NUFIN = " + Number(nunico) + "  ORDER BY TGFFIN.NUBCO, TGFFIN.NUDEV, TGFFIN.NUCOMPENS, TGFFIN.NUFIN"
    );


    

    executeQuery(SQL_DOC, arr, function(resp){
        var p = parseSeguro(resp, 'SQL_DOC');
        if (!p.ok) return mostrarErroDetalhe(detalheId, p.msg + '\n\nQUERY:\n' + SQL_DOC);
        if (!p.dados || p.dados.length===0) return mostrarErroDetalhe(detalheId, 'Documento nao encontrado na VGFFINRAT para NUFIN ' + nunico + '.');
        var doc = p.dados[0];
        var D = {}; for (var k in doc){ D[k.toUpperCase()] = doc[k]; }
        D.TOP = D.CODTIPOPERBAIXA;   // a config da TGFCTB e buscada pela TOP da baixa
        D.__IMP = {}; D.__CUS = {}; D.__PDES = {};

        setDetalheStatus(detalheId, 'Buscando configuracao da TOP ' + D.TOP + '...');
        // A FORMULA vai em Base64 para o transporte JSON nao quebrar com aspas
        // duplas, parenteses, virgulas ou qualquer caractere. A formula chega
        // ao interpretador EXATAMENTE como esta na TGFCTB.
        var SQL_CFG = q(
            "SELECT C.LANCAMENTO SEQUENCIA, C.DC, PLA.CODCTACTB || ': ' ||PLA.CTACTB || ' - ' || PLA.DESCRCTA CODCTACTB, C.CTACTBCONST, " +
            "  UTL_RAW.CAST_TO_VARCHAR2(UTL_ENCODE.BASE64_ENCODE(UTL_RAW.CAST_TO_RAW(C.FORMULA))) AS FORMULA_B64 " +
            "FROM TGFCTB C " +
            "LEFT JOIN TCBPLA PLA ON ''||PLA.CODCTACTB = CASE " +
            " WHEN C.CTACTBCONST = 'S' THEN C.CODCTACTB " +
            " WHEN C.CODCTACTB  = 'NAT' THEN '"  + D.NATCTA + "'" + 
            " WHEN C.CODCTACTB  = 'NAT2' THEN '"  + D.NATCTA2 + "'" + 

            " WHEN C.CODCTACTB  = 'EMP1' THEN '"  + D.EMP1CTA + "'" + 
            " WHEN C.CODCTACTB  = 'EMP2' THEN '"  + D.EMP2CTA + "'" + 
            " WHEN C.CODCTACTB  = 'EMP3' THEN '"  + D.EMP3CTA + "'" + 

            " WHEN C.CODCTACTB  = 'PARC1' THEN '"  + D.PARC1CTA + "'" + 
            " WHEN C.CODCTACTB  = 'PARC2' THEN '"  + D.PARC2CTA + "'" + 
            " WHEN C.CODCTACTB  = 'PARC3' THEN '"  + D.PARC3CTA + "'" + 
            " WHEN C.CODCTACTB  = 'PARC4' THEN '"  + D.PARC4CTA + "'" +

            " WHEN C.CODCTACTB  = 'TITCTA' THEN '"  + D.TITCTA + "'" +
            " WHEN C.CODCTACTB  = 'TIT2CTA' THEN '"  + D.TIT2CTA + "'" +
            " WHEN C.CODCTACTB  = 'TIT3CTA' THEN '"  + D.TIT3CTA + "'" +

            " WHEN C.CODCTACTB  = 'CTABCO' THEN '"  + D.BCOCTA + "'" +

            " ELSE '0' " +
            " END "+
            "WHERE C.CODTIPOPER = " + Number(D.TOP) + " " +
            "AND NOT REGEXP_LIKE(TRIM(C.FORMULA), '\\*\\s*0\\s*$') ORDER BY C.SEQUENCIA"
        );

        console.log('SQL_CFG:\n'+SQL_CFG);

        executeQuery(SQL_CFG, arr, function(respCfg){
            var pc = parseSeguro(respCfg, 'SQL_CFG');
            if (!pc.ok) return mostrarErroDetalhe(detalheId, pc.msg + '\n\nQUERY:\n' + SQL_CFG);
            var cfg = pc.dados;
            if (!cfg || cfg.length===0) return mostrarErroDetalhe(detalheId, 'Nenhuma formula ativa na TGFCTB para a TOP ' + D.TOP + '.');
            // decodifica a FORMULA do Base64 -> texto original, exatamente como na TGFCTB
            cfg.forEach(function(r){ r.FORMULA = b64DecodeUtf8(r.FORMULA_B64); });

            // coleta TODAS as dependencias (impostos, custo, PDES) de todas as formulas
            var impostosNec={}, precisaCusto=false, pdesNec={};
            cfg.forEach(function(r){
                var d = extraiDeps(r.FORMULA || '', D);
                d.imp.forEach(function(x){ impostosNec[x.fn+'_'+x.cod+'_'+x.tipo]=x; });
                if (d.custo) precisaCusto=true;
                d.pdes.forEach(function(pp){ pdesNec[pp.chave]=pp; });
            });

            // fila de queries de dependencia a resolver
            var fila=[];
            Object.keys(impostosNec).forEach(function(k){
                var x=impostosNec[k];
                var tab=(x.fn==='CAB')?(x.tipo==='V'?'TGFDIN':'TGFIMN'):'TGFIMF';
                var campo=(x.tipo==='V')?'VALOR':'BASE';
                var filtro=(x.fn==='CAB')?("NUNOTA="+Number(D.NUNOTA)):("NUFIN="+Number(D.NUFIN));
                fila.push({tipo:'IMP', chave:k, sql:q("SELECT NVL(SUM("+campo+"),0) AS V FROM "+tab+" WHERE CODIMP="+Number(x.cod)+" AND "+filtro)});
            });
            Object.keys(pdesNec).forEach(function(k){ fila.push({tipo:'PDES', chave:k, sql:pdesNec[k].sql}); });

            var pend=fila.length;
            setDetalheStatus(detalheId, 'Resolvendo '+pend+' dependencias (impostos/PDES/custo)...');

            function terminou(){
                setDetalheStatus(detalheId, 'Buscando lancamentos reais...');
                var SQL_REAL = q(
                    "SELECT CASE WHEN LAN.SEQUENCIA = 0 THEN NVL( CASE WHEN REGEXP_LIKE(LAN.COMPLHIST, '\\(\\d+\\)') THEN TO_NUMBER(REGEXP_SUBSTR(LAN.COMPLHIST, '\\(\\d+\\)', 1, 1, NULL, 1)) END, CASE WHEN REGEXP_LIKE(LAN.COMPLHIST, '^\\d+') THEN TO_NUMBER(REGEXP_SUBSTR(LAN.COMPLHIST, '^\\d+')) END ) ELSE LAN.SEQUENCIA END AS SEQUENCIA, LAN.CODCTACTB, CASE WHEN LAN.TIPLANC = 'R' THEN 'C' ELSE LAN.TIPLANC END AS TIPLANC, LAN.VLRLANC FROM TCBLAN LAN WHERE EXISTS ( SELECT 1 FROM TCBINT I WHERE I.ORIGEM IN ('B','F') AND LAN.CODEMP = I.CODEMP AND LAN.REFERENCIA = I.REFERENCIA AND LAN.NUMLANC = I.NUMLANC AND LAN.NUMLOTE = I.NUMLOTE AND I.NUNICO = " +Number(D.NUFIN) + ")"
                );

                console.log('SQL_REAL:\n'+SQL_REAL);
                executeQuery(SQL_REAL, arr, function(respReal){
                    var pr = parseSeguro(respReal, 'SQL_REAL');
                    if (!pr.ok) return mostrarErroDetalhe(detalheId, pr.msg + '\n\nQUERY:\n' + SQL_REAL);
                    var mapReal={}; pr.dados.forEach(function(r){ mapReal[String(r.SEQUENCIA)]=r; });
                    montarResultadoDetalhe(D, cfg, mapReal, detalheId);
                }, function(v){ mostrarErroDetalhe(detalheId, '[SQL_REAL] erro:\n'+v); });
            }

            if (pend===0) return terminou();
            fila.forEach(function(item){
                executeQuery(item.sql, arr, function(ri){
                    var pi = parseSeguro(ri, item.tipo);
                    var val = (pi.ok && pi.dados.length) ? pi.dados[0].V : null;
                    if (item.tipo==='IMP') D.__IMP[item.chave]=val==null?null:Number(val);
                    else if (item.tipo==='CUS') D.__CUS[item.chave]=val==null?null:Number(val);
                    else D.__PDES[item.chave]=val;  // PDES pode ser texto (USOPROD='C') ou numero
                    if(--pend===0) terminou();
                }, function(){
                    if (item.tipo==='IMP') D.__IMP[item.chave]=null;
                    else if (item.tipo==='CUS') D.__CUS[item.chave]=null;
                    else D.__PDES[item.chave]=null;
                    if(--pend===0) terminou();
                });
            });

        }, function(v){ mostrarErroDetalhe(detalheId, '[SQL_CFG] erro:\n'+v); });
    }, function(v){ mostrarErroDetalhe(detalheId, '[SQL_DOC] erro:\n'+v); });
}

// =====================================================================
// RESULTADO
// =====================================================================
function fmt(n){ if (n==null || isNaN(n)) return '-'; return Number(n).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2}); }

function montarResultado(D, cfg, mapReal){
    var linhas=[], seqsCfg={}, totSim=0, totReal=0, nOk=0, nDiv=0, nErro=0;

    cfg.forEach(function(r){
        seqsCfg[String(r.SEQUENCIA)]=true;
        var res = avaliaFormula(r.FORMULA || '', D);
        var ctaSim=(r.CTACTBCONST==='S')?(String(r.CODCTACTB).match(/^\d+$/)?Number(r.CODCTACTB):null):null;
        var real = mapReal[String(r.SEQUENCIA)] || null;
        var vlrSim = res.valor;
        var vlrReal = real ? Number(real.VLRLANC) : null;
        var ctaReal = real ? Number(real.CODCTACTB) : null;

        var status;
        if (res.incalc) status='ERRO';
        else if (!real && (vlrSim==null || Math.abs(vlrSim)<0.005)) status='NAOAPL';
        else if (!real && vlrSim!==0) status='CONFIG';
        else if (ctaSim==null) status='VARIAVEL';
        else if (Math.abs((vlrSim||0)-(vlrReal||0))<0.01 && ctaSim===ctaReal) status='OK';
        else status='DIVERGENTE';

        if (status==='OK') nOk++;
        if (status==='DIVERGENTE') nDiv++;
        if (status==='ERRO') nErro++;
        if (vlrSim!=null) totSim += vlrSim;
        if (vlrReal!=null) totReal += vlrReal;

        linhas.push({ seq:r.SEQUENCIA, dc:r.DC, ctaSim:ctaSim, ctaSimTxt:r.CODCTACTB,
            vlrSim:vlrSim, ctaReal:ctaReal, dcReal: real?real.TIPLANC:null, vlrReal:vlrReal,
            dif:(vlrSim||0)-(vlrReal||0), status:status, trace:res.trace, formula:normal(r.FORMULA) });
    });

    Object.keys(mapReal).forEach(function(sq){
        if (!seqsCfg[sq]){
            var real=mapReal[sq];
            linhas.push({ seq:sq, dc:null, ctaSim:null, ctaSimTxt:null, vlrSim:null,
                ctaReal:Number(real.CODCTACTB), dcReal:real.TIPLANC, vlrReal:Number(real.VLRLANC),
                dif:-(Number(real.VLRLANC)), status:'CONFIG', trace:[], formula:'(sem config)' });
        }
    });
    linhas.sort(function(a,b){ return Number(a.seq)-Number(b.seq); });

    document.getElementById('cards').innerHTML =
        card('Documento','NUFIN '+D.NUFIN) + card('TOP',D.TOP) +
        card('Valor baixa','R$ '+fmt(D.VLRBAIXA)) + card('Simulado (total)','R$ '+fmt(totSim)) +
        card('Lancado (total)','R$ '+fmt(totReal)) + card('Diferenca','R$ '+fmt(totSim-totReal));
    show('cards');

    document.getElementById('resumo').textContent =
        linhas.length+' sequencias | '+nOk+' OK | '+nDiv+' divergentes'+(nErro?(' | '+nErro+' com erro de resolucao'):'');
    show('resumo');

    var html='<table><thead><tr><th>Seq</th><th>DC</th><th>Conta simulada</th><th class="num">Vlr simulado</th>'+
        '<th>Conta real</th><th class="num">Vlr real</th><th class="num">Dif</th><th>Status</th><th>Formula / Memoria</th></tr></thead><tbody>';
    linhas.forEach(function(L){
        var stClass='st-'+(L.status==='NAOAPL'?'NAOAPL':L.status);
        var stLabel={OK:'OK',DIVERGENTE:'DIVERGENTE',CONFIG:'CONFIG SEM LANCTO',ERRO:'ERRO RESOLUCAO',VARIAVEL:'CONTA VARIAVEL',NAOAPL:'NAO APLICAVEL'}[L.status];
        html+='<tr><td>'+L.seq+'</td><td>'+(L.dc||'-')+'</td>'+
            '<td>'+(L.ctaSim!=null?L.ctaSim:'<span style="color:#94a3b8">'+(L.ctaSimTxt||'-')+'</span>')+'</td>'+
            '<td class="num">'+fmt(L.vlrSim)+'</td>'+
            '<td>'+(L.ctaReal!=null?L.ctaReal:'-')+(L.dcReal?' <span style="color:#94a3b8">('+L.dcReal+')</span>':'')+'</td>'+
            '<td class="num">'+fmt(L.vlrReal)+'</td>'+
            '<td class="num" style="'+(Math.abs(L.dif)>=0.01?'color:#dc2626;font-weight:600':'')+'">'+fmt(L.dif)+'</td>'+
            '<td><span class="st '+stClass+'">'+stLabel+'</span></td>'+
            '<td class="formula">'+escapeHtml(L.formula)+
                (L.trace&&L.trace.length?'<details><summary>memoria de calculo</summary><div class="trace">'+renderTrace(L.trace)+'</div></details>':'')+
            '</td></tr>';
    });
    html+='</tbody></table>';
    document.getElementById('tabela').innerHTML=html;
    show('tabela'); hide('loader');
}

function renderTrace(trace){
    return trace.map(function(n){
        if (n.tipo==='IF'){
            var cls=n.res===true?'v':(n.res===false?'f':'');
            var sim=n.res===true?'V':(n.res===false?'F':'?');
            return '  SE <span class="'+cls+'">'+escapeHtml(n.cond)+'</span>  ['+sim+']';
        }
        if (n.tipo==='VALOR'){ return '  => <span class="val">'+escapeHtml(n.txt)+'</span> = '+escapeHtml(String(n.val)); }
        return '  (erro de parse)';
    }).join('\n');
}
function card(rot,val){ return '<div class="card"><div class="rot">'+rot+'</div><div class="val">'+val+'</div></div>'; }
function escapeHtml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function setLoader(t){ var l=document.getElementById('loader'); l.textContent=t; show('loader'); }
function show(id){ document.getElementById(id).classList.remove('hidden'); }
function hide(id){ document.getElementById(id).classList.add('hidden'); }
</script>

</body>
</html>
