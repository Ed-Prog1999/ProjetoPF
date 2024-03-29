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
    const idades = (idadesMaiorMenor) => (lista = resultado) => {
      const compararIdades = (a, b) => {
          if (idadesMaiorMenor === 'maior') {
              return b.Age - a.Age; // Ordenar por maior idade
          } else if (idadesMaiorMenor === 'menor') {
              return a.Age - b.Age; // Ordenar por menor idade
          }
      };
      // uso do sort em uma copia da lista para garantir a imutabilidade da lista original
      const copiaLista = [...lista];
      const ordenaListaIdades = copiaLista.sort(compararIdades).map(x => `${x.Name}, ${x.Age} anos, atleta do pais( time ): ${x.Team}, na temporada ${x.Season} de ${x.Year} , competiu pelo esport de ${x.Sport}`);
      return ordenaListaIdades[0]
    }
   // Obtém os elementos HTML
  const btnMaisNovo = document.getElementById('btnMaisNovo');
  const btnMaisVelho = document.getElementById('btnMaisVelho');
  const resultadoLabel = document.getElementById('resultado');
    
  // Adiciona event listeners aos botões
  btnMaisNovo.addEventListener('click', () => {
  // Exibe o resultado da função idades com a menor idade no elemento <label>
      resultadoLabel.textContent = idades('menor')();
  });
  btnMaisVelho.addEventListener('click', () => {
  // Exibe o resultado da função idades com a maior idade no elemento <label>
      resultadoLabel.textContent = idades('maior')();
  });

  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
})();
