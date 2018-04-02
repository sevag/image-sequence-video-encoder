const { app, BrowserWindow, ipcMain } = require('electron');

const exec = require('child_process').exec;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({ width: 720, height: 720, titleBarStyle: 'hidden' });
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('did-finish-load');
    });
}

function handleSubmission() {
    ipcMain.on('did-submit-form', (event, argument) => {
        const { source, ffmpegOptions, destination } = argument;

        if( source != "" && ffmpegOptions != "" && destination != "" ){

            // CALCULATE FILENAME AND DESTINATION
            var name = source.replace(/^.*[\\\/]/, ''); // get filename from full path
            var name_fixed = name.substring(0, source.indexOf('000'));
            
            var source_fixed = source.substring(0, source.indexOf('000')); // get filename without image sequence numbers

            // get length of image sequence numbers from filename
            var seq_num = name.substring(name.indexOf('000'), name.indexOf('.png'));
            var seq_num_length = seq_num.length;

            var destination_fixed = destination.replace(/\\\\/g, '\\'); // replace double backslash with single backslash
                destination_fixed = destination.replace(/\\/g,"/"); // replace backslash with forward slash

            var timestmp = Math.floor(new Date() / 1000);
            var outputFilename = name_fixed+'_'+timestmp+'.mov';

            console.log(name_fixed);
            console.log(seq_num);
            console.log(seq_num_length);

            event.sender.send('log','CONVERSION STARTED!');
            event.sender.send('log','-------------------');
            event.sender.send('log','Source: '+source);
            event.sender.send('log','FFMPEG Options: '+ffmpegOptions);
            event.sender.send('log','Destination: '+destination);
            event.sender.send('log','File Name: '+outputFilename);

            event.sender.send('processing-did-start', outputFilename);

            // CONVERT VIDEO
            exec('ffmpeg.exe -y -f image2 -i "'+source_fixed+'%0'+seq_num_length+'d.png" '+ffmpegOptions+' "'+destination_fixed+'/'+outputFilename+'"' , function(err, stdout, stderr) {
                if(err){ //process error
                    event.sender.send('log',stderr);
                    event.sender.send('processing-did-fail', stderr);
                }else{
                    event.sender.send('log','-------------------');
                    event.sender.send('log','CONVERSION SUCCESSFULL!');
                    event.sender.send('processing-did-succeed', outputFilename);
                }
            });

        }else{

            event.sender.send('no-file-selected');
            
        }

    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow();
    handleSubmission();
});

app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});
