const socket = io();

//Registering EventListener 'connect' for connection to server.
socket.on('connect', function () {
    console.log('Connected to server...');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function (msg) {
    console.log('New Msg arrived: ', msg);
});

// socket.on('welcome', function (msg) {
//     console.log('welcome: ', msg);
// });