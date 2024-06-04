document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo');
    const doingList = document.getElementById('doing');
    const doneList = document.getElementById('done');
    const workspaceSelect = document.getElementById('workspaceSelect');
    const backgroundSelect = document.getElementById('backgroundSelect');

    loadWorkspaces();
    loadNote();
    loadBackground();

    backgroundSelect.addEventListener('change', updateBackground);

    function updateBackground() {
        const selectedBackground = backgroundSelect.value;
        document.body.className = selectedBackground;
        localStorage.setItem('selectedBackground', selectedBackground);
    }

    function loadBackground() {
        const savedBackground = localStorage.getItem('selectedBackground');
        if (savedBackground) {
            backgroundSelect.value = savedBackground;
            document.body.className = savedBackground;
        }
    }

    function updateTitle(workspaceName) {
        const titleElement = document.querySelector('h1');
        titleElement.textContent = `TODOIT - ${workspaceName}`;
    }

    function addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();
        if (taskText === '') return;

        const newTask = createTaskElement(taskText);

        todoList.appendChild(newTask);
        taskInput.value = '';
        saveTasks();
    }

    function createTaskElement(taskText) {
        const newTask = document.createElement('li');
        newTask.textContent = taskText;
        newTask.setAttribute('draggable', 'true');
        newTask.addEventListener('dragstart', dragStart);
        newTask.addEventListener('dragend', dragEnd);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', deleteTask);

        newTask.appendChild(deleteBtn);
        return newTask;
    }

    function deleteTask(event) {
        const taskItem = event.target.parentNode;
        taskItem.parentNode.removeChild(taskItem);
        checkEmptyLists();
        saveTasks();
    }

    function dragStart(event) {
        const target = event.target;
        if (event.type === 'touchstart') {
            touchStartX = event.touches[0].clientX - target.getBoundingClientRect().left;
            touchStartY = event.touches[0].clientY - target.getBoundingClientRect().top;
        } else {
            target.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'move';
            setTimeout(() => target.classList.add('hide'), 0);
        }
    }

    function dragEnd(event) {
        const target = event.target;
        if (event.type === 'touchend') {
            target.classList.remove('dragging', 'hide');
        } else {
            target.classList.remove('dragging', 'hide');
            saveTasks();
        }
        checkEmptyLists();
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const targetList = event.target.closest('ul');
        if (targetList && (targetList.id === 'todo' || targetList.id === 'doing' || targetList.id === 'done')) {
            targetList.appendChild(draggingElement);
        }
        if (event.type === 'touchend') {
            draggingElement.classList.remove('dragging', 'hide');
        }
        saveTasks();
        checkEmptyLists();
    }

    function touchMove(event) {
        const target = event.target;
        if (target.classList.contains('dragging')) {
            const touch = event.touches[0];
            const offsetX = touch.clientX - touchStartX;
            const offsetY = touch.clientY - touchStartY;
            target.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        }
    }

    [todoList, doingList, doneList].forEach(list => {
        list.addEventListener('touchmove', touchMove);
        list.addEventListener('dragover', dragOver);
        list.addEventListener('drop', drop);
    });

    function saveTasks() {
        const workspace = workspaceSelect.value;
        const todos = Array.from(todoList.children).map(task => task.textContent);
        const doings = Array.from(doingList.children).map(task => task.textContent);
        const dones = Array.from(doneList.children).map(task => task.textContent);

        localStorage.setItem(`todos-${workspace}`, JSON.stringify(todos));
        localStorage.setItem(`doings-${workspace}`, JSON.stringify(doings));
        localStorage.setItem(`dones-${workspace}`, JSON.stringify(dones));
    }

    function loadTasks() {
        const workspace = workspaceSelect.value;
        updateTitle(workspace);
        const todos = JSON.parse(localStorage.getItem(`todos-${workspace}`)) || [];
        const doings = JSON.parse(localStorage.getItem(`doings-${workspace}`)) || [];
        const dones = JSON.parse(localStorage.getItem(`dones-${workspace}`)) || [];

        todoList.innerHTML = ''; // Clear the todo list
        doingList.innerHTML = ''; // Clear the doing list
        doneList.innerHTML = ''; // Clear the done list

        // Append tasks to the todo list
        todos.forEach(taskText => {
            const taskElement = createTaskElement(taskText);
            todoList.appendChild(taskElement);
        });

        // Append tasks to the doing list
        doings.forEach(taskText => {
            const taskElement = createTaskElement(taskText);
            doingList.appendChild(taskElement);
        });

        // Append tasks to the done list
        dones.forEach(taskText => {
            const taskElement = createTaskElement(taskText);
            doneList.appendChild(taskElement);
        });

        checkEmptyLists();
    }

    function checkEmptyLists() {

        if (doingList.children.length === 0) {
            const placeholder = document.createElement('p');
            placeholder.textContent = "Drag and drop tasks here that are in progress!";
            placeholder.classList.add('placeholder');
            doingList.appendChild(placeholder);
        }

        if (doneList.children.length === 0) {
            const placeholder = document.createElement('p');
            placeholder.textContent = "Drag and drop tasks here that are done!";
            placeholder.classList.add('placeholder');
            doneList.appendChild(placeholder);
        }

        // Remove placeholders if there are tasks
        if (todoList.children.length > 1) {
            const placeholder = todoList.querySelector('.placeholder');
            if (placeholder) todoList.removeChild(placeholder);
        }

        if (doingList.children.length > 1) {
            const placeholder = doingList.querySelector('.placeholder');
            if (placeholder) doingList.removeChild(placeholder);
        }

        if (doneList.children.length > 1) {
            const placeholder = doneList.querySelector('.placeholder');
            if (placeholder) doneList.removeChild(placeholder);
        }
    }

    function loadWorkspaces() {
        const workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
        workspaceSelect.innerHTML = '';

        workspaces.forEach(workspace => {
            const option = document.createElement('option');
            option.value = workspace;
            option.textContent = workspace;
            workspaceSelect.appendChild(option);
        });

        const initialOption = document.createElement('option');
        initialOption.textContent = 'Create a new workspace dummy!';
        initialOption.disabled = true;
        initialOption.selected = true;
        workspaceSelect.appendChild(initialOption);

        workspaceSelect.addEventListener('change', () => {
            if (workspaceSelect.value === 'delete') {
                deleteSelectedWorkspace();
            } else {
                loadTasks();
            }
        });

        if (workspaces.length > 0) {
            workspaceSelect.value = workspaces[0];
            loadTasks();
        }
    }

    function createWorkspace() {
        const newWorkspace = prompt('Enter a name for the new workspace:');
        if (newWorkspace) {
            let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
            if (!workspaces.includes(newWorkspace)) {
                workspaces.push(newWorkspace);
                localStorage.setItem('workspaces', JSON.stringify(workspaces));
                loadWorkspaces();
                workspaceSelect.value = newWorkspace;
                loadTasks();
            }
        }
    }

    function deleteWorkspace() {
        const workspace = workspaceSelect.value;
        let workspaces = JSON.parse(localStorage.getItem('workspaces')) || [];
        workspaces = workspaces.filter(w => w !== workspace);
        localStorage.setItem('workspaces', JSON.stringify(workspaces));
        localStorage.removeItem(`todos-${workspace}`);
        localStorage.removeItem(`doings-${workspace}`);
        localStorage.removeItem(`dones-${workspace}`);
        loadWorkspaces();
        todoList.innerHTML = ''; // Clear the task lists
        doingList.innerHTML = ''; // Clear the task lists
        doneList.innerHTML = '';
    }

    function deleteSelectedWorkspace() {
        const workspace = workspaceSelect.value;
        if (workspace !== '') {
            deleteWorkspace();
        }
    }

    const deleteWorkspaceButton = document.createElement('button');
    deleteWorkspaceButton.textContent = '-';
    deleteWorkspaceButton.className = 'remove';
    deleteWorkspaceButton.addEventListener('click', deleteSelectedWorkspace);
    const workspaceContainer = document.querySelector('.workspace-container');
    workspaceContainer.appendChild(deleteWorkspaceButton);

    window.addTask = addTask;
    window.createWorkspace = createWorkspace;

    const noteInput = document.getElementById('noteInput');
    const noteContainer = document.querySelector('.note-container');

    // Load note from local storage when the page loads
    loadNote();

    // Assign saveNote function to the button's onclick event
    const saveButton = document.getElementById('saveButton');
    saveButton.onclick = saveNote;
});

function loadNote() {
    const savedNote = localStorage.getItem('note');
    if (savedNote) {
        noteInput.value = savedNote;
    }
}

function saveNote() {
    const noteText = noteInput.value.trim();
    if (noteText !== '') {
        localStorage.setItem('note', noteText);
        alert('Note saved successfully!');
    } else {
        alert('Please enter a note before saving.');
    }
}

function deleteNote() {
    const confirmation = confirm('Are you sure you want to delete the note?');
    if (confirmation) {
        localStorage.removeItem('note');
        noteInput.value = '';
        alert('Note deleted successfully!');
    }
}
