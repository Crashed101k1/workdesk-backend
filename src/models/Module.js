const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El userId es requerido'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'El tipo es requerido'],
    enum: ['tasks', 'progress', 'pomodoro', 'notes', 'music'],
    lowercase: true
  },
  position: {
    x: { type: Number, default: 40 },
    y: { type: Number, default: 40 },
    width: { type: Number, default: 300 },
    height: { type: Number, default: 180 }
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  color: {
    type: String,
    default: '#00FFFF'
  },
  pinned: {
    type: Boolean,
    default: false
  },
  hidden: {
    type: Boolean,
    default: false
  },
  timeOnDesk: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index compuesto para queries frecuentes
moduleSchema.index({ userId: 1, type: 1 });
moduleSchema.index({ userId: 1, updatedAt: -1 });

// Middleware para sanitizar contenido antes de guardar
moduleSchema.pre('save', function(next) {
  // Asegurar que content sea un objeto
  if (this.content && typeof this.content !== 'object') {
    this.content = {};
  }
  next();
});

// Método estático para obtener todos los módulos de un usuario
moduleSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).sort({ updatedAt: -1 });
};

// Método estático para sincronizar múltiples módulos
moduleSchema.statics.syncModules = async function(userId, modules) {
  const results = {
    created: 0,
    updated: 0,
    deleted: 0,
    errors: []
  };

  for (const mod of modules) {
    try {
      const isValidObjectId = mod.id && mongoose.Types.ObjectId.isValid(mod.id) && String(new mongoose.Types.ObjectId(mod.id)) === mod.id;

      if (mod._deleted && isValidObjectId) {
        // Eliminar módulo
        await this.findOneAndDelete({ _id: mod.id, userId });
        results.deleted++;
      } else if (isValidObjectId) {
        // Actualizar módulo existente
        await this.findOneAndUpdate(
          { _id: mod.id, userId },
          {
            type: mod.type,
            position: mod.position,
            content: mod.content,
            color: mod.color,
            pinned: mod.pinned,
            hidden: mod.hidden,
            timeOnDesk: mod.timeOnDesk || 0,
            updatedAt: new Date()
          },
          { new: true, upsert: false }
        );
        results.updated++;
      } else {
        // Crear nuevo módulo (ya que el ID viene del frontend como timestamp)
        await this.create({
          userId,
          type: mod.type,
          position: mod.position,
          content: mod.content,
          color: mod.color,
          pinned: mod.pinned,
          hidden: mod.hidden,
          timeOnDesk: mod.timeOnDesk || 0
        });
        results.created++;
      }
    } catch (error) {
      results.errors.push({ module: mod, error: error.message });
    }
  }

  return results;
};

module.exports = mongoose.model('Module', moduleSchema);
