// frontend/script.js
let token = '';
const API_BASE = 'https://fileshare-o1fc.onrender.com'; 


async function register() {
    console.log("Register button clicked");

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    document.getElementById('auth-status').textContent = data.message || 'Registered!';
    console.log("Register response:", data);
}

async function login() {
    console.log("Login button clicked");

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (data.token) {
        token = data.token;
        document.getElementById('auth-status').textContent = 'Logged in!';
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('upload-section').style.display = 'block';
        loadFiles();
    } else {
        document.getElementById('auth-status').textContent = data.message || 'Login failed';
    }
}

document.getElementById('uploadForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await fetch(`${API_BASE}/api/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': token
            },
            body: formData
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');

        document.getElementById('result').textContent = `Uploaded: ${data.fileName}`;
        loadFiles();
    } catch (err) {
        document.getElementById('result').textContent = 'Upload failed: ' + err.message;
        console.error("Upload failed:", err);
    }
});

async function loadFiles() {
    const res = await fetch(`${API_BASE}/api/files`);
    const files = await res.json();

    const list = document.getElementById('fileList');
    list.innerHTML = '';

    files.forEach(file => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="${file.path}" target="_blank">${file.originalName}</a>
            <button onclick="deleteFile('${file._id}')">Delete</button>
        `;
        list.appendChild(li);
    });
}

async function deleteFile(id) {
    const confirmed = confirm("Are you sure you want to delete this file?");
    if (!confirmed) return;

    const res = await fetch(`${API_BASE}/api/files/${id}`, {
        method: 'DELETE'
    });

    const data = await res.json();
    alert(data.message);
    loadFiles();
}
