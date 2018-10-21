const express = require('express');
const socketIO = require('socket.io');
const {
    generateMessage,
    generateLocationMessage
} = require('./utils/msg');
const {
    isRealString
} = require('./utils/validation');

const {Users} = require('./utils/users');
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
const users = new Users(); 

//Registering EventListener for 'connection' event.
io.on('connection', (socket) => {
    console.log('New user connected...');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room are required...');
        }

        socket.join(params.room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, params.room);
        //socket.leave('room_name');
        //io.emit -> io.to('room_name).emit();
        //socket.broadcast.emit -> socket.broadcast.to('room_name).emit();
        //socket.emit
        io.to(params.room).emit('updateUserList', users.getUserList(params.room));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} Joins.`));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to chat...'));
        callback(); //No error
    });

    socket.on('createMessage', (msg, callback) => {
        console.log('Create message: ', msg);
        const user = users.getUser(socket.id);

        if(user && isRealString(msg.text)){
            io.to(user.room).emit('newMessage', generateMessage(user.name, msg.text));
        }

        callback();
    });

    socket.on('createLocationMessage', (cords) => {
        const user = users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, cords.latitude, cords.longitude));
        }
    })

    socket.on('disconnect', () => {
        console.log('Disconnected from server...');
        const user = users.removeUser(socket.id);

        io.to(user.room).emit('updateUserList', users.getUserList(user.room));
        io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
    });
});