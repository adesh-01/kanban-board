let draggedCard = null;
let rightClickedCard = null;

document.addEventListener("DOMContentLoaded",loadTasksFromLocalStorage);

function addTask (columnId){
    const input = document.getElementById(`${columnId}-input`)
    const taskText = input.value.trim();
    console.log(taskText)

    if (taskText ===""){
        return;
    }

    const taskDate = new Date().toLocaleString();

    const taskElement = createTaskElement(taskText,taskDate);

    document.getElementById(`${columnId}-tasks`).appendChild(taskElement)

    updateTaskCount(columnId);
    saveTasksToLocalStorage(columnId, taskText, taskDate)
    input.value = "";
}

function createTaskElement (taskText,taskDate){
    const taskElement = document.createElement("div")
    taskElement.innerHTML = `<span>${taskText}</span> <br> <small class="time">${taskDate}</small>`;
    taskElement.classList.add("card");
    // taskElement.setAttribute("draggable",true);
    taskElement.draggable = true;
    taskElement.addEventListener("dragstart",dragStart);
    taskElement.addEventListener("dragend",dragEnd);

    taskElement.addEventListener("contextmenu",function (event){
        event.preventDefault();
        rightClickedCard = this

        console.log(event.pageX,event.pageY) // cursor cordinates
        
        showContextMenu (event.pageX , event.pageY);

    });

    return taskElement;
}

function dragStart (){
    this.classList.add("dragging");
    draggedCard = this;

}

function dragEnd (){
    this.classList.remove("dragging");
    draggedCard = null;
    ["todo","doing","done"].forEach((columnId)=>{
        updateTaskCount(columnId);
        updateLocalStorage();
    })
}

const columns = document.querySelectorAll(".tasks");
columns.forEach((column)=>{
    column.addEventListener("dragover", dragOver);
});

function dragOver (event){
    event.preventDefault();
    // this.appendChild(draggedCard);

    const afterElement = getDragAfterElement(this, event.pageY);

    if(afterElement == null){
        this.appendChild(draggedCard);
    }
    else{
        this.insertBefore(draggedCard, afterElement)
    }
}

function getDragAfterElement(container, y){
    const draggableElement = [...container.querySelectorAll(".card:not(.dragging)"),];

    const result = draggableElement.reduce( 
        (closestElementUnderMouse, currentTask)=>{
        const box = currentTask.getBoundingClientRect();
        // const offset = y - box.top - box.height / 2;
        const offset = y - (box.top + box.height / 2);
        if(offset < 0 && offset > closestElementUnderMouse.offset){
            return {offset: offset, element: currentTask};
        }
        else{
            return closestElementUnderMouse;
        }
        
    },
    {offset: Number.NEGATIVE_INFINITY}
  );
    return result.element;
}

const contextmenu = document.querySelector(".context-menu")

function showContextMenu(x,y){
    contextmenu.style.left = `${x}px`;
    contextmenu.style.top = `${y}px`;
    contextmenu.style.display = "block" ;
}

document.addEventListener("click",()=>{
    contextmenu.style.display = "none"
})

function editTask(){
    if(rightClickedCard !== null){
        const newTaskText = prompt("Edit task-",rightClickedCard.textContent)
        if(newTaskText !==""){
        rightClickedCard.textContent = newTaskText

        updateLocalStorage();
       }
    }  
}

function deleteTask(){
    if(rightClickedCard !== null){
        const column = rightClickedCard.parentElement.id.split("-")[0];
        rightClickedCard.remove();
        updateTaskCount(column);
        updateLocalStorage();
    }
}


function updateTaskCount(columnId){
    // console.log(columnId);
    // console.log(`#${columnId}-tasks`);
    console.log(`#${columnId}-tasks .card`);
    const count = document.querySelectorAll(`#${columnId}-tasks .card`).length;
    document.getElementById(`${columnId}-count`).textContent = count;
}

function saveTasksToLocalStorage (columnId, taskText, taskDate) {
    const tasks = JSON.parse(localStorage.getItem(columnId)) || []
    tasks.push({text:taskText, date:taskDate});
    localStorage.setItem(columnId, JSON.stringify(tasks));
}   


function loadTasksFromLocalStorage () {
    ["todo","doing","done"].forEach((columnId)=>{
        const tasks = JSON.parse(localStorage.getItem(columnId)) || [];
        tasks.forEach(({text,date})=>{
            const taskElement = createTaskElement(text, date);
            document.getElementById(`${columnId}-tasks`).appendChild(taskElement);
        })
        updateTaskCount(columnId);
    })
}

function updateLocalStorage () {
    ["todo","doing","done"].forEach((columnId)=>{
        const tasks = [];
        document.querySelectorAll(`#${columnId}-tasks .card`).forEach((card)=>{
            const taskText = card.querySelector("span").textContent;
            const taskDate = card.querySelector("small").textContent;
            tasks.push({text: taskText, date:taskDate});
        })
        localStorage.setItem(columnId, JSON.stringify(tasks));
    })
}

// 3:54