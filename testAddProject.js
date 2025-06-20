const http = require('http');

const data = JSON.stringify({
  title: 'teste',
  description: 'Projeto de teste',
  url: 'http://teste.com'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/projetos',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);

  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
