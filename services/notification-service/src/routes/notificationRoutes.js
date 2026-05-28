const express = require('express');
const router = express.Router();
const controller = require('../controllers/notificationController');

router.get('/', controller.list.bind(controller));
router.post('/send', controller.send.bind(controller));
router.get('/templates', controller.getTemplates.bind(controller));
router.get('/:id', controller.getById.bind(controller));

module.exports = router;
