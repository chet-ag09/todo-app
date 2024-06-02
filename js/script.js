document.addEventListener('DOMContentLoaded', () => {
    const todoList = document.getElementById('todo');
    const doneList = document.getElementById('done');
    const workspaceSelect = document.getElementById('workspaceSelect');

    loadWorkspaces();

    

    function updateTitle(workspaceName) {
        const titleElement = document.querySelector('h1');
        titleElement.textContent = `To-Do List App - ${workspaceName}`;
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
        saveTasks();
    }

    function dragStart(event) {
        event.target.classList.add('dragging');
        event.dataTransfer.effectAllowed = 'move';
        setTimeout(() => event.target.classList.add('hide'), 0);
    }

    function dragEnd(event) {
        event.target.classList.remove('dragging', 'hide');
        saveTasks();
    }

    function dragOver(event) {
        event.preventDefault();
    }

    function drop(event) {
        event.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        const targetList = event.target.closest('ul');
        if (targetList && (targetList.id === 'todo' || targetList.id === 'done')) {
            targetList.appendChild(draggingElement);
        }
        saveTasks();
    }

    function saveTasks() {
        const workspace = workspaceSelect.value;
        const todos = Array.from(document.getElementById('todo').children).map(task => task.textContent);
        const dones = Array.from(document.getElementById('done').children).map(task => task.textContent);

        localStorage.setItem(`todos-${workspace}`, JSON.stringify(todos));
        localStorage.setItem(`dones-${workspace}`, JSON.stringify(dones));
    }

    function loadTasks() {
        const workspace = workspaceSelect.value;
        updateTitle(workspace);
        const todos = JSON.parse(localStorage.getItem(`todos-${workspace}`)) || [];
        const dones = JSON.parse(localStorage.getItem(`dones-${workspace}`)) || [];
    
        todoList.innerHTML = ''; // Clear the todo list
        doneList.innerHTML = ''; // Clear the done list
    
        // Append tasks to the todo list
        todos.forEach(taskText => {
            const taskElement = createTaskElement(taskText);
            todoList.appendChild(taskElement);
        });
    
        // Check if the done list is empty before appending the placeholder
        if (dones.length === 0) {
            const placeholder = document.createElement('p');
            placeholder.textContent = "Put tasks that are done here";
            placeholder.classList.add('placeholder');
            doneList.appendChild(placeholder);
        }
    
        // Append tasks to the done list
        dones.forEach(taskText => {
            const taskElement = createTaskElement(taskText);
            doneList.appendChild(taskElement);
        });
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
        localStorage.removeItem(`dones-${workspace}`);
        loadWorkspaces();
        todoList.innerHTML = ''; // Clear the task lists
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

    [todoList, doneList].forEach(list => {
        list.addEventListener('dragover', dragOver);
        list.addEventListener('drop', drop);
    });

    
});
