async function fetchData() {
    console.log("fetchData foi chamado"); 
    try {
        // Fetching Cat Fact
        const catFactResponse = await axios.get("https://catfact.ninja/fact");
        console.log("Resposta do Servidor catFact:", catFactResponse); 
        const catFact = catFactResponse.data.fact;
        console.log("Cat Fact:", catFact);
        document.getElementById("fact").innerText = `Cat Fact: ${catFact}`;

        // Fetching Access Token
        const tokenResponse = await axios.post("https://tecweb-js.insper-comp.com.br/token", 
            { username: "gustavoet" }, 
            { headers: { "Content-Type": "application/json", "Accept": "application/json" } }
        );
        const accessToken = tokenResponse.data.accessToken;
        console.log(`Access Token: ${accessToken}`);
        document.getElementById("token").innerText = `Access Token: ${accessToken}`;

        // Fetch and Process Exercises
        await fetchExercises(accessToken);
        return accessToken;

    } catch (error) {
        console.error("Error during fetchData:", error);
    }
}

async function fetchExercises(accessToken) {
    console.log("fetchExercises foi chamado");
    try {
        const exercisesResponse = await axios.get("https://tecweb-js.insper-comp.com.br/exercicio", {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });
        console.log("Resposta do Servidor de Exercícios:", exercisesResponse);
        const exercises = exercisesResponse.data;

        const exercisesList = document.getElementById("exercises");
        exercisesList.innerHTML = ""; 

        // Processa todos os exercícios em paralelo
        const exercisePromises = Object.keys(exercises).map(async (slug) => {
            const exercise = exercises[slug];
            const exerciseItem = document.createElement("div");
            exerciseItem.innerHTML = `
                <h3>${exercise.titulo}</h3>
                <p>${exercise.descricao}</p>
                <p><strong>Entrada:</strong> ${JSON.stringify(exercise.entrada)}</p>
                <p><strong>Pontuação:</strong> ${exercise.pontuacao}</p>
                <hr>
            `;
            exercisesList.appendChild(exerciseItem);
            const respostaHTML = await processarExercicioPorSlug(slug, exercise, accessToken);
            return respostaHTML || `<p class="resposta">${slug}: slug não encontrada</p>`;
        });
        const resultados = await Promise.all(exercisePromises);
        resultados.forEach(respostaHTML => exercisesList.innerHTML += respostaHTML);

    } catch (error) {
        console.error("Error ao buscar exercícios:", error);
    }
}

async function processarExercicioPorSlug(slug, exercise, accessToken) {
    try {
        const entrada = exercise.entrada;
        let answer;

        switch (slug) {
            case 'soma':
                answer = soma(entrada);
                break;
            case 'soma-valores':
                answer = somaValores(entrada);
                break;
            case 'tamanho-string':
                answer = tamanhoString(entrada);
                break;
            case 'nome-do-usuario':
                answer = nomeUsuario(entrada);
                break;
            case 'jaca-wars':
                answer = jacaWars(entrada);
                break;
            case 'ano-bissexto':
                answer = anoBissexto(entrada);
                break;
            case 'volume-da-pizza':
                answer = volumePizza(entrada);
                break;
            case 'mru':
                answer = movimentoRetilineoUniforme(entrada);
                break;
            case 'inverte-string':
                answer = inverterString(entrada);
                break;
            case 'n-esimo-primo':
                answer = enesimoPrimo(entrada);
                break;
            case 'maior-prefixo-comum':
                answer = maiorPrefixoComum(entrada);
                break;
            case 'soma-segundo-maior-e-menor-numeros':
                answer = somaSegundoMaiorMenor(entrada);
                break;
            case 'conta-palindromos':
                answer = contaPalindromos(entrada);
                break;
            case 'soma-de-strings-de-ints':
                answer = somaStringsInts(entrada);
                break;
            case 'soma-com-requisicoes':
                answer = await somaComRequisicoes(entrada, accessToken);
                break;
            case 'caca-ao-tesouro':
                answer = await cacaAoTesouro(entrada, accessToken);
                break;
            default:
                console.error(`Slug ${slug} não encontrado`);
                return null;
        }

        const respostaHTML = await processaResposta(slug, answer, accessToken);
        return respostaHTML;
    } catch (error) {
        console.error(`Erro ao processar o exercício ${slug}:`, error);
        return `<p class="resposta">${slug}: erro ao processar</p>`;
    }
}

async function processaSlug(slug, accessToken) {
    try {
        const exerciseResponse = await axios.get(`https://tecweb-js.insper-comp.com.br/exercicio/${slug}`, {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        });
        const exercise = exerciseResponse.data;
        console.log("Exercício:", exercise);
        return {
            slug: slug,
            entrada: exercise.entrada
        };
    } catch (error) {
        console.error(`Erro ao buscar slug ${slug}:`, error);
        throw error;
    }
}

async function processaResposta(slug, answer, accessToken) {
    try {
        const isCorrect = await enviaResposta(slug, answer, accessToken);
        return isCorrect 
            ? `<p class="resposta">${slug}: correta</p>` 
            : `<p class="resposta">${slug}: incorreta</p>`;
    } catch (error) {
        console.error(`Erro ao enviar resposta para ${slug}:`, error);
        return `<p class="resposta">${slug}: erro ao enviar resposta</p>`;
    }
}

