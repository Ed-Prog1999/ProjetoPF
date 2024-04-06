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
  const labelResultadoQ1 = document.getElementById('resultadoQ1'); 
  // Adiciona event listeners aos botões , menor idade
  btMaisNovo.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      labelResultadoQ1.innerHTML = OrdenaListaPorIdade('menor')();
  });
  btMaisVelho.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      labelResultadoQ1.innerHTML = OrdenaListaPorIdade('maior')();
  });


  // Q2 - Atletas homens e Atles mulheres
  // reuso da função criaObjetoComValoresDeCampoOcorrencia , agr , usando como arguento atletas
  //novas constante para armazenar a lista filtrada por sexo
  const sexMasculino = resultado.filter(x => x.Sex == 'M')
  const sexFeminino = resultado.filter(x => x.Sex == 'F')
  //utilização de const para guardar valor de aplicação a função currificada cm lista ja filtrada por sexo
  //resultados para botões do html
  const totalHomens = criaListaObjetos(criaObjetoComValoresDeCampoOcorrencia(sexMasculino)('Name'))('Name').length
  const totalMulheres = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(sexFeminino)('Name'))('Name').length
  const totalAtletas = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia(resultado)('Name'))('Name').length
  const porcentagemReferenteaOutroValor = ( valor1 ) => ( valor2 ) => (valor1 / valor2) * 100
  const tempoDeEventoOlimpico = copiaDadosResultado.sort((a , b) => a.Year - b.Year)
  //botões questão 2
  const btHomens = document.getElementById('numeroHomens');
  const btMulheres = document.getElementById('numeroMulheres');
  const btTotal = document.getElementById('numeroTotal');
  const labelResultadoQ2 = document.getElementById('resultadoQ2')  
  // Adiciona event listeners aos botões
  btHomens.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      labelResultadoQ2.innerHTML = `Desde a primeira edição das olimpiadas modernas, 
        dentre todas até a ultima catalogada( 2016) um total de ${totalHomens} atletas homens participaram de olimpiadas.`
  });
  btMulheres.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
    labelResultadoQ2.innerHTML = `As mulheres na história das olimpíadas , tambem tiveram  seu papel , 
      foram ${totalMulheres} que ja participaram  desde sua primeira edição, 
      um numero expressivo ,<br> ainda assim , distante do total de homens , 
      elas representam apenas ${(porcentagemReferenteaOutroValor(totalMulheres)(totalHomens)).toFixed(2)}% do total de atletas que ja participaram em edições.`
  });
  btTotal.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
  // usando length - 2 como indice do ultimo elemento , devido o length - 1 retorna a ultima linha do arquivo , que está vazia
      labelResultadoQ2.innerHTML = `Em ${ tempoDeEventoOlimpico[tempoDeEventoOlimpico.length - 2 ].Year - tempoDeEventoOlimpico[0].Year } anos de história moderna de jogos olimpícos ,
        um total de ${totalAtletas} atletas ja competiram no evento.`
  });


  // questão 3
  // altura de atletas
  //lista de alturas dos atles
  const alturaAtletas = criaListaObjetos (criaObjetoComValoresDeCampoOcorrencia(resultado)('Height'))('Altura');
  const atletaMaisBaixo = alturaAtletas[0].Altura
  const atletaMaisAlto = alturaAtletas[alturaAtletas. length - 2].Altura
  //informações dos atletas selecionados
  const dadosAtletaMaisBaixo = resultado.filter( x => x.Height == atletaMaisBaixo)[0]
  const dadosAtletaMaisAlto = resultado.filter( x => x.Height == atletaMaisAlto)
  
  //botões Q3
  const btMaisBaixo = document.getElementById('atletaMaisBaixo')
  const btMaisAlto = document.getElementById('atletaMaisAlto')
  const labelResultadoQ3 = document.getElementById('resultadoQ3')

  //eveento para os botões e exibição de dados em tela
  btMaisBaixo.addEventListener( 'click',() =>{
    labelResultadoQ3.innerHTML = `Uma das menores alturas registradas em olimpiadas pertence à atleta ${dadosAtletaMaisBaixo.Name} , <br>
        do ${dadosAtletaMaisBaixo.Team} , com ${ dadosAtletaMaisBaixo.Height / 100} m de altura, competidora de ${dadosAtletaMaisBaixo.Sport},
        competiu nos jogos de ${dadosAtletaMaisBaixo.Year} , temporada '${dadosAtletaMaisBaixo.Season}'.`
  })

  btMaisAlto.addEventListener( 'click',() =>{
    labelResultadoQ3.innerHTML = `O atleta olimpíco mais alto foi o gigante da ${dadosAtletaMaisAlto[0].Team} , ${dadosAtletaMaisAlto[0].Name} , 
      com supreendentes ${dadosAtletaMaisAlto[0].Height / 100} m de altura , como era de se esperar, jogador de ${dadosAtletaMaisAlto[0].Sport}.<br>
      participou dos jogos de ${dadosAtletaMaisAlto[0].Year}, ${dadosAtletaMaisAlto[1].Year} e ${dadosAtletaMaisAlto[2].Year} , temporada '${dadosAtletaMaisAlto[0].Season}' .`
  })

  //função para juntar registros de um msm atletas e remover registros , com determinado campo passado repetido
  //criada para descobrir qual atleta participou de mais olimpiadas ou modalidades de esportes , usada fututramente na questão 5 
  function JuntaRegistrosAtleta(registros, campo) {
    const atletas = registros.reduce((acc, registro) => {
        if (!acc[registro.Name]) {
            acc[registro.Name] = {};
        }
        acc[registro.Name][registro[campo]] = true;
        return acc;
    }, {});

    return Object.keys(atletas).map(nome => ({
        Name: nome,
        Participacoes: Object.keys(atletas[nome])
    }));
  }

  //questão 4
  // atletas Notaveis , mais citados em arquivo, inverno e verão
  // filtro de atletas por temporada
  const atletaVerao = resultado.filter( x => x.Season == 'Summer' )
  const atletaInverno = resultado.filter( x => x.Season == 'Winter')
  // reuso  de chamada para criaçao de lista e objetos com o numero de ocorrencia de cada nome de atleta
  //atleta verão 
  const atletaNotavelVerao = criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia (atletaVerao)('Name'))('Name')
  const atletaNotavelVeraoOrd = [...atletaNotavelVerao].sort((a, b) => b.ocorrencias - a.ocorrencias)[0]
  const dadosAtletaMaisCitado = resultado.filter( x => x.Name == atletaNotavelVeraoOrd.Name)
  const encontrarParticipacoesAtleta = JuntaRegistrosAtleta(dadosAtletaMaisCitado , 'Event')[0]
  //const modalidadeAtletaMaisCitado = encontrarParticipacoesAtleta.Participacoes.join(' , ')
  const participacoesAtletaVerao =JuntaRegistrosAtleta(resultado.filter( x => x.ID == 77710), "Year")[0].Participacoes.join( '  ,  ')
  //atleta inverno
  const atletaNotavelInverno =  criaListaObjetos( criaObjetoComValoresDeCampoOcorrencia (atletaInverno)('Name'))('Name')
  const atletaNotavelInvernoOrd = [...atletaNotavelInverno].sort((a, b) => b.ocorrencias - a.ocorrencias)[0]
  const dadosAtletaMaisCitadoInverno = resultado.filter( x => x.Name == atletaNotavelInvernoOrd.Name )
  const encontrarParticipacoesAtletaInverno = JuntaRegistrosAtleta(dadosAtletaMaisCitadoInverno , 'Event')[0]
  const modalidadeAtletaMaisCitadoInverno = encontrarParticipacoesAtletaInverno.Participacoes.join(' , ')

  
  //botões Q4
  const btAtletaNotavelVerao = document.getElementById('maisCitadoVerao')
  const btAtletaNotavelInverno = document.getElementById('maisCitadoInverno')
  const labelResultadoQ4 = document.getElementById('resultadoQ4')

  btAtletaNotavelVerao.addEventListener('click', () => {
      labelResultadoQ4.innerHTML = `O atleta de ${dadosAtletaMaisCitado[0].Team} , ${dadosAtletaMaisCitado[0].Name} 
        um dos que mais competiu em modalidades diferentes de um esporte de verão , competiu nos jogos de ${participacoesAtletaVerao}  <br>,
        competidor de ${dadosAtletaMaisCitado[0].Sport} , disputou diversas modalidades do esporte ,que hoje já não fazem parte dos jogos.`
  })

  btAtletaNotavelInverno.addEventListener('click', () => {
      labelResultadoQ4.innerHTML = `Um dos competidores com mais participações em olimpíadas ,  ${dadosAtletaMaisCitadoInverno[0].Name},
        competiu pelo esporte de ${dadosAtletaMaisCitadoInverno[0].Sport} , <br> nos anos de ${dadosAtletaMaisCitadoInverno[0].Year} à
        ${dadosAtletaMaisCitadoInverno[dadosAtletaMaisCitadoInverno.length - 1].Year}, nas modalidades de <br>${modalidadeAtletaMaisCitadoInverno} .`
  })
  

  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
})();
