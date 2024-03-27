const fs = require('fs').promises;

const lerArquivoCsv = async (caminhoArquivo) => {
  try {
    const data = await fs.readFile(caminhoArquivo, 'utf8');

    // Dividindo as linhascopia considerando \r?\n como separador
    const linhas = Object.freeze(data.split(/\r?\n/));
    const linhascopia = [...linhas];

    // Removendo o cabeçalho e dividindo as colunas
    const [cabecalho, ...linhasDados] = linhascopia;
    const camposCabecalho = cabecalho.split(',').map(item => item.replace(/"/g, ''));

    // Mapear as linhascopia de dados
    const dados = linhasDados.map(linha => {
      const campos = linha.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Divide considerando vírgulas fora de aspas
      return campos.reduce((obj, campo, index) => {
        obj[camposCabecalho[index]] = campo.replace(/"/g, ''); // Remove as aspas dos valores
        return obj;
      }, {});
    });

    return dados;
  } catch (err) {
    throw err;
  }
};

// Exemplo de uso com async/await
const caminhoArquivoAtletas = 'atletas.csv';
//const caminhoArquivoNoc = 'noc.csv';

(async () => {
  try {
    const resultado = await lerArquivoCsv(caminhoArquivoAtletas);
    console.log('Dados lidos:', resultado);
  } catch (err) {
    console.error('Erro ao ler o arquivo:', err);
  }
})();

