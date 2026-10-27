const express = require('express');
const c = require('../controllers/complaintController');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');

const router = express.Router();
router.use(protect); // every complaint route needs login

// Admin routes (declared before "/:id" so they are not mistaken for an id)
router.get('/admin/all', adminOnly, c.getAllComplaints);
router.get('/admin/stats', adminOnly, c.getStats);

// Student routes
router.post('/', studentOnly, c.createComplaint);
router.get('/mine', studentOnly, c.getMyComplaints);

// Single complaint
router.get('/:id', c.getComplaintById);
router.put('/:id', studentOnly, c.updateComplaint);
router.delete('/:id', studentOnly, c.deleteComplaint);
router.put('/:id/status', adminOnly, c.updateStatus);

module.exports = router;