async function enviaResposta(slug, answer, accessToken) {
    console.log(`Enviando resposta para ${slug}`);
    try {
        const response = await axios.post(`https://tecweb-js.insper-comp.com.br/exercicio/${slug}`, 
            { resposta: answer }, 
            { headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${accessToken}` } }
        );
        console.log(`Resposta para ${slug}:`, response.data);
        return response.data.sucesso;
    } catch (error) {
        console.error(`Erro ao enviar resposta para ${slug}:`, error);
        throw error;
    }
}

// Funções de lógica de exercícios
function soma({ a, b }) {
    return a + b;
}

function tamanhoString({ string }) {
    return string.length;
}

function nomeUsuario({ email }) {
    return email.split('@')[0];
}

function jacaWars({ v, theta }) {
    const g = 9.8; // Aceleração gravitacional
    const distanciaAlvo = 100; // Distância do alvo em metros
    const raioEspalhamento = 2; // Raio de espalhamento da jaca

    // Convertendo o ângulo de graus para radianos
    const thetaRadians = (theta * Math.PI) / 180;

    // Calculando a distância alcançada pela jaca
    const distance = (Math.pow(v, 2) * Math.sin(2 * thetaRadians)) / g;

    // Verificando se a jaca acertou o alvo
    if (distance >= distanciaAlvo - raioEspalhamento && distance <= distanciaAlvo + raioEspalhamento) {
        return 0; // Atingiu o alvo
    } else if (distance < distanciaAlvo - raioEspalhamento) {
        return -1; // Não chegou ao alvo
    } else {
        return 1; // Passou do alvo
    }
}

function anoBissexto({ ano }) {
    return (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
}

function volumePizza({ z, a }) {
    return Math.round(Math.PI * z * z * a);
}

function movimentoRetilineoUniforme({ s0, v, t }) {
    return s0 + v * t;
}

function inverterString({ string }) {
    return string.split('').reverse().join('');
}

function somaValores({objeto}){
    let total = 0;
    for (const [key, value] of Object.entries(objeto)) {
        total += value;
    }
    return total;
}

function enesimoPrimo({n}){
    let count = 0;
    let number = 2;
    while (count < n) {
        if (ehPrimo(number)) {
            count++;
        }
        number++;
    }
    return number - 1;
}

function ehPrimo(number) {
    for (let i = 2; i <= Math.sqrt(number); i++) {
        if (number % i === 0) {
            return false;
        }
    }
    return number > 1;
}

function maiorPrefixoComum({ strings }) {
    if (strings.length === 0) return "";
    
    let maiorPrefixo = "";
    
    // Iterar sobre todas as strings
    for (let i = 0; i < strings.length; i++) {
        for (let j = i + 1; j < strings.length; j++) {
            let prefixoAtual = "";
            let str1 = strings[i];
            let str2 = strings[j];
            
            // Comparar as duas strings para encontrar o prefixo comum
            for (let k = 0; k < Math.min(str1.length, str2.length); k++) {
                if (str1[k] === str2[k]) {
                    prefixoAtual += str1[k];
                } else {
                    break; // Parar assim que os caracteres forem diferentes
                }
            }
            
            // Atualizar o maior prefixo se o atual for maior
            if (prefixoAtual.length > maiorPrefixo.length) {
                maiorPrefixo = prefixoAtual;
            }
        }
    }
    
    return maiorPrefixo;
}

function somaSegundoMaiorMenor({numeros}){
    if (numeros.length < 2) return 0;
    const sortedNumbers = numeros.sort((a, b) => a - b);
    return sortedNumbers[sortedNumbers.length - 2] + sortedNumbers[1];
}

function contaPalindromos({palavras}){
    let count = 0;
    for (const palavra of palavras) {
        if (palavra === palavra.split('').reverse().join('')) {
            count++;
        }
    }
    return count;
}

function somaStringsInts({strings}){
    let sum = 0;
    for (const string of strings) {
        sum += parseInt(string, 10);
    }
    return sum;
}


async function somaComRequisicoes({ endpoints }, accessToken) {
    try {
        // Garante que todos os endpoints usem https
        const requisicoes = endpoints.map(endpoint => {
            const httpsEndpoint = endpoint.replace('http://', 'https://');
            return axios.get(httpsEndpoint, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });
        });

        // Aguarda todas as requisições serem concluídas
        const respostas = await Promise.all(requisicoes);

        // Extrai os valores das respostas e soma todos eles
        const soma = respostas.reduce((total, resposta) => {
            const valor = resposta.data; // A resposta deve conter um número
            return total + valor;
        }, 0);

        return soma;

    } catch (error) {
        console.error("Erro ao buscar dados dos endpoints:", error);
        throw error;
    }
}

async function cacaAoTesouro({ inicio }, accessToken) {
    try {
        if (!inicio || typeof inicio !== 'string') {
            throw new Error("URL de início inválida.");
        }

        // Converte o primeiro URL para https
        let url = inicio.replace('http://', 'https://');
        let tesouroEncontrado = false;

        // Loop para seguir as URLs até encontrar o tesouro
        while (!tesouroEncontrado) {
            const response = await axios.get(url, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });

            const data = response.data;
            console.log(`Resposta recebida de ${url}:`, data);

            // Verifica se o tesouro é um número diretamente
            if (typeof data === 'number') {
                tesouroEncontrado = true;
                return data; // Retorna o tesouro (número)
            }

            // Verifica se a resposta é uma URL (string) e segue para a próxima URL
            if (typeof data === 'string') {
                url = data.replace('http://', 'https://');
                continue;
            }

            // Verifica se existe o campo 'proximo' antes de tentar usar o replace
            if (!data.proximo || typeof data.proximo !== 'string') {
                throw new Error("URL de próxima etapa inválida ou não encontrada.");
            }

            // Atualiza a URL para a próxima, convertendo para https se necessário
            url = data.proximo.replace('http://', 'https://');
        }

    } catch (error) {
        console.error("Erro durante a Caça ao Tesouro:", error);
        throw error;
    }
}


document.addEventListener("DOMContentLoaded", function() {
    fetchData();
});  