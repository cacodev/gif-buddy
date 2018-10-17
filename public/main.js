'use strict';

const giphyKey = '';

var socket = io();
socket.on('addBuddy', addBuddy);
socket.on('addBuddyGif', addBuddyGif);

function addBuddy(buddyData) {
    const buddyName = buddyData.name;
    const buddyHtml = '<div><img src="" id="gif-' + buddyName + '" /><br /><p>' + buddyName + '</p></div>';
    const img = document.getElementById('buddies');
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
    const meHtml = '<div><img src="" id="gif-' + name + '" /><br /><p>' + name + '</p><button onclick="addMeGif(\'' + name + '\');">New Gif</button></div>';
    document.getElementById('buddies').insertAdjacentHTML('afterbegin', meHtml);
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
    return responseData.data.images.fixed_width_small.url;
}