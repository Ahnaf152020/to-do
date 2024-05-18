document.addEventListener('DOMContentLoaded', loadTasks);

function addTask() {
    const taskInput = document.getElementById('task');
    const taskValue = taskInput.value.trim();

    if (taskValue !== "") {
        const taskList = document.getElementById('taskList');
        const li = createTaskElement(taskValue, false);
        taskList.appendChild(li);
        taskInput.value = "";
        updateTaskNumbers();
        saveTasks();
    } else {
        alert("Please enter a task.");
    }
}

function createTaskElement(text, completed) {
    const li = document.createElement('li');
    li.setAttribute('draggable', true);
    li.innerHTML = `<span class="task-number"></span>
                    <input type="checkbox" ${completed ? 'checked' : ''} onclick="toggleTask(this)">
                    <span contenteditable="true" oninput="updateTask(this)">${text}</span>
                    <button class="delete" onclick="deleteTask(this)">Delete</button>`;
    if (completed) {
        li.style.textDecoration = 'line-through';
    }
    addDragAndDropListeners(li); 
    return li;
}

function deleteTask(btn) {
    const li = btn.parentNode;
    li.parentNode.removeChild(li);
    updateTaskNumbers();
    saveTasks();
}

function clearAll() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = "";
    updateTaskNumbers();
    saveTasks();
}

function toggleTask(checkbox) {
    const li = checkbox.parentNode;
    if (checkbox.checked) {
        li.style.textDecoration = 'line-through';
        alert("Task completed!");
    } else {
        li.style.textDecoration = 'none';
    }
    saveTasks();
}

function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#taskList li').forEach(li => {
        tasks.push({
            text: li.querySelector('span[contenteditable]').innerText,
            completed: li.querySelector('input[type="checkbox"]').checked
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks) {
        const taskList = document.getElementById('taskList');
        tasks.forEach(task => {
            const li = createTaskElement(task.text, task.completed);
            taskList.appendChild(li);
        });
        updateTaskNumbers();
    }
}

function updateTask(span) {
    saveTasks();
}

let draggedItem = null;

function addDragAndDropListeners(item) {
    item.addEventListener('dragstart', function(e) {
        draggedItem = item;
        setTimeout(() => item.classList.add('dragging'), 0);
    });

    item.addEventListener('dragend', function() {
        item.classList.remove('dragging');
        draggedItem = null;
        updateTaskNumbers();
        saveTasks();
    });

    item.addEventListener('dragover', function(e) {
        e.preventDefault();
        const afterElement = getDragAfterElement(item.parentElement, e.clientY);
        if (afterElement == null) {
            item.parentElement.appendChild(draggedItem);
        } else {
            item.parentElement.insertBefore(draggedItem, afterElement);
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}


document.querySelectorAll('#taskList li').forEach(addDragAndDropListeners);

function updateTaskNumbers() {
    document.querySelectorAll('#taskList li').forEach((li, index) => {
        li.querySelector('.task-number').innerText = (index + 1) + ". ";
    });
}