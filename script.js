// usei como base de leitura, arquivo disponibilizado para aulas anteriores sobre olimpiadas de 2016
const lerArquivoCsv = async (caminhoArquivo) => {
    try {
        const response = await fetch(`${caminhoArquivo}`);
        if (!response.ok) {
            throw new Error('Falha ao carregar o arquivo');
        }
        const csvContent = await response.text();
        return csvContent;
    } catch (err) {
        throw err;
    }
};
//processamento de linhas para objetos
const parseCSV = (csv) => {
//separação de campos por ',' fora de aspas , usando o split para a formatação em quebra de linha 
    const lines = csv.split(/\r?\n/);
    const [cabecalho, ...linhasDados] = lines;

    const camposCabecalho = cabecalho.split(',');
//copias de dados para uso do replaace
    const copiaCampoCabecalho = [...camposCabecalho].map(item => item.replace(/"/g, ''));

    const dados = linhasDados.map(linha => {
// split cm parametro para ignorar virgulas entre aspas
    const campos = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    return campos.reduce((obj, Name, index) => {
        obj[copiaCampoCabecalho[index]] = Name.replace(/"/g, '');
        return obj;
    }, {});
    });

    return dados;
}

// Exemplo de uso com async/await
const caminhoArquivoAtletas = 'atletas.csv';

(async () => {
  try {
    const conteudoArquivo = await lerArquivoCsv(caminhoArquivoAtletas);
    //Object.Freeze para congelar e garantir a imutabilidade dos dados obtidos através do arquivo fornecido
    const resultado = Object.freeze(parseCSV(conteudoArquivo))
    const copiaDadosResultado = [...resultado]
    //console.log('Dados lidos:', resultado);

    //funçõa currificada para contar ocorrencias de determinado campo e agrupar em objetos , vai facilitar e possibilitar a contagem de objetos
    // visto o arquivo trazer para alguns atletas mais de um objeto , seja pelas suas participações em mais de uma olimpiada ou competição em mais de um esporte
    const criaObjetoComValoresDeCampoOcorrencia = (lista) => (campoDesejado)=>{
        const resultado = [...lista].reduce((contador, controle) => {
            const campo = controle[campoDesejado];
            if (campo && campo.trim() !== '') {
                const nomeSemAspas = campo.replace(/^"|"$/g, '');
                contador[nomeSemAspas] = (contador[nomeSemAspas] || 0) + 1;
            }
            return contador;
        }, {});
        return resultado;
    };
    
    //essa outra função trabalha em conjunto com a função acima, ela pega o unico objeto gerado pela função acima e os formata
    //em uma lista de objetos , onde cada objeto é o valor de um campo e quantas ocorrencias cada um teve
    const criaListaObjetos = (lista) => (campo) => {
      return Object.entries(lista).map(([chave, ocorrencias]) => ({
        [campo]: chave,
        ocorrencias
      }));
    };
  
    // Questão 1 , acerca de idades dos atletas , o usuários escolhe entre o mais novo ou mais velho participante ou participantes registrados
    // constantes para definir maior ou menor idade 
    const OrdenaListaPorIdade =  (idadeMaisMenos) => (lista = resultado) => {
        const resolverNA = lista.filter( x => x.Age !== 'NA')
        const compararIdades = (a, b) => {
            if (idadeMaisMenos === 'maior') {                  
              // Ordenar por maior idade
                return b.Age - a.Age; 
            } else if ( idadeMaisMenos === 'menor') {
              // Ordenar por menor idade
                 return a.Age - b.Age; 
          }
      };      
      // uso do sort em uma copia da lista para garantir a imutabilidade da lista original
      const copiaLista = [...resolverNA];
      const ordenaListaIdades = copiaLista.sort(compararIdades).map(x => `${x.Name} , com inacreditaveis ${x.Age} anos , <br>
         atleta do pais( time ): ${x.Team} ,quando tinha tal idade, competiu na temporada ${x.Season} de ${x.Year} , pelo esport de ${x.Sport}.`);
      return ordenaListaIdades[0] 
    }
   // Obtém os elementos HTML
  const btMaisNovo = document.getElementById('btnMaisNovo');
  const btMaisVelho = document.getElementById('btnMaisVelho');
  const resultadoLabel = document.getElementById('resultadoQ1');
    
  // Adiciona event listeners aos botões , menor idade
  btMaisNovo.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      resultadoLabel.innerHTML = OrdenaListaPorIdade('menor')();
  });
  btMaisVelho.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      resultadoLabel.innerHTML = OrdenaListaPorIdade('maior')();
  });

  // Q2 - Atletas homens e Atles mulheres
  // reuso da função criaObjetoComValoresDeCampoOcorrencia agr usando como parametro atletas
  //novas constante para armazenar a lista filtrada por sexo
  const sexMasculino = resultado.filter(x => x.Sex == 'M')
  const sexFeminino = resultado.filter(x => x.Sex == 'F')
  //utilização de const para guardar valor de aplicação a função currificada cm lista ja filtrada por sexo
  //resultados para botões do html
  const totalHomens = criaListaObjetos(criaObjetoComValoresDeCampoOcorrencia(sexMasculino)('Name'))('Name').length
  const totalMulheres = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(sexFeminino)('Name'))('Name').length
  const totalAtletas = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(resultado)('Name'))('Name').length
  
  const porcentagemReferenteaOutroValor = ( valor1 ) => ( valor2 ) => (valor1 / valor2) * 100
  // usando length - 2 como indice do ultimo elemento , devido o length - 1 retorna a ultima linha do arquivo , que está vazia
  const tempoDeEventoOlimpico = copiaDadosResultado.sort((a , b) => a.Year - b.Year)

  //botões questão 2
  const btHomens = document.getElementById('numeroHomens');
  const btMulheres = document.getElementById('numeroMulheres');
  const btTotal = document.getElementById('numeroTotal');
  const resultadoQ2Label = document.getElementById('resultadoQ2')
    
  // Adiciona event listeners aos botões
  btHomens.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      resultadoQ2Label.innerHTML = `Desde a primeira edição das olimpiadas modernas, 
        dentre todas até a ultima catalogada( 2016) um total de ${totalHomens} atletas homens participaram de olimpiadas.`
  });
  btMulheres.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
    resultadoQ2Label.innerHTML = `As mulheres na história das olimpíadas , tambem tiveram  seu papel , 
      foram ${totalMulheres} que ja participaram  desde sua primeira edição, 
      um numero expressivo ,<br> ainda assim , distante do total de homens , 
      elas representam apenas ${(porcentagemReferenteaOutroValor(totalMulheres)(totalHomens)).toFixed(2)}% do total de atletas que ja participaram em edições.`
  });
  btTotal.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      resultadoQ2Label.innerHTML = `Em ${ tempoDeEventoOlimpico[tempoDeEventoOlimpico.length - 2 ].Year - tempoDeEventoOlimpico[0].Year } anos de história moderna de jogos olimpícos ,
        um total de ${totalAtletas} atletas ja competiram no evento.`
  });



  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
})();
