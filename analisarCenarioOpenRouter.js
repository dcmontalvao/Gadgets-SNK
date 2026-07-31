async function analisarCenarioOpenRouter(S_PROMPT,OPENROUTER_KEY,MODELOS,A_JSON) {
    try{

    var jsonPayload = A_JSON;
    var systemMsg = S_PROMPT; 
	
	console.log('Iniciando Conexão com a IA Prompt: \n' + S_PROMPT);
	console.log('MODELOS:' , MODELOS);
	console.log('JSON: ' , A_JSON);
	
        // 3. Chama a API do OpenRouter
        var lastError = "";
        var success = false;
        var textoFinal = "Sem resposta da IA.";

        for (var m = 0; m < MODELOS.length; m++) {
            try {
                var response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + OPENROUTER_KEY,
                        "HTTP-Referer": window.location.href,
                        "X-Title": "Análise de Dados"
                    },
                    body: JSON.stringify({
                        model: MODELOS[m],
                        messages: [
                            { role: "system", content: systemMsg },
                            { role: "user", content: "DADOS JSON:" + jsonPayload }
                        ]
                    })
                });

                var data = await response.json();

                if (response.ok && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                    textoFinal = data.choices[0].message.content;
                    textoFinal = textoFinal.replace(/\*\*/g, "").replace(/#/g, "").replace(/`/g, "");
                    success = true;
                    break;
                } else {
                    lastError = "Modelo " + MODELOS[m] + " HTTP " + response.status;
                    if (data.error) lastError += " - " + data.error.message;
                }
            } catch (err) {
                lastError = err.message;
            }
        }

        if (!success) {
            textoFinal = "Erro na análise: " + lastError;
        }

        // 4. Exibe o texto
        console.log(textoFinal);
		return textoFinal;


    } catch (error) {
        console.error(error);
		return error;
       
       }
}
