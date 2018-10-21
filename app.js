const express = require('express');
const socketIO = require('socket.io');
const {generateMessage, generateLocationMessage} = require('./utils/msg');
// const path = require('path');

const app = express();

app.use(express.static('public'));
// const publicPath = path.join(__dirname, 'public');
// app.use(express.static(publicPath));

// app.use('/', (req, res) => {
//     return 'index';
// });

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log(`Server is started on ${PORT}...`));

const io = socketIO(server);

//Registering EventListener for 'connection' event.
io.on('connection', (socket) => {
    console.log('New user connected...');

    socket.broadcast.emit('newMessage', generateMessage('Admin', 'New User Joins'));

    socket.emit('newMessage',generateMessage('Admin', 'Welcome to chat...'));

    socket.on('createMessage', (msg)=>{
        console.log('Create message: ', msg);
        io.emit('newMessage', generateMessage(msg.from, msg.text));
    });

    socket.on('createLocationMessage', (cords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', cords.latitude, cords.longitude));
    })

    socket.on('disconnect', () => {
        console.log('Disconnected from server...');
    });
});

