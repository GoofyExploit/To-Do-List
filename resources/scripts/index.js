document.addEventListener('DOMContentLoaded', loadTasks);

const API_URL = 'http://localhost:5000/todos';

function loadTasks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tasks => {
            tasks.forEach(taskObj => {
                addTaskElement(taskObj);
            });
        })
        .catch(error => console.error('Error loading tasks:', error));
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const task = taskInput.value.trim();

    if (!task) {
        alert("Task cannot be empty!");
        return;
    }

    if (/[^a-zA-Z0-9\s]/.test(task)) {
        alert("Task cannot contain special characters!");
        return;
    }

    if (task.length > 100) {
        alert("Task cannot exceed 100 characters!");
        return;
    }

    const now = new Date();
    const options = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    const dateString = now.toLocaleString('en-US', options);

    const taskObj = {
        task: task,
        date: dateString,
        completed: false
    };

    fetch(API_URL)
        .then(response => response.json())
        .then(tasks => {
            if (tasks.some(taskObj => taskObj.task === task && taskObj.date === dateString)) {
                alert("This task already exists!");
                return;
            }

            fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskObj)
            })
                .then(response => response.json())
                .then(newTask => {
                    addTaskElement(newTask);
                    taskInput.value = '';
                })
                .catch(error => console.error('Error adding task:', error));
        })
        .catch(error => console.error('Error checking for duplicates:', error));
}

function addTaskElement(taskObj) {
    const taskList = document.getElementById('taskList');
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task-container');
    taskDiv.dataset.id = taskObj.id;
    if (taskObj.completed) {
        taskDiv.classList.add('completed');
    }

    const taskContent = document.createElement('div');
    taskContent.classList.add('task-content');

    const taskText = document.createElement('span');
    taskText.classList.add('task-text');
    taskText.textContent = taskObj.task;

    const taskActions = document.createElement('div');
    taskActions.classList.add('task-actions');

    const taskDate = document.createElement('span');
    taskDate.classList.add('task-date');
    taskDate.textContent = ` (${taskObj.date})`;

    if (taskObj.completed) {
        const checkIcon = document.createElement('i');
        checkIcon.classList.add('fas', 'fa-check-circle');
        checkIcon.style.color = 'green';
        checkIcon.style.marginLeft = '5px';
        taskDate.appendChild(checkIcon);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('action-btn', 'delete-btn');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        removeTask(taskDiv, taskObj.id);
    });

    taskActions.appendChild(taskDate);
    taskActions.appendChild(deleteBtn);

    taskContent.appendChild(taskText);
    taskContent.appendChild(taskActions);

    taskDiv.appendChild(taskContent);

    taskDiv.addEventListener('click', () => markAsCompleted(taskDiv, taskObj.id));

    taskList.appendChild(taskDiv);
}

function markAsCompleted(taskDiv, taskId) {
    fetch(`${API_URL}/${taskId}`)
        .then(response => response.json())
        .then(task => {
            task.completed = !task.completed;

            fetch(`${API_URL}/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            })
                .then(response => response.json())
                .then(updatedTask => {
                    const taskDate = taskDiv.querySelector('.task-date');

                    if (updatedTask.completed) {
                        taskDiv.classList.add('completed');
                        const checkIcon = document.createElement('i');
                        checkIcon.classList.add('fas', 'fa-check-circle');
                        checkIcon.style.color = 'green';
                        checkIcon.style.marginLeft = '5px';
                        taskDate.appendChild(checkIcon);
                    } else {
                        taskDiv.classList.remove('completed');
                        const checkIcon = taskDate.querySelector('.fa-check-circle');
                        if (checkIcon) {
                            checkIcon.remove();
                        }
                    }
                })
                .catch(error => console.error('Error updating task:', error));
        })
        .catch(error => console.error('Error fetching task:', error));
}

function removeTask(taskDiv, taskId) {
    taskDiv.classList.add('fade-out');
    setTimeout(() => {
        fetch(`${API_URL}/${taskId}`, {
            method: 'DELETE'
        })
            .then(() => {
                taskDiv.remove();
            })
            .catch(error => console.error('Error deleting task:', error));
    }, 500);
}

document.getElementById('taskInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        addTask();
    }
});
