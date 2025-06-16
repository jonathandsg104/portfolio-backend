require('dotenv').config(); // Importa variáveis de ambiente do .env
const express = require('express');
const cors = require('cors');
const functions = require('firebase-functions'); // Importa o Firebase Functions
const db = require('./firebaseConfig'); // Importa a configuração do Firebase

const app = express();

// Configuração de CORS
app.use(cors({
  origin: ["https://jonathanportifolio.com.br", "http://localhost:3000"], // Permite localhost para desenvolvimento
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); // Middleware para parse de JSON

// Rota de autenticação
app.post('/auth', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASSWORD) {
    return res.status(200).json({ isAdmin: true }); // Autenticação bem-sucedida
  } else {
    return res.status(403).json({ isAdmin: false }); // Autenticação falhou
  }
});

// Rota para buscar todos os projetos
app.get('/projetos', async (req, res) => {
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

// Rota para adicionar um projeto
app.post('/projetos', async (req, res) => {
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
app.delete('/projetos/:id', async (req, res) => {
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
  app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
  });
}