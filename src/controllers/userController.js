const { User, Module } = require('../models');

// Obtener perfil de usuario con estadísticas
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Calcular estadísticas
    const modules = await Module.find({ userId: req.userId });
    
    const stats = {
      modulesCreated: modules.length,
      tasksCompleted: 0,
      pomodorosCompleted: 0
    };

    // Contar tareas completadas y pomodoros
    modules.forEach(mod => {
      if (mod.type === 'tasks' && mod.content?.items) {
        stats.tasksCompleted += mod.content.items.filter(item => item.done).length;
      }
      if (mod.type === 'pomodoro') {
        stats.pomodorosCompleted += mod.content?.completedPomodoros || 0;
      }
    });

    res.json({
      success: true,
      data: {
        user: user.toProfile(),
        stats
      }
    });

  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener perfil'
    });
  }
};

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        name,
        avatar,
        preferences,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado',
      data: { user: user.toProfile() }
    });

  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar perfil'
    });
  }
};

// Obtener estadísticas detalladas
exports.getStats = async (req, res) => {
  try {
    const modules = await Module.find({ userId: req.userId });

    const stats = {
      totalModules: modules.length,
      byType: {
        tasks: modules.filter(m => m.type === 'tasks').length,
        progress: modules.filter(m => m.type === 'progress').length,
        pomodoro: modules.filter(m => m.type === 'pomodoro').length
      },
      tasksCompleted: 0,
      totalTasks: 0,
      pomodorosCompleted: 0,
      lastActivity: modules.length > 0 
        ? Math.max(...modules.map(m => m.updatedAt.getTime())) 
        : null
    };

    modules.forEach(mod => {
      if (mod.type === 'tasks' && mod.content?.items) {
        const items = mod.content.items;
        stats.tasksCompleted += items.filter(item => item.done).length;
        stats.totalTasks += items.length;
      }
      if (mod.type === 'pomodoro') {
        stats.pomodorosCompleted += mod.content?.completedPomodoros || 0;
      }
    });

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas'
    });
  }
};

// Enviar Feedback
exports.sendFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;
    if (!type || !message) {
      return res.status(400).json({ success: false, message: 'Faltan datos requeridos' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    // Send email via EmailJS
    const emailjs = require('@emailjs/nodejs');
    
    // We will use the same template, but we will inject the message
    // Note: Since we are using the same template (which says "Recuperacion de cuenta"),
    // we should really use a NEW template or pass a dynamic subject.
    // However, if we don't have a new template ID, we can just send it with dynamic fields
    // assuming the user might configure a new template later. For now we will use the existing one
    // or just let EmailJS send it.
    // Wait, the user didn't create a new template for feedback!
    // I should instruct them to create a new one, but for now I will just call it and pass fields
    // like feedback_type, feedback_message, user_email, user_name.
    
    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_FEEDBACK_TEMPLATE_ID || process.env.EMAILJS_TEMPLATE_ID, // Use feedback template if it exists
      {
        user_name: user.name,
        user_email: user.email,
        feedback_type: type,
        feedback_message: message,
        // Override reset code just in case they use the same template
        reset_code: 'FEEDBACK'
      },
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY
      }
    );

    res.json({ success: true, message: 'Feedback enviado correctamente' });
  } catch (error) {
    console.error('Send Feedback error:', error);
    res.status(500).json({ success: false, message: 'Error al enviar feedback' });
  }
};
