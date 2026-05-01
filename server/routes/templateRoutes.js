const express = require('express');
const router = express.Router();
const { getTemplates, getTemplateById } = require('../controllers/templateController');

// GET /api/templates?category=birthday
router.get('/', getTemplates);

// GET /api/templates/:id
router.get('/:id', getTemplateById);

module.exports = router;
