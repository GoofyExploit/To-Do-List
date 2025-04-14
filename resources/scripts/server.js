// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const Task = require('../models/task');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'https://to-do-list-peach-beta.vercel.app',
    credentials: true
  }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


app.get('/todos', (req, res) => {
    Task.find()
        .then(tasks => res.json(tasks))
        .catch(err => res.status(500).json({ message: 'Error fetching tasks', error: err }));
});

app.get('/todos/:id', (req, res) => {
    const { id } = req.params;
    Task.findById(id)
        .then(task => {
            if (!task) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.json(task);
        })
        .catch(err => res.status(500).json({ message: 'Error fetching task', error: err }));
});

app.post('/todos', (req, res) => {
    const { task, date, completed } = req.body;
    const newTask = new Task({
        task,
        date,
        completed: completed || false
    });

    newTask.save()
        .then(savedTask => res.status(201).json(savedTask))
        .catch(err => res.status(500).json({ message: 'Error saving task', error: err }));
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    Task.findByIdAndUpdate(id, { completed }, { new: true })
        .then(updatedTask => {
            if (!updatedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.json(updatedTask);
        })
        .catch(err => res.status(500).json({ message: 'Error updating task', error: err }));
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    Task.findByIdAndDelete(id)
        .then(deletedTask => {
            if (!deletedTask) {
                return res.status(404).json({ message: 'Task not found' });
            }
            res.status(204).end();
        })
        .catch(err => res.status(500).json({ message: 'Error deleting task', error: err }));
});


const User = require('../models/user');
const bcrypt = require('bcryptjs');

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        name,
        email,
        password: hashedPassword
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json({ message: 'Signup successful', user: savedUser });
    } catch (err) {
        res.status(500).json({ message: 'Error signing up user', error: err });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    res.json({ message: 'Login successful' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
