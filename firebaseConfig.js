const admin = require('firebase-admin');
const serviceAccount = require('./my-project-portifolio-1d23e-firebase-adminsdk-fbsvc-4afa9240b9.json'); // Caminho exato para o arquivo de credenciais

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Inicializando com a credencial correta
  databaseURL: 'https://my-project-portifolio-1d23e-default-rtdb.firebaseio.com', // URL correta do Realtime Database
});

const db = admin.database();

module.exports = db;