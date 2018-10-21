const socket = io();

function scrollToBottom() {
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

//Registering EventListener 'connect' for connection to server.
socket.on('connect', function () {
    console.log('Connected to server...');

    const params = jQuery.deparam(window.location.search);

    socket.emit('join', params, function (err) {
        if (err) {
            window.location.href = '/';
            alert(err);
        } else {
            console.log('No error.');
        }
    });
});

socket.on('updateUserList', function (users) {
    console.log('User List: ', users)
    var ol = jQuery('<ol></ol>');

    users.forEach(function (user) {
        ol.append(jQuery('<li class="bg-light m-4 font-weight-bold rounded"></li>').text(user));
    });

    jQuery('#users').html(ol);
});

socket.on('disconnect', function () {
    console.log('Disconnected from server');
});

socket.on('newMessage', function (msg) {
    console.log('New Msg arrived: ', msg);

    const formattedTime = moment(msg.createdAt).format('h:mm a');

    // var li = jQuery('<li></li>');
    // li.text(`${msg.from} ${formattedTime}: ${msg.text}`);
    // li.text(`${msg.text}`);
    const p1 = jQuery('<p class="font-weight-bold "></p>');
    p1.text(`${msg.from} ${formattedTime} `);

    const p2 = jQuery('<p class="lead"></p>');
    p2.text(`${msg.text} `);

    // li.append(h);
    // li.append(p);
    p1.append(p2)
    // jQuery('#messages').append(li);
    jQuery('#messages').append(p1);
    // jQuery('#messages').append(p2);

    scrollToBottom();
});

jQuery('#message-form').on('submit', function (e) {
    e.preventDefault();
    // console.log('e: ', e);
    socket.emit('createMessage', {
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

    var p1 = jQuery('<p class="font-weight-bold" ></p>');
    var p2 = jQuery('<p></p>');

    var a = jQuery('<a target="_blank">My Current Location</a>');

    p1.text(`${msg.from} ${formattedTime}: `);
    a.attr('href', msg.url);

    p2.append(a);

    jQuery('#messages').append(p1);
    jQuery('#messages').append(p2);
    scrollToBottom();
});


// socket.on('welcome', function (msg) {
//     console.log('welcome: ', msg);
// });