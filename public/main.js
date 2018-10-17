'use strict';

const giphyKey = '';

var socket = io();
socket.on('addBuddy', addBuddy);
socket.on('addBuddyGif', addBuddyGif);

function addBuddy(buddyData) {
    const buddyName = buddyData.name;
    const buddyHtml = '<article><img src="" id="gif-' + buddyName + '" /><div class="text"><h3>' + buddyName + '</h3></div></article>';
    const img = document.getElementById('buddy-board');
    img.insertAdjacentHTML('beforeend', buddyHtml);

    if (buddyData.gifUrl) {
        img.setAttribute('src', buddyData.gifUrl);
    }
}

function addBuddyGif(buddyData) {
    const buddyName = buddyData.name;
    const gifUrl = buddyData.gifUrl;

    if (document.getElementById('gif-' + buddyName)) {
        document.getElementById('gif-' + buddyName).setAttribute('src', gifUrl);
    } else {
        addBuddy(buddyData);
    }
}

function addMe() {
    const name = document.getElementById('buddy-name').value;
    const meHtml = '<article><img src="" id="gif-' + name + '" /><div class="text"><h3>' + name + '</h3><button onclick="addMeGif(\'' + name + '\');">New Gif</button></div></article>';
    document.getElementById('buddy-board').insertAdjacentHTML('afterbegin', meHtml);
    let me = {
        name: name
    };
    socket.emit('addBuddy', me);
    addMeGif(name);
}

function addMeGif(name) {
    getRandoGif().then((jsonData) => {
        const gifUrl = parseGifUrl(jsonData);
        const meGif = {
            name: name,
            gifUrl: gifUrl
        };
        document.getElementById('gif-' + name).setAttribute('src', gifUrl);
        socket.emit('addBuddyGif', meGif);
    });
}

function getRandoGif() {
    const gifUrl = 'https://api.giphy.com/v1/gifs/random?api_key=' + giphyKey + '&tag=&rating=R';
    const req = new Request(gifUrl);
    return fetch(req)
            .then((response) => {
                return response.json();
            })
}

function parseGifUrl(responseData) {
    return responseData.data.images.fixed_width.url;
}