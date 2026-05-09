const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const moduleRoutes = require('./routes/modules');
const userRoutes = require('./routes/user');
const musicRoutes = require('./routes/music');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS - Permitir múltiples orígenes para desarrollo
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

// Agregar FRONTEND_URL de .env si existe
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    // Permitir cualquier localhost o 192.168.x.x (desarrollo local)
    if (origin.includes('localhost') || 
        origin.includes('127.0.0.1') || 
        origin.match(/^http:\/\/192\.168\.\d+\.\d+:\d+$/)) {
      return callback(null, true);
    }
    
    // Verificar contra lista permitida
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Permitir cualquier dominio de Vercel (preview deployments)
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    callback(new Error('CORS not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/user', userRoutes);
app.use('/api/music', musicRoutes);

// Ruta de verificación de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'workdesk-api'
  });
});

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

module.exports = app;
