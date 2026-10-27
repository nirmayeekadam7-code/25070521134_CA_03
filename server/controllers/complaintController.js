const Complaint = require('../models/Complaint');
const { STATUSES } = require('../models/Complaint');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Builds a MongoDB filter from query params (?status=&category=&priority=&search=)
const buildFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.priority) filter.priority = query.priority;
  if (query.search && query.search.trim()) {
    filter.title = { $regex: escapeRegex(query.search.trim()), $options: 'i' };
  }
  return filter;
};

// ---------- STUDENT ----------

// POST /api/complaints
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, category, description, location, priority } = req.body;
    const complaint = await Complaint.create({
      user: req.user._id,
      title, category, description, location, priority,
      statusHistory: [{ status: 'Pending', remark: 'Complaint submitted', changedBy: req.user.name }],
    });
    res.status(201).json(complaint);
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints/mine
exports.getMyComplaints = async (req, res, next) => {
  try {
    const filter = { ...buildFilter(req.query), user: req.user._id };
    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

// PUT /api/complaints/:id  (owner only, only while Pending)
exports.updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
    if (!complaint.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only edit your own complaints.' });
    }
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending complaints can be edited.' });
    }

    const { title, category, description, location, priority } = req.body;
    Object.assign(complaint, { title, category, description, location, priority });
    await complaint.save();
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/complaints/:id  (owner only, only while Pending)
exports.deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });
    if (!complaint.user.equals(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own complaints.' });
    }
    if (complaint.status !== 'Pending') {
      return res.status(400).json({ message: 'Only Pending complaints can be deleted.' });
    }
    await complaint.deleteOne();
    res.json({ message: 'Complaint deleted.' });
  } catch (error) {
    next(error);
  }
};

// ---------- BOTH ROLES ----------

// GET /api/complaints/:id  (student: own only, admin: any)
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'user', 'name email hostel roomNumber'
    );
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    const isOwner = complaint.user && complaint.user._id
      ? complaint.user._id.equals(req.user._id)
      : (complaint.user && complaint.user.equals ? complaint.user.equals(req.user._id) : false);
    if (req.user.role !== 'admin' && !isOwner) {
      return res.status(403).json({ message: 'You cannot view this complaint.' });
    }
    res.json(complaint);
  } catch (error) {
    next(error);
  }
};

// ---------- ADMIN ----------

// GET /api/complaints/admin/all
exports.getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find(buildFilter(req.query))
      .populate('user', 'name email hostel roomNumber')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    next(error);
  }
};

// PUT /api/complaints/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, remark } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    complaint.status = status;
    complaint.adminRemark = remark || '';
    complaint.statusHistory.push({ status, remark: remark || '', changedBy: req.user.name });
    await complaint.save();

    const updated = await Complaint.findById(complaint._id).populate(
      'user', 'name email hostel roomNumber'
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints/admin/stats
exports.getStats = async (req, res, next) => {
  try {
    const [total, pending, inProgress, resolved, byCategory] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'Pending' }),
      Complaint.countDocuments({ status: 'In Progress' }),
      Complaint.countDocuments({ status: 'Resolved' }),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.json({
      total, pending, inProgress, resolved,
      byCategory: byCategory.map((c) => ({ category: c._id, count: c.count })),
    });
  } catch (error) {
    next(error);
  }
};
