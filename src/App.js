import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [list, setList] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Função para adicionar item à lista e enviar para o banco de dados
  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && inputText.trim()) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(inputText)}&size=150x150`;

      // Enviar os dados para o backend
      try {
        const response = await axios.post('http://localhost:5000/add-qrcode', {
          text: inputText,
          qr_code_url: qrUrl,
        });

        // Verifica se a resposta contém o ID e adiciona à lista local
        if (response.data.id) {
          setList((prevList) => [
            ...prevList,
            { text: inputText, qr_code_url: qrUrl, id: response.data.id },
          ]);
        } else {
          console.error('Erro ao adicionar QR Code. ID não retornado.');
        }

        setInputText(''); // Limpar o campo de entrada
      } catch (error) {
        console.error('Erro ao adicionar QR Code:', error);
      }
    }
  };

  // Função para buscar os QR Codes do banco de dados
  const fetchQRCodes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/get-qrcodes');
      setList(response.data);
    } catch (error) {
      console.error('Erro ao buscar QR Codes:', error);
    }
  };

  // Função para deletar o QR Code
  const handleDelete = async (id) => {
    try {
      // Enviar a requisição DELETE para o backend
      const response = await axios.delete(`http://localhost:5000/delete-qrcode/${id}`);

      if (response.status === 200) {
        // Atualizar a lista no frontend
        setList((prevList) => prevList.filter((item) => item.id !== id));
        console.log('QR Code deletado com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao deletar QR Code:', error);
    }
  };

  // Carregar QR Codes quando a página for carregada
  useEffect(() => {
    fetchQRCodes();
  }, []);

  return (
    <div className="App">
      <h1>Gerador de QR Code</h1>
      <input
        type="text"
        placeholder="Digite o texto para gerar o QR Code"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <ul>
        {list.map((item) => (
          <li key={item.id}>
            <div>{item.text}</div>
            <img src={item.qr_code_url} alt="QR Code" />
            <button onClick={() => handleDelete(item.id)}>Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
