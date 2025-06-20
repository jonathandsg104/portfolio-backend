require('dotenv').config(); // Importa variáveis de ambiente do .env

console.log(`Variável ADMIN_PASSWORD carregada: "${process.env.ADMIN_PASSWORD}"`);

const express = require('express');
const cors = require('cors');

const functions = require('firebase-functions'); // Importa o Firebase Functions
const db = require('./firebaseConfig'); // Importa a configuração do Firebase

const app = express();

// Configuração CORS diretamente na função Firebase
const allowedOrigins = [
  'https://jonathanportifolio.com.br',
  'http://localhost:3000',
  'http://localhost:3001'
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json()); // Middleware para parse de JSON

// Função para aplicar CORS manualmente em cada rota
function applyCors(req, res, next) {
  const origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) !== -1) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}

// Endpoint temporário para testar validação da senha
app.post('/test-auth', applyCors, (req, res) => {
  const { password } = req.body;
  const isValid = password && password.trim().toLowerCase() === process.env.ADMIN_PASSWORD.trim().toLowerCase();
  res.json({ passwordReceived: password, isValid });
});

// Rota de autenticação
app.post('/auth', applyCors, (req, res) => {
  const { password } = req.body;

  console.log(`Senha recebida: "${password}"`);
  console.log(`Senha esperada: "${process.env.ADMIN_PASSWORD}"`);

  if (password && password.trim().toLowerCase() === process.env.ADMIN_PASSWORD.trim().toLowerCase()) {
    return res.status(200).json({ isAdmin: true }); // Autenticação bem-sucedida
  } else {
    return res.status(403).json({ isAdmin: false }); // Autenticação falhou
  }
});

// Rota para buscar todos os projetos
app.get('/projetos', applyCors, async (req, res) => {
  try {
    const ref = db.ref('projetos');
    ref.once('value', (snapshot) => {
      const data = snapshot.val();
      const projetos = data
        ? Object.keys(data).map((id) => ({ id, ...data[id] }))
        : [];
      res.json(projetos);
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos.' });
  }
});

app.post('/projetos', applyCors, express.json(), async (req, res) => {
  try {
    const { title, description, url } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Título e descrição são obrigatórios.' });
    }

    const ref = db.ref('projetos');
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
      console.log('Chave "projetos" não encontrada. Criando chave...');
      await ref.set({ placeholder: true });
    }

    const newProjectRef = ref.push();
    await newProjectRef.set({ title, description, url });

    res.status(201).json({ id: newProjectRef.key, title, description, url });
  } catch (error) {
    console.error('Erro ao adicionar projeto:', error);
    res.status(500).json({ error: 'Erro ao adicionar projeto.' });
  }
});

// Rota para deletar um projeto
app.delete('/projetos/:id', applyCors, async (req, res) => {
  const { id } = req.params;
  console.log('ID recebido:', id);

  try {
    const ref = db.ref(`projetos/${id}`);
    const snapshot = await ref.once('value');
    console.log('Dados encontrados no snapshot:', snapshot.val());

    if (snapshot.exists()) {
      await ref.remove();
      console.log(`Projeto com ID ${id} deletado.`);
      res.json({ message: `Projeto com ID ${id} deletado com sucesso!` });
    } else {
      console.log(`Nó com ID ${id} não encontrado.`);
      res.status(404).json({ error: 'Projeto não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao processar exclusão:', error);
    res.status(500).json({ error: 'Erro ao deletar projeto.' });
  }
});

// Porta local para desenvolvimento
const PORT = 5000;

// Exporta o Express como uma Cloud Function
exports.api = functions.https.onRequest(app);

// Para rodar localmente apenas (opcional):
if (!process.env.FUNCTIONS_EMULATOR) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
    console.log(`Acessível em:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Rede: http://192.168.4.81:${PORT}`);
  });
}
