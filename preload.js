const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    sendLogin: (username, password) => ipcRenderer.invoke('login', username, password),
});