// usei como base arquvi de leitura disponibilizado para aula
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
    const resultado = parseCSV(conteudoArquivo)

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
      const ordenaListaIdades = copiaLista.sort(compararIdades).map(x => `${x.Name},com inacreditaveis ${x.Age} anos, atleta do pais( time ): ${x.Team}, na temporada ${x.Season} de ${x.Year} , competiu pelo esport de ${x.Sport}`);
      return ordenaListaIdades[0] // retorna 58 , 0 maior em ordem e 12 , o menor 
    }
   // Obtém os elementos HTML
  const btnMaisNovo = document.getElementById('btnMaisNovo');
  const btnMaisVelho = document.getElementById('btnMaisVelho');
  const resultadoLabel = document.getElementById('resultado');
    
  // Adiciona event listeners aos botões
  btnMaisNovo.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      resultadoLabel.innerHTML = ordenaListaPorCampo('menor')();
  });
  btnMaisVelho.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      resultadoLabel.innerHTML = ordenaListaPorCampo('maior')();
  });

  //Questão2 - sobre edições de  olimpiadas
  // cria uma lista de registro com campo e ocorrencias de determinado campo
  //botão1 - primeiro ano de olimpiadas modernas
  const contarOcorrenciasPorId = resultado.reduce((contador, controle) => {
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
  // adição de eventos ao html
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
  const numeroEdicoes = listaOcorrencias.map( x => x.Year).reduce((acc) => acc + 1, 0)
  
  btnumeroEdicoes.addEventListener('click', () => {
        resultadoLabelQ2.innerHTML = `Desde a ocorrência da primeira olimpiada moderna , <br> ja ocorreram ${numeroEdicoes} edições (segundo dados de arquivo) , entre temporadas de verão e inverno.<br>Na história apenas duas vezes o evento foi cancelado.   Motivo ? 1a e 2a guerra mundial`
  });

  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
})();
