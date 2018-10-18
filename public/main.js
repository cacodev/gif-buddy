'use strict';

var socket = io();
socket.on('addBuddy', addBuddy);
socket.on('addBuddyGif', addBuddyGif);
var apiKey = '';

function getApiKey() {
    const req = new Request('/api-key');
    return fetch(req)
            .then((response) => {
                return response.json();
            })
}

getApiKey().then((jsonEnv) => {
    apiKey = jsonEnv.apiKey;
})

function addBuddy(buddyData) {
    const buddyName = buddyData.name;
    const buddyId = buddyData.id;
    const buddyHtml = '<article><img src="" id="gif-' + buddyName + '" /><div class="text"><h3>' + buddyName + '</h3></div></article>';
    const img = document.getElementById('buddy-board');
    img.insertAdjacentHTML('beforeend', buddyHtml);

    if (buddyData.gifUrl) {
        img.setAttribute('src', buddyData.gifUrl);
    }
}

function addBuddyGif(buddyData) {
    const buddyId = buddyData.id;
    const buddyName = buddyData.name;
    const gifUrl = buddyData.gifUrl;

    if (document.getElementById('gif-' + buddyId)) {
        document.getElementById('gif-' + buddyId).setAttribute('src', gifUrl);
    } else {
        addBuddy(buddyData);
    }
}

function addMe() {
    const id = uuidv4();
    const name = document.getElementById('buddy-name').value;
    const meHtml = '<article><img src="" id="gif-' + id + '" /><div class="text"><h3>' + name + '</h3><button onclick="addMeGif(\'' + name + '\',\'' + id + '\');">New Gif</button></div></article>';
    document.getElementById('buddy-board').insertAdjacentHTML('afterbegin', meHtml);
    let me = {
        name: name
    };
    socket.emit('addBuddy', me);
    addMeGif(name, id);
}

function addMeGif(name, id) {
    getRandoGif().then((jsonData) => {
        const gifUrl = parseGifUrl(jsonData);
        const meGif = {
            id: id,
            name: name,
            gifUrl: gifUrl
        };
        document.getElementById('gif-' + id).setAttribute('src', gifUrl);
        socket.emit('addBuddyGif', meGif);
    });
}

function getRandoGif() {
    const gifUrl = 'https://api.giphy.com/v1/gifs/random?api_key=' + apiKey + '&tag=&rating=R';
    const req = new Request(gifUrl);
    return fetch(req)
            .then((response) => {
                return response.json();
            })
}

function parseGifUrl(responseData) {
    return responseData.data.images.fixed_width.url;
}