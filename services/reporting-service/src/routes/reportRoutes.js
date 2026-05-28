const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');

router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/dashboard', controller.getDashboard.bind(controller));
router.get('/:id', controller.getById.bind(controller));

module.exports = router;
