import './css/style.css';
import './css/note.css';
import './css/menu.css';
import { library, dom } from '@fortawesome/fontawesome-svg-core';
import { faBars} from '@fortawesome/free-solid-svg-icons';
import deleteIcon from './assests/delete.svg';
import tickIcon from './assests/tick.svg';
import editIcon from './assests/edit.svg';
import addIcon from './assests/add.svg';

library.add(faBars);
dom.watch();

const mainField = document.querySelector('.mainField');
const menu = document.querySelector('.menu');
const workspaceBar = document.querySelector('.workspaceBar');

const newWorkspace = document.createElement('button');
newWorkspace.className = 'newWorkspace';
newWorkspace.innerHTML = `New Workspace`;

const newWorkspaceDialog = document.createElement('dialog');
newWorkspaceDialog.className = 'newWorkspaceDialog';
newWorkspaceDialog.innerHTML = `
    <h2>Create New Workspace</h2>
    <input type="text" id="workspaceName" placeholder="Workspace Name">
    <div class="newWorkspaceButtons">
        <button id="createButton">Create</button>
        <button id="cancelButton" onclick="document.querySelector('.newWorkspaceDialog').close()">Cancel</button>
    </div>
`;

const newNoteDialog = document.createElement('dialog');
newNoteDialog.className = 'newNoteDialog';
newNoteDialog.innerHTML = `
    <h2>Create New Note</h2>
    <input type="text" id="noteTitle" placeholder="Note Title">
    <textarea id="noteText" placeholder="Note Content"></textarea>
    <div class="dateTimeInputs">
        <input type="date" id="noteDate" name="noteDate" placeholder="Due Date">
        <input type="time" id="noteTime" name="noteTime" placeholder="Due Time">
    </div>
    <div class="newNoteButtons">
        <button id="createButton">Create</button>
        <button id="cancelButton" onclick="document.querySelector('.newNoteDialog').close()">Cancel</button>
    </div>
`;

menu.appendChild(newWorkspace);

class Note{
    constructor(title, text, modification, date, time){
        this.title = title;
        this.text = text;
        this.modification = modification;
        this.date = date;
        this.time = time;
    }
}

let workspaces = loadWorkspaces();
let currentWorkspace = workspaces.size > 0 ? workspaces.keys().next().value : '';

document.body.appendChild(newWorkspaceDialog);
document.body.appendChild(newNoteDialog);

newWorkspace.addEventListener('click', () => {
    newWorkspaceDialog.showModal();
});

newWorkspaceDialog.querySelector('#createButton').addEventListener('click', () => {
    const name = document.getElementById('workspaceName').value.trim();
    if (name) {
        addWorkspace(name);
        newWorkspaceDialog.close();
    } else {
        alert("Please enter a workspace name.");
    }
});

newNoteDialog.querySelector('#createButton').addEventListener('click', () => {
    const title = document.getElementById('noteTitle').value.trim();
    const text = document.getElementById('noteText').value.trim();
    const date = document.getElementById('noteDate').value;
    const time = document.getElementById('noteTime').value;
    
    if (!title && !text) {
        alert("Please enter either a title or note content.");
        return;
    }
    addNode(title, text, date, time);
});



function showWorkspaceButtons() {
    menu.innerHTML = '';
    menu.appendChild(newWorkspace);
    for (const [name] of workspaces.entries()) {
        const btn = document.createElement('button');
        btn.className = 'latestWorkspace';
        btn.innerHTML = name;
        btn.addEventListener('click', () => {
            currentWorkspace = name;
            showWorkspace(name);
        });
        menu.appendChild(btn);
    }
}

const addWorkspace = (name) => {
    if(workspaces.has(name)) {
        alert('Workspace already exists');
        return;
    }
    showWorkspaceButtons();
    workspaces.set(name, []);
    currentWorkspace = name;
    showWorkspace(currentWorkspace);
    document.getElementById('workspaceName').value = '';
    saveWorkspaces(workspaces);
}

const addNode = (title, text, date, time) => {
    const note = new Note(title, text, 'Created', date, time);
    workspaces.get(currentWorkspace).push(note);
    showWorkspace(currentWorkspace);
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteText').value = '';
    document.getElementById('noteDate').value = '';
    document.getElementById('noteTime').value = '';
    newNoteDialog.close();
    saveWorkspaces(workspaces);
}

