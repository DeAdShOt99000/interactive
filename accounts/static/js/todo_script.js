(function(){
    'use strict';

    const addTaskBtn = document.querySelector('.add-task-btn');
    const removeTaskBtn = document.querySelector('.remove-task-btn');
    const taskAddForm = document.querySelector('.add-task-form')
    const taskRemoveForm = document.querySelector('.remove-task-form')

    function toggleBtn(showForm, hideForm, showBtn, hideBtn) {
        // console.log('kkkkk')
        hideForm.style.display = 'none'
        hideBtn.style.borderBottomWidth = ''
        if (showForm.style.display != 'block'){
            showForm.style.display = 'block'
            showBtn.style.borderBottomWidth = '10px'
        } else {
            showForm.style.display = 'none'
            showBtn.style.borderBottomWidth = ''
        }
    }

    addTaskBtn.onclick = function(){
        toggleBtn(taskAddForm, taskRemoveForm, addTaskBtn, removeTaskBtn)
    }
    removeTaskBtn.onclick = function(){
        toggleBtn(taskRemoveForm, taskAddForm, removeTaskBtn, addTaskBtn)
    }

    const selectDate = document.getElementById('select-date')

    selectDate.addEventListener('change', function(){
        window.location.href = selectDate.value
    })

    const tasksContainer = document.getElementById('tasks-container')
    fetch(`/todo-tasks-json/${selectDate.value}`)
    .then(response => response.json())
    .then(json => {
        const data = JSON.parse(json)

        let html = ''
        let html2 = ''
        for (let i=0; i < Object.keys(data).length; i++){
            const taskIdE = data[i].pk
            const taskE = data[i].fields.task
            const task_dateE = data[i].fields.task_date
            const is_doneE = data[i].fields.is_done

            let checkedE = ''
            if (is_doneE == 1){
                checkedE = 'checked'
            }

            html += `<input type="checkbox" class="all-tasks" name="${taskIdE}" id="all-tasks-${taskIdE}" ${checkedE}>
            <label for="all-tasks-${taskIdE}">${taskE}</label><br>`
            html2 += `<label for="all-tasks-rm-${taskIdE}">
                        <input type="checkbox" class="all-tasks-rm" name="${taskIdE}" id="all-tasks-rm-${taskIdE}">
                        ${taskE}
                        </label><br>`
            
        }
        // console.log(JSON.parse(json)[0].fields)
        
        
        tasksContainer.innerHTML = html ? html: 'No available tasks';
        taskRemoveForm.querySelector('.all-tasks-rm-container').innerHTML = html2 ? html2: 'No available tasks';

        const allTasksRm = document.querySelectorAll('.all-tasks-rm')
        allTasksRm.forEach(function(task){
            task.addEventListener('change', function(){
                if (task.checked){
                    task.parentNode.style.textDecoration = 'line-through'
                } else {
                    task.parentNode.style.textDecoration = ''
                }
                // console.log('ppppppppp')
            })
        })

        const allTasks = document.querySelectorAll('.all-tasks')
        // console.log(allTasks)
        doneCount(allTasks)

        allTasks.forEach(function(task) {
            task.addEventListener('change', function(){
                // console.log('lkkkkl')
        
                // let is_doneE_count = 0
                // for (let i=0; task < allTasks.length; i++){
                //     if (allTasks[i].checked){
                //         is_doneE_count++
                //     } else {
                //         break
                //     }
                // }

                // if (is_doneE_count < allTasks.length){

                // }

                // tasksContainer.innerHTML = 
                doneCount(allTasks)

                fetch(`/todo-tasks-json/${selectDate.value}`, {
                    method: 'POST',
                    body: JSON.stringify({
                        update_task_id: this.getAttribute('name')
                    }),
                    headers: {
                        'Content-type': 'application/json',
                        'X-CSRFToken': document.getElementById('csrf').innerText
                    }
                })
                // .then(response => response.json())
                // .then(json => {
                //     document.body.innerHTML = json
                // })
            })
        });
    })
    const doneCountContainer = document.querySelector('.done-count-container')
    function doneCount(allTasks){
        if (allTasks.length){
            let is_doneE_count = 0;
            for (let i=0; i < allTasks.length; i++){
                if (allTasks[i].checked){
                    is_doneE_count++
                }
            }
            if (allTasks.length - is_doneE_count == 1){
                doneCountContainer.innerText = `${allTasks.length - is_doneE_count} task is left to complete.`
            } else if (is_doneE_count < allTasks.length){
                // console.log('lllll', is_doneE_count, allTasks.length)
                doneCountContainer.innerText = `${allTasks.length - is_doneE_count} tasks are left to complete.`
            } else if (is_doneE_count == allTasks.length){
                // console.log('pppp', is_doneE_count, allTasks.length)
                doneCountContainer.innerText = 'Completed!'
            }
        }
    }
})();