// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const { ipcRenderer, remote, shell } = require('electron');
const { dialog } = remote;
const setApplicationMenu = require('./menu');

const form = document.querySelector('form');

const inputs = {
    source: form.querySelector('input[name="source"]'),
    ffmpegOptions: form.querySelector('input[name="ffmpegOptions"]'),
    destination: form.querySelector('input[name="destination"]'),
};

const buttons = {
    source: document.getElementById('chooseSource'),
    destination: document.getElementById('chooseDestination'),
    submit: form.querySelector('button[type="submit"]'),
};

const ffmpegOptionPresets = document.getElementById('ffmpegOptionPresets').children;

ipcRenderer.on('did-finish-load', () => {
    setApplicationMenu();
});

ipcRenderer.on('log', (event, logText) => {
    console.log(logText);
});

ipcRenderer.on('no-file-selected', (event, error) => {
    alert('Please select a "Source Path" and a "Video Destination" path!');
});

ipcRenderer.on('processing-did-start', (event, fname) => {
    document.getElementById('messagebox').textContent='Conversion started, please wait... '+fname;
    document.getElementById('submitbtn').textContent='Converting...';
    document.getElementById('submitbtn').disabled=true;
});

ipcRenderer.on('processing-did-succeed', (event, fname) => {
    document.getElementById('messagebox').textContent='Conversion Successful! '+fname;
    document.getElementById('submitbtn').textContent='Convert';
    document.getElementById('submitbtn').disabled=false;
});

ipcRenderer.on('processing-did-fail', (event, error) => {
    alert('Conversion Failed! :\'(');
    document.getElementById('messagebox').textContent="ERROR: "+JSON.stringify(error);
    document.getElementById('submitbtn').textContent='Convert';
    document.getElementById('submitbtn').disabled=false;
});

buttons.source.addEventListener('click', () => {
    dialog.showOpenDialog(function (fileNames) {
        if (fileNames === undefined) return;
        inputs.source.value = fileNames[0];
    });
});

buttons.destination.addEventListener('click', () => {
    const directory = dialog.showOpenDialog({
        properties: [
            'openDirectory',
            'createDirectory',
        ],
    });
    if (directory) {
        inputs.destination.value = directory;
    }
});

// FFMPEG OPTION PRESET BUTTONS
for(var i = 0; i < ffmpegOptionPresets.length; i++) {
    ffmpegOptionPresets[i].addEventListener('click', function(){
        inputs.ffmpegOptions.value = this.value;
    });
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    ipcRenderer.send('did-submit-form', {
        source: inputs.source.value,
        ffmpegOptions: inputs.ffmpegOptions.value,
        destination: inputs.destination.value,
    });
});