const showWorkspace = (name=currentWorkspace) => {
    workspaceBar.innerHTML = '';
    const workspaceBarName = document.createElement('textarea');
    workspaceBarName.className = 'workspaceBarName';
    workspaceBarName.value = name;

    const workspaceBarAddNote = document.createElement('button');
    workspaceBarAddNote.className = 'workspaceBarButton AddNote';
    workspaceBarAddNote.innerHTML = `<img src="${addIcon}" alt="Add Note">`;
    
    const workspaceBarDelete = document.createElement('button');
    workspaceBarDelete.className = 'workspaceBarButton Delete';
    workspaceBarDelete.innerHTML = `<img src="${deleteIcon}" alt="Delete">`;
    
    const workspaceBarButtons = document.createElement('div');
    workspaceBarButtons.className = 'workspaceBarButtons';
    workspaceBarButtons.appendChild(workspaceBarAddNote);
    workspaceBarButtons.appendChild(workspaceBarDelete);
    
    workspaceBar.appendChild(workspaceBarName);
    workspaceBar.appendChild(workspaceBarButtons);

    workspaceBarAddNote.addEventListener('click', () => {
        newNoteDialog.showModal();
    });
    workspaceBarDelete.addEventListener('click', () => {
        if (confirm(`Are you sure you want to delete the workspace "${name}"?`)) {
            workspaces.delete(name);
            if (currentWorkspace === name) {
                currentWorkspace = workspaces.keys().next().value || '';
            }
            saveWorkspaces(workspaces);
            showWorkspace(currentWorkspace);
        }
    });


    workspaceBarName.addEventListener('change', () => {
        const newName = workspaceBarName.value.trim();
        if (newName && newName !== name) {
            if (workspaces.has(newName)) {
                alert('Workspace with this name already exists');
                workspaceBarName.value = name;
            } else {
                workspaces.set(newName, workspaces.get(name));
                workspaces.delete(name);
                currentWorkspace = newName;
                saveWorkspaces(workspaces);
                showWorkspace(newName);
            }
        } else {
            workspaceBarName.value = name;
        }
    });

    showWorkspaceButtons();
    mainField.innerHTML = '';
    for(const note of workspaces.get(name)) {
        const pageBox = document.createElement("div");
        pageBox.className = "pageBox";
        const page = document.createElement("div");
        page.className = "note";
        
        let dueDateContent = '';
        let dueTimeContent = '';
        
        if (note.date && note.time) {
            const [hours, minutes] = note.time.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            
            dueDateContent = `<span class="noteDate">${note.date}</span>`;
            dueTimeContent = `<span class="noteTime">${formattedHour}:${minutes} ${ampm}</span>`;
        } else if (note.date && !note.time) {
            dueDateContent = `<span class="noteDate">${note.date}</span>`;
            dueTimeContent = `<span class="noteTime" style="color: #999; font-style: italic;">No time set</span>`;
        } else if (!note.date && note.time) {
            const [hours, minutes] = note.time.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const formattedHour = hour % 12 || 12;
            
            dueDateContent = `<span class="noteDate" style="color: #999; font-style: italic;">No date set</span>`;
            dueTimeContent = `<span class="noteTime">${formattedHour}:${minutes} ${ampm}</span>`;
        } else {
            dueDateContent = `<span class="noteDate" style="color: #999; font-style: italic;">No due date</span>`;
            dueTimeContent = '';
        }

        if(note.modification === 'Completed') {
            pageBox.style.backgroundColor = '#d4edda';
        }
        page.innerHTML =`
            <div class ="noteHeader">
                <span class="noteTitle">${note.title}</span>
                <div class="noteHeaderIcons">
                    <img src="${editIcon}" id="editIcon">
                    <img src="${tickIcon}" id="tickIcon">
                    <img src="${deleteIcon}" id="deleteIcon">
                </div>
            </div>
            <textarea class="noteText">${note.text}</textarea>
            <div class="noteDue">
                <span class="noteDueText">Due:</span>
                ${dueDateContent}
                ${dueTimeContent}
            </div>
        `;
        pageBox.appendChild(page);
        mainField.appendChild(pageBox);
        
        const noteTextarea = page.querySelector('.noteText');
        let saveTimeout;
        
        noteTextarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const noteIndex = Array.from(mainField.children).indexOf(pageBox);
                const currentNote = workspaces.get(currentWorkspace)[noteIndex];
                currentNote.text = noteTextarea.value;
                saveWorkspaces(workspaces);
            }, 500);
        });
        
        page.addEventListener('click', (e) => {
            if(e.target.id === 'deleteIcon') {
                const noteIndex = Array.from(mainField.children).indexOf(page.parentElement);
                workspaces.get(currentWorkspace).splice(noteIndex, 1);
                saveWorkspaces(workspaces);
                showWorkspace(currentWorkspace);
            } else if(e.target.id === 'tickIcon') {
                const noteIndex = Array.from(mainField.children).indexOf(page.parentElement);
                const note = workspaces.get(currentWorkspace)[noteIndex];
                note.modification = note.modification === 'Completed' ? 'Created' : 'Completed';
                saveWorkspaces(workspaces);
                showWorkspace(currentWorkspace);
            }
            else if(e.target.id=== 'editIcon') {
                const noteIndex = Array.from(mainField.children).indexOf(page.parentElement);
                const note = workspaces.get(currentWorkspace)[noteIndex];
                document.getElementById('noteTitle').value = note.title;
                document.getElementById('noteText').value = note.text;
                document.getElementById('noteDate').value = note.date || '';
                document.getElementById('noteTime').value = note.time || '';
                
                newNoteDialog.showModal();
                workspaces.get(currentWorkspace).splice(noteIndex, 1);
                saveWorkspaces(workspaces);
            }
        });
    }
}

showWorkspace();

function saveWorkspaces(map) {
    const obj = Object.fromEntries(map);
    localStorage.setItem('workspaces', JSON.stringify(obj));
}

function loadWorkspaces() {
    const data = localStorage.getItem('workspaces');
    if (!data) return new Map();
    const obj = JSON.parse(data);
    console.log(obj);
    return new Map(Object.entries(obj)); 
}