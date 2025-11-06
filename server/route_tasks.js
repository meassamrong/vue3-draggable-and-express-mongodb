const express = require('express');
const router = express.Router();
const Task = require('./model'); // Import our model

// --- Standard CRUD Operations ---

// CREATE (POST /api/tasks)
router.post('/', async (req, res) => {
  try {
    const task = new Task({
      content: req.body.content,
      // Use timestamp for initial order (fractional indexing)
      order: Date.now(), 
    });
    await task.save();
    return res.status(201).send(task);
  } catch (error) {
    res.status(400).send({ message: 'Error creating task', error });
  }
});

// READ (GET /api/tasks)
router.get('/', async (req, res) => {
  try {
    // This sort is the magic for fractional indexing
    const tasks = await Task.find().sort({ order: 'asc' }); 
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

// UPDATE (PATCH /api/tasks/:id)
// This single route handles all updates: content changes OR order changes.
router.patch('/:id', async (req, res) => {
  try {
    // Only update fields that are sent in the body
    const updates = {};
    if (req.body.content) {
      updates.content = req.body.content;
    }
    if (req.body.order) {
      updates.order = req.body.order;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates }, // Use $set to update specific fields
      { new: true }
    );
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

// DELETE (DELETE /api/tasks/:id)
router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).send();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
