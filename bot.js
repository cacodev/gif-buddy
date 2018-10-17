const amqp = require('amqplib/callback_api');

const newBotBuddyQ = 'addBotBuddy';
const newBotBuddyGifQ = 'addBotBuddyGif';
const giphyKey = '';
const gifUrl = 'https://api.giphy.com/v1/gifs/random?api_key=' + giphyKey + '&tag=&rating=R';
var https = require("https");

var args = process.argv.slice(2);

const buddyBotName = args[0] ? args[0] : 'Buddy';

console.log("Bot Name: " + buddyBotName);

function getRandoGif() {
    return new Promise((resolve, reject) => {
        https.get(gifUrl, (res) => {
            var body = '';
            res.on('data', function(d) {
                body += d;
            });
            res.on('end', function() {
                body = JSON.parse(body);
                resolve(body);
            });
        })
    });
}

function parseGifUrl(responseData) {
    return responseData.data.images.fixed_width_small.url;
}

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue(newBotBuddyQ, {
            durable: false
        });
        ch.assertQueue(newBotBuddyGifQ, {
            durable: false
        });

        ch.sendToQueue(newBotBuddyQ, new Buffer(JSON.stringify({ name: buddyBotName })));

        function doGif() {
            console.log("Do Gif");
            getRandoGif().then((jsonData) => {
                const gifUrl = parseGifUrl(jsonData);
                const meGif = {
                    name: buddyBotName,
                    gifUrl: gifUrl
                };
                ch.sendToQueue(newBotBuddyGifQ, new Buffer(JSON.stringify(meGif)))
            }); 
        }

        doGif();

        setInterval(doGif, 10000);
    });
});



