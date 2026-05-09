require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

const PORT = process.env.PORT || 3000;

// Conectar a base de datos y luego iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Servidor escuchando en puerto ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch((error) => {
  console.error('❌ Error al iniciar servidor:', error);
  process.exit(1);
});
