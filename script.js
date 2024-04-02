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
    
    //essa outra função trabalha em conjunto com a função acima, ela pega o unico ojeto gerado pela função acima e os formata
    //em uma lista de objetos , onde cada objeto é o valor de um campo e quantas ocorrencias cada um teve
    const criaListaObjetos = (lista) => (campo) => {
      return Object.entries(lista).map(([chave, ocorrencias]) => ({
        [campo]: chave,
        ocorrencias
      }));
    };
  
    
    // Questão 1 , acerca de idades , o usuários escolhe entre o mais novo ou mais velho participante ou participantes registrados
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
         atleta do pais( time ): ${x.Team} , competiu na temporada ${x.Season} de ${x.Year} , quando tinha tal idade, pelo esport de ${x.Sport}.`);
      return ordenaListaIdades[0] 
    }
   // Obtém os elementos HTML
  const btMaisNovo = document.getElementById('btnMaisNovo');
  const btMaisVelho = document.getElementById('btnMaisVelho');
  const resultadoLabel = document.getElementById('resultado');
    
  // Adiciona event listeners aos botões , menor idade
  btMaisNovo.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      resultadoLabel.innerHTML = OrdenaListaPorIdade('menor')();
  });
  btMaisVelho.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      resultadoLabel.innerHTML = OrdenaListaPorIdade('maior')();
  });

  //Questão2 - sobre edições de  olimpiadas
  //Reuso da função criaObjetoComValoresDeCampoOcorrencia com um dos parametros sendo o ano, para conseguir contar o numero de edições 
  // e ver quando ocorreu a primeira olimpiada
  
  
  const primeiraEdicaOlimpModerna = criaListaObjetos(criaObjetoComValoresDeCampoOcorrencia(resultado)('Year'))('Year')
  const ultimaEdicaoOlimpicaCatalogada = primeiraEdicaOlimpModerna[ primeiraEdicaOlimpModerna.length - 1].Year

  // adição de eventos ao html
  //botão1 - primeiro ano de olimpiadas modernas
  const btprimeiraEdicao = document.getElementById('primeiraEdicao');
  const btnumeroEdicoes = document.getElementById('numeroEdicoes');
  const resultadoLabelQ2 = document.getElementById('resultadoQ2');
    
  // Adiciona event listeners aos botões
  btprimeiraEdicao.addEventListener('click', () => {
  // const com resultados 
      resultadoLabelQ2.innerHTML = `A primeira edição das novas olímpiadas ocorreu no ano de: ${primeiraEdicaOlimpModerna[0].Year}`
  });
  

  //botão2 - numero de ediçoes desde a primeira , até 2016
  //função usandoo o reduce para contar ,por ano, a qntdd de edições  
  const numeroEdicoes = primeiraEdicaOlimpModerna.reduce((acc) => acc + 1, 0)

  btnumeroEdicoes.addEventListener('click', () => {
        resultadoLabelQ2.innerHTML = `Desde a ocorrência da primeira olimpiada moderna , 
          <br> ja ocorreram ${numeroEdicoes} edições (segundo dados de arquivo) , entre temporadas de verão e inverno.
          <br>Na história apenas duas vezes o evento foi cancelado.   Motivo ? 1a e 2a guerra mundial`
  });


  // Q3 - homens e mulheres nas olimpiadas
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

  //botões questão 3
  const btHomens = document.getElementById('numeroHomens');
  const btMulheres = document.getElementById('numeroMulheres');
  const btTotal = document.getElementById('numeroTotal');
  const resultadoQ3Label = document.getElementById('resultadoQ3')
    
  // Adiciona event listeners aos botões
  btHomens.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      resultadoQ3Label.innerHTML = `Desde a primeira edição das olimpiadas modernas, 
        dentre todas até a ultima catalogada( 2016) um total de ${totalHomens} atletas homens participaram de olimpiadas.`
  });
  btMulheres.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
    resultadoQ3Label.innerHTML = `As mulheres na história das olimpíadas , tambem tiveram  seu papel , 
      foram ${totalMulheres} que ja participaram  desde sua primeira edição, 
      um numero expressivo , ainda assim , distante do total de homens , 
      elas representam apenas ${(porcentagemReferenteaOutroValor(totalMulheres)(totalHomens)).toFixed(2)}% do total de atletas que ja participaram em edições.`
  });
  btTotal.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      resultadoQ3Label.innerHTML = `Em ${ ultimaEdicaoOlimpicaCatalogada - primeiraEdicaOlimpModerna[0].Year } anos de história moderna e jogos olimpicos ,
        um total de ${totalAtletas} atletas ja competiram no evento.`
  });

  //questão4 - sobre temporadas
  //const armazenando o numero de sports e quantidade de vezes q  foi citado
    
    //constantes armazenando as temporadas de inverno  e verão separadamente
    const filtraTemporada = ( lista ) => ( temporada ) => lista.filter( x => x.Season == temporada)
    const verao = filtraTemporada(resultado)('Summer')
    const inverno = filtraTemporada(resultado)('Winter')

    // temporada verao
    const ano1TemporadaVerao = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia (verao)('Year') )('Year')
    const numeroDeAtletasQParticiparamVerao = criaListaObjetos ( criaObjetoComValoresDeCampoOcorrencia(resultado.filter(x => x.Year == ano1TemporadaVerao[0].Year))('Name') )('Name').length
    const quantidadeSports = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(verao)('Sport'))('Sport').length
    const quantidadeModalidades = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(verao)('Event'))('Event').length

    
    //temporada inverno
    const ano1TemporadaInverno = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(inverno)('Year') )('Year')
    const numeroDeAtletasQParticiparamInverno = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(resultado.filter( x => x.Year == ano1TemporadaInverno[0].Year))('Name') )('Name').length
    const quantidadeSportsInverno = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(inverno)('Sport') )('Sport').length
    const quantidadeModalidasInverno = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(inverno)('Event'))('Event').length

    //botoes
    const btVerao = document.getElementById('verao')
    const btInverno = document.getElementById('inverno')
    const resultadoQ4Label = document.getElementById('resultadoQ4')

    //acionamente e exibição de botões/resultados
    //bt verão
    //const contendo registro cm dados da primeria olimpiada
    const dadosPrimeiraOlimpiada = resultado.filter( x => x.Year == primeiraEdicaOlimpModerna[0].Year )
    const dadosPrimeiraOlimpiadaInverno = resultado.filter( x => x.Season == 'Winter'  &&  x.Year == ano1TemporadaInverno[0].Year)

    btVerao.addEventListener('click', () => {
        resultadoQ4Label.innerHTML = `Inicialmente os jogos olímpicos eram apenas em sua temporada de verão , <br>
          foi em ${dadosPrimeiraOlimpiada[0].Year}, na cidade de ${dadosPrimeiraOlimpiada[0].City}, no país da ${dadosPrimeiraOlimpiada[0].Team},
          com um  total de ${numeroDeAtletasQParticiparamVerao} atletas , competindo em ${quantidadeSports} esportes e ${quantidadeModalidades} modalidades.`
    })

    //bt inverno
    btInverno.addEventListener('click', () =>{
        resultadoQ4Label.innerHTML = `A primeira competição de carater mundial , ocorreu em ${ano1TemporadaInverno[0].Year}, sediada em ${dadosPrimeiraOlimpiadaInverno[0].City} ,
          ${dadosPrimeiraOlimpiadaInverno[6].Team}, com ${numeroDeAtletasQParticiparamInverno} competidores , disputando entre ${quantidadeSportsInverno} esportes 
          e ${quantidadeModalidasInverno} modalidades.`
    })

  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
})();
