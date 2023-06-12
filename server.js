const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/cliente1.html');
});

function loadExistingMessages(file, eventName, socket) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    socket.emit(eventName, data);
  });
}

function saveMessage(file, data) {
  fs.appendFile(file, data + '\n', (err) => {
    if (err) throw err;
    console.log('Texto guardado correctamente en el archivo.');
  });
}

function borrarTexto(cliente) {
  let archivo;
  let evento;

  if (cliente === 'cliente1') {
    archivo = 'public/assets/txt/textoParaCliente1.txt';
    evento = 'textoBorradoCliente1';
  } else if (cliente === 'cliente2') {
    archivo = 'public/assets/txt/textoParaCliente2.txt';
    evento = 'textoBorradoCliente2';
  } else {
    return;
  }

  fs.writeFile(archivo, '', (err) => {
    if (err) throw err;
    console.log(`Contenido del archivo de texto de ${cliente} borrado.`);
    io.emit(evento);
  });
}

io.on('connection', (socket) => {
  console.log('Cliente conectado');

  loadExistingMessages('public/assets/txt/textoParaCliente1.txt', 'mensajesExistentesCliente1', socket);
  loadExistingMessages('public/assets/txt/textoParaCliente2.txt', 'mensajesExistentesCliente2', socket);

  socket.on('textoCliente1', (data) => {
    saveMessage('public/assets/txt/textoParaCliente2.txt', data);
    io.emit('nuevoTextoCliente1', data);
  });

  socket.on('textoCliente2', (data) => {
    saveMessage('public/assets/txt/textoParaCliente1.txt', data);
    io.emit('nuevoTextoCliente2', data);
  });

  socket.on('borrarTexto', (cliente) => {
    borrarTexto(cliente);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
