const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sql = require('mssql');

let mainWindow;
let dashboardWindow; // Ventana del dashboard

const config = {
    user: 'sa',
    password: 'Inei0101$',
    server: 'localhost', // Puede ser 'localhost' o una IP
    database: 'ElectronJS',
    options: {
        encrypt: true, // Si usas Azure
        trustServerCertificate: true, // Si usas un certificado autofirmado
    },
};

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Conectado a SQL Server');
    } catch (err) {
        console.error('Error al conectar a SQL Server:', err);
    }
}

ipcMain.handle('login', async (event, username, password) => {
    try {
        const request = new sql.Request();
        const query = `SELECT * FROM Users WHERE username = '${username}' AND password = '${password}'`;
        const result = await request.query(query);

        if (result.recordset.length > 0) {
            // Cerrar la ventana de login
            if (mainWindow) {
                mainWindow.close();
            }

            // Abrir la ventana del dashboard
            dashboardWindow = new BrowserWindow({
                width: 800,
                height: 600,
                webPreferences: {
                    contextIsolation: true,
                    enableRemoteModule: false,
                },
            });

            dashboardWindow.loadFile('dashboard.html');

            dashboardWindow.on('closed', () => {
                dashboardWindow = null;
            });

            return 'Login exitoso';
        } else {
            return 'Usuario o contraseña incorrectos';
        }
    } catch (err) {
        console.error('Error al ejecutar la consulta:', err);
        return 'Error en el servidor';
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    connectToDatabase();
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

app.on('quit', () => {
    sql.close();
});