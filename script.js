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
    return campos.reduce((obj, campo, index) => {
      obj[copiaCampoCabecalho[index]] = campo.replace(/"/g, '');
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
    
    // Questão 1 , acerca de idades , o usuários escolhe entre o mais novo ou mais velho participante ou participantes registrados
    // constantes para definir maior ou menor idade 
 
      const ordenaListaPorCampo =  (idadeMaisMenos) => (lista = resultado) => {
        const resolverNA = lista.filter( x => x.Age !== 'NA')
        const compararIdades = (a, b) => {
          if (idadeMaisMenos === 'maior') {
              return b.Age - a.Age; // Ordenar por maior idade
          } else if ( idadeMaisMenos === 'menor') {
            return a.Age - b.Age; // Ordenar por menor idade
          }
        };
      // uso do sort em uma copia da lista para garantir a imutabilidade da lista original
      const copiaLista = [...resolverNA];
      const ordenaListaIdades = copiaLista.sort(compararIdades).map(x => `${x.Name},com inacreditaveis ${x.Age} anos, <br>
         atleta do pais( time ): ${x.Team}, competiu na temporada ${x.Season} de ${x.Year} , quando tinha tal idade, pelo esport de ${x.Sport}.`);
      return ordenaListaIdades[0] // retorna 58 , 0 maior em ordem e 12 , o menor 
    }
   // Obtém os elementos HTML
  const btMaisNovo = document.getElementById('btnMaisNovo');
  const btMaisVelho = document.getElementById('btnMaisVelho');
  const resultadoLabel = document.getElementById('resultado');
    
  // Adiciona event listeners aos botões , menor idade
  btMaisNovo.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      resultadoLabel.innerHTML = ordenaListaPorCampo('menor')();
  });
  btMaisVelho.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      resultadoLabel.innerHTML = ordenaListaPorCampo('maior')();
  });

  //Questão2 - sobre edições de  olimpiadas
  // cria uma lista de registro com campo e ocorrencias de determinado campo
  const contarOcorrenciasPorId = [...resultado].reduce((contador, controle) => {
    const { Year } = controle;
    if (!isNaN(parseInt( Year ))) {
      contador[ Year ] = (contador[ Year ] || 0) + 1;
    }
    return contador;
  }, {});
  
  const listaOcorrencias = Object.entries(contarOcorrenciasPorId).map(([ Year, ocorrencias]) => ({
    Year: parseInt(Year),
    ocorrencias
  }));
  
  const primeiraEdicaOlimpModerna = listaOcorrencias[0].Year
  const ultimaEdicaoCatalogada = listaOcorrencias[listaOcorrencias.length - 1].Year
  // adição de eventos ao html
  //botão1 - primeiro ano de olimpiadas modernas
  const btprimeiraEdicao = document.getElementById('primeiraEdicao');
  const btnumeroEdicoes = document.getElementById('numeroEdicoes');
  const resultadoLabelQ2 = document.getElementById('resultadoQ2');
    
  // Adiciona event listeners aos botões
  btprimeiraEdicao.addEventListener('click', () => {
  // const com resultados 
      resultadoLabelQ2.innerHTML = `A primeira edição das novas olímpiadas ocorreu no ano de: ${primeiraEdicaOlimpModerna}`
  });
  
  //console.log(primeiraEdicaOlimpModerna)

  //botão2 - numero de ediçoes desde a primeira , até 2016
  //função usandoo o reduce para contar ,por ano, a qntdd de edições  
  const numeroEdicoes = listaOcorrencias.map( x => x.Year).reduce((acc) => acc + 1, 0)

  btnumeroEdicoes.addEventListener('click', () => {
        resultadoLabelQ2.innerHTML = `Desde a ocorrência da primeira olimpiada moderna , 
          <br> ja ocorreram ${numeroEdicoes} edições (segundo dados de arquivo) , entre temporadas de verão e inverno.
          <br>Na história apenas duas vezes o evento foi cancelado.   Motivo ? 1a e 2a guerra mundial`
  });


  // Q3 - homens e mulheres nas olimpiadas
  //adaptação da função ordenalistaporcampo para separar em objetos nome dos atletas e a qunatidade de vezes q foi citado  no arquivo
  const contarOcorrenciasPorNome = (lista) => { 
    const resultado = [...lista].reduce((contador, controle) => {
    const { Name } = controle;
    // Verifica se o nome é uma string não vazia ou não é "NA", adicionei essa verificação pq em idades percebi q algns campos não tinham dados
    //o trim, usado em uma cópia dos dados para remover espaços em branco e facilitar a leitura e tratamento dos dados
    if (Name && Name.trim() !== '') {
        // Remove as aspas duplas do início e do fim do nome
        const nomeSemAspas = Name.replace(/^"|"$/g, '');
        // Usa o nome (sem aspas) como chave do contador
        contador[nomeSemAspas] = (contador[nomeSemAspas] || 0) + 1;
    }
    return contador;
  }, {})
    return resultado };
  // Mapeia as ocorrências para um formato mais adequado
  //nova constante para armazenar a lista filtrada por sexo
  const sexMasculino = resultado.filter(x => x.Sex == 'M')
  const sexFeminino = resultado.filter(x => x.Sex == 'F')

  //metodo para transformar o objeto recebido de contarocorrenciaspor nome para uma lista de objetos , onde cada objeto é um atleta q ja participou de algma olimpiada
  const listaOcorrenciasNomes = (lista) => ( funcao) => {
    return Object.entries(funcao(lista)).map(([Name, ocorrencias]) => ({
    Name,
    ocorrencias
  }))}

  //utilização de const para guardar valor de aplicação a função currificada cm lista ja filtrada por sexo
  //resultados para botões do html
  const totalHomens = (listaOcorrenciasNomes(sexMasculino)(contarOcorrenciasPorNome)).length
  const totalMulheres = (listaOcorrenciasNomes(sexFeminino)(contarOcorrenciasPorNome)).length
  const totalAtletas = (listaOcorrenciasNomes(resultado)(contarOcorrenciasPorNome)).length
  
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
      resultadoQ3Label.innerHTML = `Em ${ultimaEdicaoCatalogada - primeiraEdicaOlimpModerna} anos de história moderna e jogos olimpicos ,
        um total de ${totalAtletas} atletas ja competiram no evento.`
  });

  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
})();
