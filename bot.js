const amqp = require('amqplib/callback_api');
const uuidv4 = require('uuid/v4');

const newBotBuddyQ = 'addBotBuddy';
const newBotBuddyGifQ = 'addBotBuddyGif';
const giphyKey = process.env.GIPHY_API_KEY;
const gifUrl = 'https://api.giphy.com/v1/gifs/random?api_key=' + giphyKey + '&tag=&rating=R';
var https = require("https");

var args = process.argv.slice(2);

const buddyBotName = args[0] ? args[0] : 'Buddy';
const buddyBotId = uuidv4();
console.log("Bot Name: " + buddyBotName + " Bot Id: " + buddyBotId);

function getRandoGif() {
    return new Promise((resolve, reject) => {
        https.get(gifUrl, (res) => {
            var body = '';
            res.on('data', function (d) {
                body += d;
            });
            res.on('end', function () {
                console.log(body);
                body = JSON.parse(body);
                resolve(body);
            });
            res.on('error', (err) => {
                console.log(err);
                reject(err);
            })
        })
    });
}

function parseGifUrl(responseData) {
    return responseData.data.images.fixed_width.url;
}

amqp.connect('amqp://localhost', function (err, conn) {
    conn.createChannel(function (err, ch) {
        ch.assertQueue(newBotBuddyQ, {
            durable: false
        });
        ch.assertQueue(newBotBuddyGifQ, {
            durable: false
        });

        ch.sendToQueue(newBotBuddyQ, new Buffer(JSON.stringify({
            id: buddyBotId,
            name: buddyBotName
        })));

        function doGif() {
            console.log("Do Gif");
            getRandoGif().then((jsonData) => {
                if (jsonData && jsonData.data) {
                    const gifUrl = parseGifUrl(jsonData);
                    const meGif = {
                        id: buddyBotId,
                        name: buddyBotName,
                        gifUrl: gifUrl
                    };
                    ch.sendToQueue(newBotBuddyGifQ, new Buffer(JSON.stringify(meGif)));
                }
            });
        }

        doGif();

        setInterval(doGif, 10000);
    });
});
