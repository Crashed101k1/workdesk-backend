const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticate } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Rutas de módulos
router.get('/', moduleController.getAllModules);
router.post('/', moduleController.createModule);
router.get('/:id', moduleController.getModule);
router.put('/:id', moduleController.updateModule);
router.delete('/:id', moduleController.deleteModule);

// Sincronización batch
router.post('/sync', [
  body('modules').isArray().withMessage('Se esperaba un array de módulos')
], moduleController.syncModules);

// Guardar todos los módulos (reemplazo completo)
router.post('/save-all', [
  body('modules').isArray().withMessage('Se esperaba un array de módulos')
], moduleController.saveAllModules);

module.exports = router;
