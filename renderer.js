document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await window.electron.sendLogin(username, password);
    if (response !== 'Login exitoso') {
        document.getElementById('message').innerText = response;
    }
});