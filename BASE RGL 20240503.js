
   var query = QUERY3;
   var arr=[{value:"", type:"IN"}]; //OBRIGATORIO PARA FUNCIONAR
   var P_TOTALDECOLUNAS = 0;
    
	
function GERAR_TABELA(results,obj)
	{
		//console.log(results);
		
		var dadosTabela = results;
		
		var colunasTabela = Object.keys(dadosTabela[0]);
		//console.log(colunasTabela);
		var nroColunas = colunasTabela.length;
		//console.log(nroColunas);
		var table = document.getElementById('tabela_dados');

		montaHeaderTable(table, colunasTabela);

		for (var k in dadosTabela) 
		{
			var row = table.insertRow(-1);
			
			for (var j in dadosTabela[k]) 
			{
				row.insertCell(-1).innerHTML = dadosTabela[k][j];
			}

		}
		document.getElementById('tabela_dados').style.visibility = "visible";
	}	

	function montaHeaderTable(table, columns)
	{
		var header = table.createTHead();
		var rowHeader = header.insertRow(0);

		var qtdColunas = columns.length;

		for(var i = 0; i < qtdColunas; i++)
		{
			var cell = rowHeader.insertCell(-1);
			cell.innerHTML = "<b>" + columns[i] + "</b>";
		}
	}
  
 

  
