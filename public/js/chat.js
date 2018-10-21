const socket = io();

//Registering EventListener 'connect' for connection to server.
socket.on('connect', function () {
    console.log('Connected to server...');
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

function scrollToBottom () {
    // Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child')
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
  
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
      messages.scrollTop(scrollHeight);
    }
  }

socket.on('newMessage', function (msg) {
    console.log('New Msg arrived: ', msg);

    const formattedTime = moment(msg.createdAt).format('h:mm a');

    var li = jQuery('<li></li>');
    li.text(`${msg.from} ${formattedTime}: ${msg.text}`);

    jQuery('#messages').append(li);
    scrollToBottom();
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    // console.log('e: ', e);
    socket.emit('createMessage', {
        from: "User",
        text: jQuery("[name=message]").val()
    }, function () {
        jQuery("[name=message]").val('');
    });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }
    locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(position);
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });

    }, function () {
        locationButton.removeAttr('disabled').text('Send Location');
        alert('Unable to fetch location.');
    });
});

socket.on('newLocationMessage', function (msg) {
    const formattedTime = moment(msg.createdAt).format('h:mm a');

    var li = jQuery('<li></li>');
    var a = jQuery('<a target="_blank">My Current Location</a>');

    li.text(`${msg.from} ${formattedTime}: `);
    a.attr('href', msg.url);

    li.append(a);

    jQuery('#messages').append(li);
    scrollToBottom();
});


// socket.on('welcome', function (msg) {
//     console.log('welcome: ', msg);
// });