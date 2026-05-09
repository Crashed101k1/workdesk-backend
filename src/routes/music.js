const express = require('express');
const router = express.Router();
const youtubesearchapi = require('youtube-search-api');

// Ruta para buscar música usando youtube-search-api (más robusto)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Falta el parámetro de búsqueda' });

  try {
    const data = await youtubesearchapi.GetListByKeyword(q, false, 8, [{type: "video"}]);
    
    if (data && data.items) {
      const formatted = data.items.map(v => ({
        id: v.id,
        title: v.title,
        author: v.channelTitle || (v.suggestion ? 'YouTube' : 'Artista'),
        thumbnail: v.thumbnail?.thumbnails?.[0]?.url || ''
      }));
      return res.json(formatted);
    }
    
    res.json([]);
  } catch (error) {
    console.error('Error en búsqueda de música (youtube-search-api):', error.message);
    // Fallback: si falla el API, mandamos lista vacía para que el frontend use el embed directo
    res.json([]);
  }
});

module.exports = router;
