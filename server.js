const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000; // Port yang akan digunakan

// Menyajikan file HTML, CSS, JS yang ada di folder 'public'
app.use(express.static('public'));

// Inisialisasi data skor untuk 16 meja
let scores = [];
for (let i = 1; i <= 16; i++) {
    scores.push({
        tableId: i,
        playerA: { name: `Player A`, score: 0 },
        playerB: { name: `Player B`, score: 0 }
    });
}

// Logika koneksi WebSocket
io.on('connection', (socket) => {
    console.log('Sebuah klien terhubung:', socket.id);

    // Kirim data skor saat ini ke klien yang baru terhubung
    socket.emit('initialScores', scores);

    // Terima pembaruan skor dari salah satu meja
    socket.on('updateScore', (data) => {
        // data = { tableId: 1, player: 'playerA', score: 5 }
        const table = scores.find(s => s.tableId === data.tableId);
        if (table) {
            table[data.player].score = data.score;
            console.log(`Skor diperbarui: Meja ${data.tableId}, ${data.player} menjadi ${data.score}`);

            // Siarkan (broadcast) data skor yang telah diperbarui ke SEMUA klien
            io.emit('scoreUpdated', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Klien terputus:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Untuk perangkat lain di jaringan yang sama, akses melalui IP server.`);
});