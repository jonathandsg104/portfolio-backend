const admin = require('firebase-admin');
const serviceAccount = require('./my-project-portifolio-1d23e-firebase-adminsdk-fbsvc-4afa9240b9.json'); // Ajuste o caminho para sua chave de serviço

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://my-project-portifolio-1d23e-default-rtdb.firebaseio.com' // Ajuste para sua URL do Firebase Realtime Database
});

const db = admin.database();

const projetos = {
  "-OMqUgSlOkfcUFdecp3w": {
    description: "Projeto Web Site para um salão de beleza",
    title: "Beautysaloon",
    url: "https://github.com/jonathandsg104/beautysaloon"
  },
  "-ONPZCF6nU4_72r9XhPx": {
    description: "Site com meu currículo, e agente de IA, através de um ChatBot.",
    title: "Meu Portfólio",
    url: "https://jonathanportifolio.com.br/"
  }
};

async function updateProjects() {
  try {
    await db.ref('projetos').set(projetos);
    console.log('Dados dos projetos atualizados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro ao atualizar projetos:', error);
    process.exit(1);
  }
}

updateProjects();