executeQuery(query,arr,function(value){
var Dados_TOTAIS = [];
var Dados_FLUXO = [];	
var Dados_RECEBIVEL = [];	
	console.log('Query de pivot Realizada');
//	console.log(value);

    var json = JSON.parse(value);
	
	Dados_RECEBIVEL = json;
	
	var DIA = ['DIA'];
	var NOMEFANTASIA = ['NOMEFANTASIA'];
	
		DIA = DIA.map(function(campo){
			var novoConteudo = json.map(
										function(objeto){
														   return objeto[campo]; 
														});
												return novoConteudo;
											});
											
		NOMEFANTASIA = NOMEFANTASIA.map(function(campo){
			var novoConteudo = json.map(
										function(objeto){
														   return objeto[campo]; 
														});
												return novoConteudo;
											});									
											
	var RECEBIVEL = ['RECEBIVEL'];
	
		RECEBIVEL = RECEBIVEL.map(function(campo){
			var novoConteudo = json.map(
										function(objeto){
														   return objeto[campo]; 
														});
												return novoConteudo;
											});
	
	
	var pivot = JSON.stringify(DIA[0]);

	pivot = pivot.replace('[', '');
	pivot = pivot.replace(']', '');
	
	pivot = pivot.replace(/"/g, "'");
	
	
	
	
	
	QUERY_SNK = QUERY_SNK.replace('@any', pivot);
	QUERY_TOTAL = QUERY_TOTAL.replace('@any', pivot);
	
	console.log('---[QUERYS EXECUTADAS:]-----------------------------------------------------------------------------------------------');
	console.log(QUERY2);
	console.log('----------------------------------------------------------------------------------------------------------------------');
	console.log(QUERY_SNK);
	console.log('----------------------------------------------------------------------------------------------------------------------');
	console.log(QUERY_TOTAL);
	//console.log(DIA);
	//console.log(QUERY_SNK);
	
	
	//console.log(QUERY_TOTAL);
	
		executeQuery(QUERY_TOTAL,arr,function(value){
			
			
			console.log('Query de totais Realizada');
		
			Dados_TOTAIS = JSON.parse(value);
		
		
		executeQuery(QUERY_SNK,arr,function(value2)
		{
		console.log('Query de fluxo Realizada');
		document.getElementById('loader').innerHTML = 'Concluindo Montagem da Tabela.....';	
		Dados_FLUXO = JSON.parse(value2);
		
		
		
		
		MONTAR_DFC(Dados_FLUXO,Dados_TOTAIS,NOMEFANTASIA[0]);
		
		},function(value2)
		{
			console.log(value2);	
		}); 
		
		//console.log(Dados_TOTAIS);	
		},function(value){
			console.log(value);	
		}); 

	
		




		
function MONTAR_DFC(results,results2,results3)
	{
		//console.log('entrei na monta');
		//console.log(results);
		
		var tabela = "";
		var dadosTabela = results;
		var TOTAIS = results2;
		
		//var dadosTabela = results2;
		//var SaldoRecebivel = results3;
		var total_caixa = 0;
		var ini_array = 0;
		var colunasTabela = Object.keys(dadosTabela[0]);
		//console.log(TOTAIS);
		var nroColunas = colunasTabela.length;
		//console.log(SaldoRecebivel);
		
		var geracao_caixa = colunasTabela;
		var C = 0;
		var R = 0;
		var qtdColunas = nroColunas;
		var colspan = 4;
		P_TOTALDECOLUNAS = nroColunas;
		
		P_AV = 'N';
		
		if (AV_ORCADO != 'S')
			{
				colspan = colspan - 1 ;
			}
		if (AV_REALIZADO != 'S')
			{
				colspan = colspan - 1 ;
			}
		if (VLR_ORCADO != 'S')
			{
				colspan = colspan - 1 ;
			}	
		if (VLR_REALIZADO != 'S')
			{
				colspan = colspan - 1 ;
			}		
		
		
		tabela = ' <table border="1" id="Tab_DRE" align="CENTER"> ';
		
		tabela += '<tr align="CENTER" class="fixed-header2">';
		tabela += '<th></th>';
		
		for(var i = 0; i < results3.length; i++)
		{
			tabela +=   '<th  style= "white-space: nowrap" colspan="'+ colspan +'" align="CENTER" id="TH_'+ (results3[i]).replace(/'/g, '') +'">' + (results3[i]).replace(/'/g, '') + '</th> ';
		}
		
		if ( P_ACUMULADO == 'S' ) // se tiver mais que uma coluna cria um total
			{
				tabela +=   '<th  colspan="'+ colspan +'" align="CENTER">' + 'TOTAL GERAL ' + '</th> ';
			}
			
		tabela += '</tr>';
		tabela += '<tr align="CENTER" class="fixed-header">';
		tabela += '<th></th>';
		for(var i = 0; i < results3.length; i++)
		{
			
			if (VLR_ORCADO == 'S')
				{	
					tabela += '<th style= "white-space: nowrap">ORÇADO</th>';
				}
			//VERIFICAR SE AV SETÁ LIGADO 
			if (AV_ORCADO == 'S')
				{
					tabela += '<th style= "white-space: nowrap">% A.V. <br> ORÇADO</th>';
				}
				
			if (VLR_REALIZADO == 'S')
				{	
					tabela += '<th style= "white-space: nowrap">REALIZADO</th>';
				}
				
			//VERIFICAR SE AV SETÁ LIGADO 
			if (AV_REALIZADO == 'S')
				{
					tabela += '<th style= "white-space: nowrap">% A.V. <br> REALIZADO</th>';
				}
		}
		
		if ( P_ACUMULADO == 'S' ) // se tiver mais que uma coluna cria um total
			{
			if (VLR_ORCADO == 'S')
				{	
					tabela += '<th style= "white-space: nowrap">ORÇADO</th>';
				}
			//VERIFICAR SE AV SETÁ LIGADO 
			if (AV_ORCADO == 'S')
				{
				//	tabela += '<th style= "white-space: nowrap">% A.V. <br> ORÇADO</th>';
				}
				
			if (VLR_REALIZADO == 'S')
				{	
					tabela += '<th style= "white-space: nowrap">REALIZADO</th>';
				}
				
			//VERIFICAR SE AV SETÁ LIGADO 
			if (AV_REALIZADO == 'S')
				{
					tabela += '<th style= "white-space: nowrap">% A.V. <br> REALIZADO</th>';
				}
				
			}
		
		tabela += '</tr>'; 
		
		
		//console.log(JSON.stringify(dadosTabela));
		
		tabela += '<tr align="CENTER">';
	
		var ordem = 0;
		var resultado = 0;
		/*const V_RECEITAS = dadosTabela.map(dado => {
		  return {
			CODCTACTB: dado.CODCTACTB,
			'301_REAL': dado["'301'_REAL"]
		  };
		});*/
		//const V_RECEITAS = dadosTabela.find(V_RECEITAS => dadosTabela.ORDEM === '1');
		//console.log((V_RECEITAS));
		var totalizadores = 0;
		var av_valor_real = 0;
		var av_BASE = 0;
		
		for (var k in dadosTabela) 
		{
			
			var valor = 0;
			var valor_real = 0;
			var valor_orcado = 0;
			var AH_valor = 0;
			
			var AV_valor = 0;
			//var row = table.insertRow(-1);
				
			ordem =  dadosTabela[k]['ORDEM'] ;
			
			document.getElementById('loader').innerHTML = k + ' de ' + dadosTabela.length;	
			
			tabela =  tabela + '<tr id="' + dadosTabela[k]['CLASSE'] + '"  class="' + dadosTabela[k]['GRAU'] + '">';
			tabela =  tabela +  '<td colspan=1 class="fixed-column" onclick="showHideRow(' + "'" + dadosTabela[k]['GRAU2'] + "'" + ')" style= "white-space: nowrap" id="TD_'+ dadosTabela[k]['CLASSE'] + '"> '+ dadosTabela[k]['DESCRCTA'] + '</td>';
			
			C = 0;
			
			for (var j in dadosTabela[k]) 
			{
				
				if ( C >= 9)
				{
					if (dadosTabela[k]['ORDEM']  = ordem )
					{
							
					//	totalizadores =  totalizadores  + parseFloat(nvl(dadosTabela[k][j],0));
						//console.log(totalizadores)
					}
					
					
						
					//ondblclick="abrir_nivel('${row.CODCTACTB}','${row.DESCRCTA}','${row.ORDEM}','${row.CONTA}')
				
					//console.log(dadosTabela);
					var style_VLRS = '';
					
					if ((colunasTabela[C]).includes('REAL') && VLR_REALIZADO == 'N' )
						{
							//console.log('REALIZADO');
							style_VLRS = 'style= "display: none"';
						}
						
					if ((colunasTabela[C]).includes('ORCADO') && VLR_ORCADO == 'N' )
						{
							style_VLRS = 'style= "display: none"';
						}
					
					tabela =  tabela +  '<td ' + style_VLRS +'colspan=1  id="VLR_TOTAL' + dadosTabela[k]['CODNAT'] + '" ondblclick="abrir_nivel(' + "'" + dadosTabela[k]['CODCTACTB'] + "'" + ','+ "'" + dadosTabela[k]['DESCRCTA'] + "'" + ','+ "'" + dadosTabela[k]['ORDEM'] + "'" + ','+ "'" + dadosTabela[k]['CONTA'] + "'" + ','+ (colunasTabela[C]).replace('_REAL', '') + ') " > ' 
											 + '<table align="CENTER" style="border-collapse: collapse; border: #A4A4A4; height: 100%; width: 100%">'
											 + '<tr>'
												 + '<td style= "white-space: nowrap" align="CENTER" id="TD_'+ dadosTabela[k]['CLASSE'] + '">'  
													+  parseFloat(nvl(dadosTabela[k][j] , 0 )).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
												 + '</td>';
												 
											/*EXIBE A COLUNA DE MARGEM*/
											if ( (dadosTabela[k]['ORDEM'] ==	'3' || dadosTabela[k]['ORDEM'] ==	'2') && dadosTabela[k]['CLASSE'] !== 'GP1'  && P_MRG == 'S' )
											{
												
												resultado = dadosTabela.filter(dado => dado.ORDEM === '1' && dado.CODCTACTB === dadosTabela[k]['CODCTACTB'] && dado.DESCRCTA === dadosTabela[k]['DESCRCTA'])
																						.map(dado => dado[colunasTabela[C]]);
												//console.log(resultado);
												tabela += ''
													+ '<td style= "white-space: nowrap" align="right" id="TD_'+ dadosTabela[k]['CLASSE'] + '">'  
													+ '| ' + ( (((parseFloat((nvl(dadosTabela[k][j] , 0 ) / nvl(resultado , 0 )) * 100   ).toFixed(2)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('NaN','0')).replace('∞','0')  ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
													+ '</td>';
													
											}												
												 
							tabela += ''	 
											 + '</tr>'
											 + '</table>' 
										+ '</td>';
					//console.log('" ondblclick="AbrirNivel(' + "'" + dadosTabela[k]['CODCTACTB'] + "'" + ','+ dadosTabela[k]['DESCRCTA'] + ','+ dadosTabela[k]['ORDEM'] + ','+ dadosTabela[k]['CONTA'] + ')" > ');
					valor =  valor  + parseFloat(nvl(dadosTabela[k][j],0));
					
					if ((colunasTabela[C]).includes('REAL') )
						{
							valor_real =  valor_real  + parseFloat(nvl(dadosTabela[k][j],0));
						}
						
					if ((colunasTabela[C]).includes('ORCADO') )
						{
								
							valor_orcado =  valor_orcado  + parseFloat(nvl(dadosTabela[k][j],0));
						}
					
					AV_valor = parseFloat(nvl(dadosTabela[0][j],0));

					var style = '';
					//console.log(colunasTabela[C]);
					if ((colunasTabela[C]).match(/REAL/) && AV_REALIZADO == 'N' )
						{
							style = 'style= "display: none"';
						}
						
					if ((colunasTabela[C]).match(/ORCADO/) && AV_ORCADO == 'N' )
						{	
							style = 'style= "display: none"';
						}
					
					tabela += '<td align="CENTER" ' + style + ' id="TD_'+ dadosTabela[k]['CLASSE'] + '">' + ((((parseFloat(nvl('' + dadosTabela[k][j],0))/parseFloat(nvl('' + dadosTabela[0][j],0)))*100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('NaN','0')).replace('∞','0') + '% </td>';
	
					/*if (AV_REALIZADO == 'S' || (colunasTabela[i]).match(/REALIZADO/) )
					{
						tabela += '<td align="CENTER">' + ((((parseFloat(nvl('' + dadosTabela[k][j],0))/parseFloat(nvl('' + dadosTabela[0][j],0)))*100).toLocaleString('pt-BR')).replace('NaN','0')).replace('∞','0') + '% </td>';
					}*/
					
					if (P_AH == 'S')
					{
						if (AH_valor === 0 && parseFloat(nvl(dadosTabela[k][j],0)) !== 0 )
						{
							AH_valor = 100;
							tabela += '<td id="TD_'+ dadosTabela[k]['CLASSE'] + '">' + (((AH_valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('NaN','0')).replace('∞','0')  + '% </td>';
						}else 
						{
						
						AH_valor = (((parseFloat(nvl(dadosTabela[k][j],0)))-AH_valor)/AH_valor) *100;
						tabela += '<td id="TD_'+ dadosTabela[k]['CLASSE'] + '">' + (((AH_valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('NaN','0')).replace('∞','0')  + '% </td>';
						}
					}
					AH_valor = parseFloat(nvl(dadosTabela[k][j] , 0 ));
					//console.log(dadosTabela);
					//valor =  valor  + parseFloat(nvl(dadosTabela[k][j],0));
					//console.log(valor);
				}
			C++;
			
			}
			
			if ( P_ACUMULADO == 'S' ) // se tiver mais que uma coluna cria um total
			{
				
				if (VLR_ORCADO == 'S')
				{
					tabela =  tabela +  '<td colspan=1 align="CENTER" id="VLR_TOTAL" ' + 'ondblclick="AbrirNivel(' + "'" + dadosTabela[k]['CONTA'] + "'" + ','+ "''" + ')" > ' +  (valor_orcado).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })+ '</td>';
				}
				
				if (VLR_REALIZADO == 'S')
				{
					
					
					tabela =  tabela +  '<td colspan=1 align="CENTER" id="VLR_TOTAL" ' + 'ondblclick="AbrirNivel(' + "'" + dadosTabela[k]['CONTA'] + "'" + ','+ "''" + ')" > ' 
					
											+ '<table align="CENTER" style="border-collapse: collapse; border: #A4A4A4; height: 100%; width: 100%">'
											+ '<tr>'
											+ '<td style= "white-space: nowrap" id="TD_'+ dadosTabela[k]['CLASSE'] + '" align="CENTER">'  					
												+  (valor_real).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
											+ '</td>';
											if ( (dadosTabela[k]['ORDEM'] ==	'3' || dadosTabela[k]['ORDEM'] ==	'2') && dadosTabela[k]['CLASSE'] !== 'GP1'  && P_MRG == 'S' )
											{
												//console.log(resultado);
												tabela += ''
													+ '<td style= "white-space: nowrap" id="TD_'+ dadosTabela[k]['CLASSE'] + '" align="right" >'  
													+ '| ' + (0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })  + '%'
													+ '</td>';
											}
											
											
											
											tabela += '</tr>'
												   + '</table>';
					
					
					tabela += '</td>';
					if (AV_REALIZADO == 'S')
					{
						//console.log(R);
						if (R == 0) 
						{
							av_BASE = valor_real ;
						}
						//console.log(valor_real);
						av_valor_real = (valor_real / av_BASE) * 100 ;
						tabela += '<td id="TD_'+ dadosTabela[k]['CLASSE'] + '" >' + (((av_valor_real).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })).replace('NaN','0')).replace('∞','0')  + '% </td>';
					}
				}
			}
			
		R++;
		}
		
		
		
		
		tabela += "</table>";
		//document.getElementsByClassName('loader').style.display = 'none';
		document.getElementById('loader').style.display = 'none';
		document.getElementById('tabela_dados').innerHTML = tabela;
		var OBJ_TABELA = document.getElementById('tabela_dados')
		console.log(OBJ_TABELA);
		
		
		var P_NIVEL = 2;
		
		
		/*FORMATAÇÃO DA TABELA*/
		var P_COLORS = ['#088A85','#2F4F4F','#8FBC8F','#F0FFF0','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF' ];
		var P_TEXT_COLORS = ['#FFFFFF','#FFFFFF','#000000','#000000','#000000','#000000','#000000','#000000','#000000','#000000','#000000','#000000' ];
		
		//P_COLORS = ['N0','N1','N2',...];
		var div_dados = document.getElementById('tabela_dados');
		var GP0 = div_dados.querySelectorAll('#GP0');
		var GP1 = div_dados.querySelectorAll('#GP1');
		var GP2 = div_dados.querySelectorAll('#GP2');
		var GP3 = div_dados.querySelectorAll('#GP3');
		var GP4 = div_dados.querySelectorAll('#GP4');
		var GP5 = div_dados.querySelectorAll('#GP5');
		var GP6 = div_dados.querySelectorAll('#GP6');
		var GP7 = div_dados.querySelectorAll('#GP7');
		var GP8 = div_dados.querySelectorAll('#GP8');
		var GP9 = div_dados.querySelectorAll('#GP9');
		var GP10 = div_dados.querySelectorAll('#GP10');
		var TD_GP0 = div_dados.querySelectorAll('#TD_GP0');
		var TD_GP1 = div_dados.querySelectorAll('#TD_GP1');
		var TD_GP2 = div_dados.querySelectorAll('#TD_GP2');
		var TD_GP3 = div_dados.querySelectorAll('#TD_GP3');
		var TD_GP4 = div_dados.querySelectorAll('#TD_GP4');
		var TD_GP5 = div_dados.querySelectorAll('#TD_GP5');
		var TD_GP6 = div_dados.querySelectorAll('#TD_GP6');
		var TD_GP7 = div_dados.querySelectorAll('#TD_GP7');
		var TD_GP8 = div_dados.querySelectorAll('#TD_GP8');
		var TD_GP9 = div_dados.querySelectorAll('#TD_GP9');
		var TD_GP10 = div_dados.querySelectorAll('#TD_GP10');
		

		//GP0
		for (var i = 0; i < GP0.length; i++) {
			GP0[i].style.backgroundColor = P_COLORS[0];
			GP0[i].style.fontWeight = "bold";
			GP0[i].style.color = P_TEXT_COLORS[0];
		  	for (var z = 0; z < TD_GP0.length; z++) 
			  {
				TD_GP0[z].style.backgroundColor = P_COLORS[0];
				TD_GP0[z].style.fontWeight = "bold";
				TD_GP0[z].style.color = P_TEXT_COLORS[0];				
			  }
		  if (P_NIVEL < 0)
		  {
			  GP0[i].style.display = 'none';
			  
		  }
		}
		
		
		//GP1
		for (var i = 0; i < GP1.length; i++) {
		  GP1[i].style.backgroundColor = P_COLORS[1];
		  GP1[i].style.fontWeight = "bold";
		  GP1[i].style.color = P_TEXT_COLORS[1];
		  
		  	for (var z = 0; z < TD_GP1.length; z++) 
			  {
				TD_GP1[z].style.backgroundColor = P_COLORS[1];
				TD_GP1[z].style.fontWeight = "bold";
				TD_GP1[z].style.color = P_TEXT_COLORS[1];
				
			  }
		  if (P_NIVEL < 1)
		  {
			  GP1[i].style.display = 'none';
			  
		  }
		}
		
		//GP2
		for (var i = 0; i < GP2.length; i++) {
		  GP2[i].style.backgroundColor = P_COLORS[2];
		  GP2[i].style.textIndent = "20px";
		  GP2[i].style.fontWeight = "bold";
		  	for (var z = 0; z < TD_GP2.length; z++) 
			  {
				TD_GP2[z].style.backgroundColor = P_COLORS[2];
				TD_GP2[z].style.textIndent = "20px";
				TD_GP2[z].style.fontWeight = "bold";
				
			  }
		  if (P_NIVEL < 2)
		  {
			  GP2[i].style.display = 'none';
			  
		  }
		}
		
		//GP3
		for (var i = 0; i < GP3.length; i++) {
		  GP3[i].style.backgroundColor = P_COLORS[3];
		  GP3[i].style.textIndent = "40px";
		  GP3[i].style.fontWeight = "bold";
		  for (var z = 0; z < TD_GP3.length; z++) 
			  {
				TD_GP3[z].style.backgroundColor = P_COLORS[3];
				TD_GP3[z].style.textIndent = "40px";
				TD_GP3[z].style.fontWeight = "bold";
			  }
		  if (P_NIVEL < 3)
		  {
			  GP3[i].style.display = 'none';
			  
		  }
		}
		
		//GP4
		for (var i = 0; i < GP4.length; i++) {
			GP4[i].style.backgroundColor = P_COLORS[4];
			GP4[i].style.textIndent = "50px";
			GP4[i].style.fontWeight = "bold";
		  for (var z = 0; z < TD_GP4.length; z++) 
			  {
				TD_GP4[z].style.backgroundColor = P_COLORS[4];
				TD_GP4[z].style.textIndent = "50px";
				TD_GP4[z].style.fontWeight = "bold";
			  }
		  if (P_NIVEL < 4)
		  {
			  GP4[i].style.display = 'none';

		  }
		}
		
		//GP5
		for (var i = 0; i < GP5.length; i++) {
		  GP5[i].style.backgroundColor = P_COLORS[5];
		  GP5[i].style.textIndent = "60px";
		  for (var z = 0; z < TD_GP5.length; z++) 
			  {
				TD_GP5[z].style.backgroundColor = P_COLORS[5];
				TD_GP5[z].style.textIndent = "60px";
				//TD_GP5[z].style.fontWeight = "bold";
			  }
		  if (P_NIVEL < 5)
		  {
			  GP5[i].style.display = 'none';
			  
		  }
		}
		
		//GP6
		for (var i = 0; i < GP6.length; i++) {
		  GP6[i].style.backgroundColor = P_COLORS[6];
		  GP6[i].style.textIndent = "70px";
		  for (var z = 0; z < TD_GP6.length; z++) 
			  {
				TD_GP6[z].style.backgroundColor = P_COLORS[6];
				TD_GP6[z].style.textIndent = "70px";
			  }
		  if (P_NIVEL < 6)
		  {
			  GP6[i].style.display = 'none';
			  
		  }
		}
		
		//GP7
		for (var i = 0; i < GP7.length; i++) {
		  GP7[i].style.backgroundColor = P_COLORS[7];
		  GP7[i].style.textIndent = "75px";
		  for (var z = 0; z < TD_GP7.length; z++) 
			  {
				TD_GP7[z].style.backgroundColor = P_COLORS[7];
				TD_GP7[z].style.textIndent = "75px";
			  }
		  if (P_NIVEL < 7)
		  {
			  GP7[i].style.display = 'none';
			  
		  }
		}
		
		//GP8
		for (var i = 0; i < GP8.length; i++) {
		  GP8[i].style.backgroundColor = P_COLORS[8];
		  GP8[i].style.textIndent = "77px";
		  for (var z = 0; z < TD_GP8.length; z++) 
			  {
				TD_GP8[z].style.backgroundColor = P_COLORS[8];
				TD_GP8[z].style.textIndent = "77px";
			  }
		  if (P_NIVEL < 8)
		  {
			  GP8[i].style.display = 'none';
			  
		  }
		}
		
		//GP9
		for (var i = 0; i < GP9.length; i++) {
		  GP9[i].style.backgroundColor = P_COLORS[9];
		  GP9[i].style.textIndent = "79px";
		  for (var z = 0; z < TD_GP9.length; z++) 
			  {
				TD_GP9[z].style.backgroundColor = P_COLORS[9];
				TD_GP9[z].style.textIndent = "79px";
			  }
		  if (P_NIVEL < 9)
		  {
			  GP9[i].style.display = 'none';
			  
		  }
		}
		
		//GP10
		for (var i = 0; i < GP10.length; i++) {
		  GP10[i].style.backgroundColor = P_COLORS[10];
		  GP10[i].style.textIndent = "81px";
		  for (var z = 0; z < TD_GP10.length; z++) 
			  {
				TD_GP10[z].style.backgroundColor = P_COLORS[10];
				TD_GP10[z].style.textIndent = "81px";
			  }
		  if (P_NIVEL < 10)
		  {
			  GP10[i].style.display = 'none';
			  
		  }
		}
		
		const table = document.getElementById("Tab_DRE");
		// Seleciona a tabela pelo ID
/*
// Seleciona todas as linhas da tabela, exceto a primeira (que contém os cabeçalhos)
const rows = table.querySelectorAll("tr:not(:first-child)");
//console.log(rows);
// Itera sobre as linhas
rows.forEach((row) => {
  // Seleciona a última coluna e a penúltima coluna
  const lastCol = row.lastElementChild;
  const penultimateCol = lastCol.previousElementSibling;
	console.log(penultimateCol);
  // Obtém o texto da penúltima coluna
  const text = penultimateCol.textContent;

  // Substitui o texto na última coluna
  lastCol.textContent = text;
});
		*/	
		
		/*// Seleciona a linha da tabela
		const tableRow = document.querySelector('tr');

		// Adiciona um ouvinte de eventos para o evento mouseover
		tableRow.addEventListener('mouseover', () => {
		  // Modifica o estilo da linha e de suas células quando o mouse estiver sobre ela
		  tableRow.style.backgroundColor = 'blue';
		  tableRow.style.color = 'white';
		  tableRow.querySelectorAll('td').forEach(cell => {
			cell.style.backgroundColor = 'blue';
			cell.style.color = 'white';
		  });
		});

		// Adiciona um ouvinte de eventos para o evento mouseout
		tableRow.addEventListener('mouseout', () => {
		  // Remove o estilo do hover quando o mouse sair da linha
		  tableRow.style.backgroundColor = '';
		  tableRow.style.color = '';
		  tableRow.querySelectorAll('td').forEach(cell => {
			cell.style.backgroundColor = '';
			cell.style.color = '';
		  });
		});
*/

	}		
	
	

},function(value){
        console.log(value);
	//	var json = JSON.parse(value)
	//	console.log(json);
		
    }); 


function nvl(value1,value2){
   if (value1 == null)
   {
      return value2;
   }
   else
   {
	   if (value1 == "")
	   {
			return value2;
	   }
	   else
	   {
		return value1;
	   }
   }
}
