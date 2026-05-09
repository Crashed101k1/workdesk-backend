# WorkDesk — Backend (Node.js + Express + MongoDB)

Backend completo para WorkDesk con autenticación JWT, base de datos MongoDB y API REST.

## 🚀 Tecnologías

- **Node.js** 18+ - Runtime
- **Express.js** 4.x - Framework web
- **MongoDB** 6+ con **Mongoose** 8.x - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **express-validator** - Validaciones
- **CORS + Helmet** - Seguridad

## 📋 Requisitos

- Node.js 18 o superior
- Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas) (gratis)

## 🔧 Setup Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copiar `.env.example` a `.env` y completar:

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workdesk?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
```

### 3. Obtener URI de MongoDB Atlas
1. Crea cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Crea un cluster (M0 - gratis)
3. Crea un usuario de base de datos
4. Agrega IP de acceso (0.0.0.0/0 para desarrollo)
5. Copia el Connection String (Choose "Drivers" → "Node.js")

### 4. Iniciar servidor
```bash
# Desarrollo con hot-reload
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Crear cuenta | ❌ |
| POST | `/login` | Iniciar sesión | ❌ |
| GET | `/me` | Obtener usuario actual | ✅ |

### Módulos (`/api/modules`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/` | Obtener todos los módulos | ✅ |
| POST | `/` | Crear módulo | ✅ |
| GET | `/:id` | Obtener un módulo | ✅ |
| PUT | `/:id` | Actualizar módulo | ✅ |
| DELETE | `/:id` | Eliminar módulo | ✅ |
| POST | `/sync` | Sincronizar múltiples | ✅ |

### Usuario (`/api/user`)
| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | `/profile` | Perfil con estadísticas | ✅ |
| PUT | `/profile` | Actualizar perfil | ✅ |
| GET | `/stats` | Solo estadísticas | ✅ |

### Sistema
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Verificación de salud |

## 📦 Estructura de Archivos

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Conexión MongoDB
│   │   └── auth.js          # Config JWT
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── moduleController.js
│   │   └── userController.js
│   ├── middleware/
│   │   ├── authMiddleware.js  # Verificar JWT
│   │   └── errorHandler.js  # Manejo errores
│   ├── models/
│   │   ├── User.js
│   │   └── Module.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── modules.js
│   │   └── user.js
│   ├── app.js               # Config Express
│   └── index.js             # Entry point
├── .env.example
├── .gitignore
└── package.json
```

## 🔐 Autenticación

El backend usa JWT (JSON Web Tokens). Incluye el token en el header:

```http
Authorization: Bearer <tu-jwt-token>
```

## 🚀 Despliegue en Railway (Recomendado)

1. Crea cuenta en [Railway](https://railway.app/)
2. Conecta tu repositorio de GitHub
3. Agrega variables de entorno en Railway Dashboard
4. Railway detectará automáticamente Node.js y ejecutará `npm start`
5. Obtén la URL pública del backend

## 📝 Notas Importantes

- En producción, usa un `JWT_SECRET` de al menos 32 caracteres aleatorios
- El servidor expira tokens JWT después de 24 horas
- Las contraseñas se hashean con bcrypt (12 rounds)
- MongoDB Atlas tiene límite gratuito de 512MB (suficiente para desarrollo)

## 🧪 Testing

Usa Postman, Thunder Client o curl:

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Obtener módulos (requiere token)
curl http://localhost:3000/api/modules \
  -H "Authorization: Bearer <TOKEN>"
```
