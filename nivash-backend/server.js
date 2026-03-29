const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const http = require('http'); 
const { Server } = require('socket.io');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// --- THE CLOUD CORS FIX ---
app.use(cors({
  origin: "*", // Allows Vercel and Expo to connect
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// --- WRAP EXPRESS IN HTTP SERVER ---
const server = http.createServer(app);

// --- INITIALIZE SOCKET.IO WITH CORS ---
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

// --- SOCKET.IO CONNECTION LOGIC ---
io.on('connection', (socket) => {
  console.log(`⚡ A device connected: ${socket.id}`);

  // When a resident opens the app, they tell the server what Flat they live in
  socket.on('join_flat_room', (flatId) => {
    socket.join(`room_flat_${flatId}`);
    console.log(`🏠 Socket ${socket.id} joined room_flat_${flatId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ A device disconnected: ${socket.id}`);
  });
});

// --- MAKE 'io' AVAILABLE TO OUR API ROUTES ---
app.set('socketio', io); 

// Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const blockRoutes = require('./routes/blockRoutes');
const flatRoutes = require('./routes/flatRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const pollRoutes = require('./routes/pollRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const parcelRoutes = require('./routes/parcelRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blocks', blockRoutes);
app.use('/api/flats', flatRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/users', adminRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/parcels', parcelRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});