const { Module } = require('../models');

// Obtener todos los módulos del usuario
exports.getAllModules = async (req, res) => {
  try {
    const rawModules = await Module.findByUserId(req.userId);

    // Normalize: return flat fields the frontend expects
    const modules = rawModules.map(m => ({
      id:     m._id.toString(),
      type:   m.type,
      x:      m.position?.x      ?? 40,
      y:      m.position?.y      ?? 40,
      width:  m.position?.width  ?? 320,
      height: m.position?.height ?? 200,
      color:  m.color,
      pinned: m.pinned,
      hidden: m.hidden,
      timeOnDesk: m.timeOnDesk || 0,
      content: m.content,
    }))

    res.json({
      success: true,
      count: modules.length,
      data: { modules }
    });

  } catch (error) {
    console.error('GetAllModules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener módulos'
    });
  }
};

// Obtener un módulo específico
exports.getModule = async (req, res) => {
  try {
    const module = await Module.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado'
      });
    }

    res.json({
      success: true,
      data: { module }
    });

  } catch (error) {
    console.error('GetModule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener módulo'
    });
  }
};

// Crear nuevo módulo
exports.createModule = async (req, res) => {
  try {
    const { type, position, content, color, pinned } = req.body;

    const module = await Module.create({
      userId: req.userId,
      type,
      position,
      content,
      color,
      pinned: pinned || false
    });

    res.status(201).json({
      success: true,
      message: 'Módulo creado exitosamente',
      data: { module }
    });

  } catch (error) {
    console.error('CreateModule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear módulo'
    });
  }
};

// Actualizar módulo
exports.updateModule = async (req, res) => {
  try {
    const { position, content, color, pinned } = req.body;

    const module = await Module.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        position,
        content,
        color,
        pinned,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Módulo actualizado',
      data: { module }
    });

  } catch (error) {
    console.error('UpdateModule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar módulo'
    });
  }
};

// Eliminar módulo
exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Módulo eliminado'
    });

  } catch (error) {
    console.error('DeleteModule error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar módulo'
    });
  }
};

// Sincronizar múltiples módulos (batch update)
exports.syncModules = async (req, res) => {
  try {
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        message: 'Se esperaba un array de módulos'
      });
    }

    const results = await Module.syncModules(req.userId, modules);

    // Obtener módulos actualizados
    const updatedModules = await Module.findByUserId(req.userId);

    res.json({
      success: true,
      message: 'Sincronización completada',
      data: {
        results,
        modules: updatedModules
      }
    });

  } catch (error) {
    console.error('SyncModules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al sincronizar módulos'
    });
  }
};

exports.saveAllModules = async (req, res) => {
  try {
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        message: 'Se esperaba un array de módulos'
      });
    }

    // Delete all current modules for this user
    await Module.deleteMany({ userId: req.userId });

    // Re-insert with normalized position object
    const modulesToInsert = modules.map(m => {
      // Support both flat fields (x,y,width,height) and nested position object
      const pos = m.position ?? {}
      return {
        userId:  req.userId,
        type:    m.type,
        position: {
          x:      typeof m.x      === 'number' ? m.x      : (pos.x      ?? 40),
          y:      typeof m.y      === 'number' ? m.y      : (pos.y      ?? 40),
          width:  typeof m.width  === 'number' ? m.width  : (pos.width  ?? 320),
          height: typeof m.height === 'number' ? m.height : (pos.height ?? 200),
        },
        content: m.content ?? {},
        color:   m.color   ?? '#00FFFF',
        pinned:  Boolean(m.pinned),
        hidden:  Boolean(m.hidden),
        timeOnDesk: m.timeOnDesk || 0,
      }
    });

    await Module.insertMany(modulesToInsert);

    // Return normalized flat fields
    const rawUpdated = await Module.findByUserId(req.userId);
    const updatedModules = rawUpdated.map(m => ({
      id:     m._id.toString(),
      type:   m.type,
      x:      m.position?.x      ?? 40,
      y:      m.position?.y      ?? 40,
      width:  m.position?.width  ?? 320,
      height: m.position?.height ?? 200,
      color:  m.color,
      pinned: m.pinned,
      hidden: m.hidden,
      timeOnDesk: m.timeOnDesk || 0,
      content: m.content,
    }))

    res.json({
      success: true,
      message: 'Módulos guardados correctamente',
      count: updatedModules.length,
      data: { modules: updatedModules }
    });

  } catch (error) {
    console.error('SaveAllModules error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al guardar módulos'
    });
  }
};
