const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de usuario
router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('name').optional().trim().notEmpty().withMessage('El nombre no puede estar vacío'),
  body('avatar').optional().trim().notEmpty().withMessage('El avatar no puede estar vacío')
    .custom((value) => {
      // Accept HTTP/HTTPS URLs or base64 data URIs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return true;
      }
      if (value.startsWith('data:image/')) {
        return true;
      }
      throw new Error('El avatar debe ser una URL válida o una imagen base64');
    })
], userController.updateProfile);
router.get('/stats', userController.getStats);
router.post('/feedback', userController.sendFeedback);

module.exports = router;
