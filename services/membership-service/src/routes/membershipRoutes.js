const express = require('express');
const router = express.Router();
const controller = require('../controllers/membershipController');

router.get('/', controller.list.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.remove.bind(controller));

module.exports = router;
