const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const amqp = require('amqplib/callback_api');

const newBotBuddyQ = 'addBotBuddy';
const newBotBuddyGifQ = 'addBotBuddyGif';

app.use(express.static(__dirname + '/public'));

function onConnection(socket) {
    socket.on('addBuddy', (data) => {
        socket.broadcast.emit('addBuddy', data);
    });
    socket.on('addBuddyGif', (data) => {
        socket.broadcast.emit('addBuddyGif', data);
    });

    amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue(newBotBuddyQ, {
            durable: false
        });
        ch.assertQueue(newBotBuddyGifQ, {
            durable: false
        });

        ch.consume(newBotBuddyQ, function (msg) {
            console.log(JSON.parse(msg.content));
            socket.broadcast.emit('addBuddy', JSON.parse(msg.content));
        }, {
            noAck: true
        });
        
        ch.consume(newBotBuddyGifQ, function (msg) {
            console.log(JSON.parse(msg.content));
            socket.broadcast.emit('addBuddyGif', JSON.parse(msg.content));
        }, {
            noAck: true
        });
    });
});
}

io.on('connection', onConnection);

http.listen(port, () => console.log('listening on port ' + port));