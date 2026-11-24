
// Get HTML elements

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const dueDateInput = document.getElementById("dueDate");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const submitButton = document.getElementById("submitButton");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const filterButtons = document.querySelectorAll(".filter-btn");


// Load saved tasks from Local Storage

let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (error) {
    tasks = [];
}

let currentFilter = "all";
let editingId = null;


// Save tasks to Local Storage

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Update dashboard statistics

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}


// Add or update a task

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = taskInput.value.trim();
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;

    if (!title) {
        return;
    }

    if (editingId !== null) {

        const task = tasks.find(task => task.id === editingId);

        if (task) {
            task.title = title;
            task.priority = priority;
            task.dueDate = dueDate;
        }

        editingId = null;
        submitButton.textContent = "Add Task";

    } else {

        const newTask = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            title: title,
            priority: priority,
            dueDate: dueDate,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();

    taskForm.reset();
    priorityInput.value = "Medium";

    renderTasks();

});


// Display tasks

function renderTasks() {

    taskList.replaceChildren();

    const searchText = searchInput.value.toLowerCase().trim();

    let filteredTasks = tasks.filter(task => {

        const matchesSearch = task.title.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;

    });


    if (filteredTasks.length === 0) {

        const message = document.createElement("p");
        message.className = "empty-message";
        message.textContent = "No tasks found. Add a new task!";

        taskList.appendChild(message);

    }


    filteredTasks.forEach(task => {

        // Main task container

        const taskItem = document.createElement("div");

        taskItem.className = "task-item";
        taskItem.dataset.id = task.id;


        // Task information

        const taskInfo = document.createElement("div");

        taskInfo.className = "task-info";

        if (task.completed) {
            taskInfo.classList.add("completed");
        }


        const taskTitle = document.createElement("h3");
        taskTitle.textContent = task.title;


        const taskDate = document.createElement("p");

        if (task.dueDate) {

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const deadline = new Date(task.dueDate + "T00:00:00");

            taskDate.textContent = "Due: " +
                deadline.toLocaleDateString("en-IN");

            if (!task.completed && deadline < today) {
                taskDate.textContent += " (Overdue)";
                taskDate.style.color = "#d33434";
            }

        } else {

            taskDate.textContent = "No deadline";

        }


        const priorityBadge = document.createElement("span");

        priorityBadge.className = "priority " + task.priority;
        priorityBadge.textContent = task.priority + " Priority";


        taskInfo.appendChild(taskTitle);
        taskInfo.appendChild(taskDate);
        taskInfo.appendChild(priorityBadge);


        // Action buttons

        const actions = document.createElement("div");

        actions.className = "task-actions";


        const completeButton = document.createElement("button");

        completeButton.className = "complete-btn";
        completeButton.dataset.action = "complete";

        completeButton.textContent = task.completed
            ? "Undo"
            : "Complete";


        const editButton = document.createElement("button");

        editButton.className = "edit-btn";
        editButton.dataset.action = "edit";
        editButton.textContent = "Edit";


        const deleteButton = document.createElement("button");

        deleteButton.className = "delete-btn";
        deleteButton.dataset.action = "delete";
        deleteButton.textContent = "Delete";


        actions.appendChild(completeButton);
        actions.appendChild(editButton);
        actions.appendChild(deleteButton);


        // Add everything to the task container

        taskItem.appendChild(taskInfo);
        taskItem.appendChild(actions);

        taskList.appendChild(taskItem);

    });


    updateStats();

}


// Handle task button clicks

taskList.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const taskItem = button.closest(".task-item");

    if (!taskItem) {
        return;
    }

    const taskId = taskItem.dataset.id;

    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        return;
    }


    // Complete or undo task

    if (button.dataset.action === "complete") {

        task.completed = !task.completed;

    }


    // Edit task

    else if (button.dataset.action === "edit") {

        taskInput.value = task.title;
        priorityInput.value = task.priority;
        dueDateInput.value = task.dueDate || "";

        editingId = task.id;

        submitButton.textContent = "Update Task";

        taskInput.focus();

    }


    // Delete task

    else if (button.dataset.action === "delete") {

        const confirmDelete = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        tasks = tasks.filter(item => item.id !== taskId);

        if (editingId === taskId) {
            editingId = null;
            taskForm.reset();
            priorityInput.value = "Medium";
            submitButton.textContent = "Add Task";
        }

    }


    saveTasks();
    renderTasks();

});


// Search tasks

searchInput.addEventListener("input", renderTasks);


// Filter tasks

filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        filterButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        currentFilter = this.dataset.filter;

        renderTasks();

    });

});


// Initial application display

renderTasks();
