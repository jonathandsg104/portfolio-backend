const fetch = require('node-fetch');

async function testAddProject() {
  const project = {
    title: "Projeto Teste",
    description: "Descrição do projeto teste",
    url: "https://teste.com"
  };

  try {
    const response = await fetch('http://localhost:5000/projetos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    const data = await response.json();
    console.log('Resposta do servidor:', data);
  } catch (error) {
    console.error('Erro ao adicionar projeto:', error);
  }
}

testAddProject();
