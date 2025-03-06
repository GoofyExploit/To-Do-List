const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

let tasks = [
    { id: 1, task: "Learn Node.js", date: "03/05/25, 09:00 AM", completed: false },
    { id: 2, task: "Build a To-Do app", date: "03/05/25, 09:15 AM", completed: false }
];

app.get('/todos', (req, res) => {
    res.json(tasks);
});

app.get('/todos/:id', (req, res) => {
    const { id } = req.params;
    const task = tasks.find(t => t.id == id);
    
    if (!task) {
        return res.status(404).json({ message: 'Task not found' });
    }

    res.json(task);
});

app.post('/todos', (req, res) => {
    const { task, date, completed } = req.body;

    if (!task || !date) {
        return res.status(400).json({ message: 'Task and date are required' });
    }

    const taskId = tasks.length > 0 ? tasks[tasks.length - 1].id + 1 : 1;
    const newTask = {
        id: taskId,
        task,
        date,
        completed: completed || false
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { task, date, completed } = req.body;

    const taskIndex = tasks.findIndex(t => t.id == id);
    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    tasks[taskIndex] = {
        id: tasks[taskIndex].id,
        task: task || tasks[taskIndex].task,
        date: date || tasks[taskIndex].date,
        completed: completed !== undefined ? completed : tasks[taskIndex].completed
    };

    res.json(tasks[taskIndex]);
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id == id);

    if (taskIndex === -1) {
        return res.status(404).json({ message: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    res.status(204).end();  
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
