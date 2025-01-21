const express = require('express');
const cors = require('cors');
const mysql = require('mysql');
const app = express();

app.use(cors({ origin: 'http://localhost:3000' })); // Permitir apenas o frontend em localhost:3000
app.use(express.json()); // Para processar JSON no corpo da requisição

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Substitua pelo usuário do MySQL
  password: 'admin',  // Substitua pela senha do MySQL
  database: 'qrcode_db'  // Nome do banco de dados
});

db.connect(err => {
  if (err) {
    console.log('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados!');
});

// Rota para adicionar um novo QR Code
app.post('/add-qrcode', (req, res) => {
  const { text, qr_code_url } = req.body;
  const query = 'INSERT INTO qr_codes (text, qr_code_url) VALUES (?, ?)';

  db.query(query, [text, qr_code_url], (err, result) => {
    if (err) {
      console.error('Erro ao salvar QR Code:', err);
      return res.status(500).send('Erro ao salvar QR Code');
    }
    // Responde com o ID do novo QR Code
    res.status(200).send({ id: result.insertId });
  });
});

// Rota para buscar todos os QR Codes
app.get('/get-qrcodes', (req, res) => {
  db.query('SELECT * FROM qr_codes', (err, result) => {
    if (err) {
      console.error('Erro ao buscar QR Codes:', err);
      return res.status(500).send('Erro ao buscar QR Codes');
    }
    res.json(result);
  });
});

// Rota para deletar um QR Code pelo ID
app.delete('/delete-qrcode/:id', (req, res) => {
  const { id } = req.params; // Obtendo o ID do QR Code a ser deletado
  const query = 'DELETE FROM qr_codes WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Erro ao deletar QR Code:', err);
      return res.status(500).send('Erro ao deletar QR Code');
    }
    if (result.affectedRows === 0) {
      return res.status(404).send('QR Code não encontrado');
    }
    res.status(200).send({ message: 'QR Code deletado com sucesso' });
  });
});

// Inicia o servidor
app.listen(5000, () => {
  console.log('Servidor backend rodando na porta 5000');
});
