(function(){
    'use strict';

    const notesContainer = document.querySelector('.notes-container')
    const noNotesAddNote = document.querySelector('.no-notes-add-note')
    const csrf = document.querySelector('.csrf input').value

    let currentElement = false
    let pendingNewNote = false

    document.body.addEventListener('click', function(event){
        if (pendingNewNote){
            // console.log(pendingNewNote)
            currentElement = document.querySelector('.note-form')
            pendingNewNote = false
        } else if (currentElement){
            if (currentElement == document.querySelector('.note-form') && !currentElement.contains(event.target)){
                // console.log('PPOOOPPOO')
                addNewNote();
            } else if (currentElement != document.querySelector('.note-form') && !currentElement.contains(event.target)){
                save_hideEditNote(currentElement);
            }
        }
    })

    noNotesAddNote.querySelector('span').onclick = addNoteBtn

    let noteForm = false

    document.querySelector('.add-note').onclick = addNoteBtn
    
    function addNoteBtn(){
        noNotesAddNote.style.display = 'none'

        const newNoteForm = document.createElement('div')
        newNoteForm.className = 'note-form note-element'

        const div = document.createElement('div')
        div.innerText = 'New Note'
        
        // const label = document.createElement('label')
        // label.setAttribute('for', 'subject')
        // label.innerText = 'Subject:'
        
        const textInp = document.createElement('input')
        textInp.type = 'text'
        textInp.name = 'subject'
        textInp.id = 'subject'
        textInp.placeholder = 'Subject...'
        textInp.tabIndex = 1
        
        const saveBtn = document.createElement('button')
        saveBtn.className = 'green-btn'
        saveBtn.innerText = 'Save'
        saveBtn.tabIndex = 3

        const cancelBtn = document.createElement('button')
        cancelBtn.className = 'red-btn'
        cancelBtn.innerText = 'Cancel'
        cancelBtn.tabIndex = 4
        
        const textArea = document.createElement('textarea')
        textArea.name = 'note'
        textArea.id = 'note'
        textArea.tabIndex = 2
        
        newNoteForm.appendChild(div)
        // newNoteForm.appendChild(label)
        newNoteForm.appendChild(textInp)
        newNoteForm.appendChild(saveBtn)
        newNoteForm.appendChild(cancelBtn)
        newNoteForm.appendChild(textArea)
        
        notesContainer.prepend(newNoteForm)
        textInp.focus()

        saveBtn.onclick = addNewNote
        cancelBtn.onclick = function(){
            notesContainer.removeChild(newNoteForm);
            currentElement = false
        }
        // currentElement = 'pending-new-note'
        pendingNewNote = true
        noteForm = newNoteForm


        if (currentElement){
            save_hideEditNote(currentElement);
        }
        
        // noteForm.style.display = 'block'
    }
    
    function addNewNote(){
        // console.log(currentElement)
        if (document.getElementById('subject').value != '' || document.getElementById('note').value != ''){
            fetch('/notes', {
                method: 'post',
                body: JSON.stringify({
                    subject: document.getElementById('subject').value,
                    note: document.getElementById('note').value,
                }),
                headers: {
                    'Content-type': 'application/json',
                    'X-CSRFToken': csrf
                }
            })
            .then(response => response.json())
            .then(data => {
                const jsonData = JSON.parse(data)
                createNote(jsonData[0].fields, jsonData[0].pk, true)
                notesContainer.removeChild(noteForm)
            })
        } else {
            notesContainer.removeChild(noteForm)
        }
        currentElement = false
        if (notesContainer.children.length < 2){
            noNotesAddNote.style.display = 'block'
            // console.log('Inside')
        }
        // console.log(notesContainer.children)
    }
    
    function showEditNote(noteElement, clickedElement){
        if (currentElement == document.querySelector('.note-form')){
            addNewNote()
        }
        if (currentElement && currentElement != noteElement){
            // console.log('from here')
            save_hideEditNote(currentElement)
        }
        noteElement.querySelector('.unedit-subject').style.display = 'none'
        noteElement.querySelector('.edit-subject').style.display = 'block'
        noteElement.querySelector('.note-subject').style.padding = '0 0 2px 0'
        
        noteElement.querySelector(`.unedit-note`).style.display = 'none'
        noteElement.querySelector(`.star-logo`).style.display = 'none'
        noteElement.querySelector(`.edit-note`).style.display = 'block'
        noteElement.querySelector(`.sc-btns`).style.display = 'inline'
        noteElement.querySelector('.note-dates').style.top = '10px'
        noteElement.querySelector('.note-text').style.overflow = 'visible';
        noteElement.querySelector('.note-text').style.padding = '0';
        
        if (clickedElement == 'subject'){
            noteElement.querySelector('.edit-subject').focus()
        } else {
            noteElement.querySelector(`.edit-note`).focus()
        }
        currentElement = noteElement
    }

    function save_hideEditNote(noteElement, saveChanges=true){
        noteElement.querySelector('.unedit-subject').style.display = 'block'
        noteElement.querySelector('.edit-subject').style.display = 'none'
        noteElement.querySelector('.note-subject').style.padding = '5px'

        noteElement.querySelector(`.unedit-note`).style.display = 'block'
        noteElement.querySelector(`.star-logo`).style.display = 'inline'
        noteElement.querySelector(`.edit-note`).style.display = 'none'
        noteElement.querySelector(`.sc-btns`).style.display = 'none'
        noteElement.querySelector('.note-dates').style.top = '0'
        noteElement.querySelector('.note-text').style.overflow = 'auto';
        noteElement.querySelector('.note-text').style.padding = '5px';

        if (noteElement.querySelector(`.unedit-note`).innerText != noteElement.querySelector('.edit-note').value || noteElement.querySelector(`.unedit-subject`).innerText != noteElement.querySelector('.edit-subject').value && saveChanges){
            updateNote(noteElement.querySelector('.sc-btns').getAttribute('id'), noteElement)
        }
        currentElement = false
    }

    function updateNote(noteId, noteElement){
        fetch(`/notes-json`, {
            method: 'post',
            body: JSON.stringify({
                id: noteId,
                subject: noteElement.querySelector('.edit-subject').value,
                note: noteElement.querySelector('.edit-note').value
            }),
            headers: {
                'Content-type': 'application/json',
                'X-CSRFToken': csrf
            }
        })
        .then(response => {
            if (!response.ok){
                throw Error('Network response was not OK');
            }
            return response.json();
        })
        .then(data => {
            noteElement.querySelector(`.unedit-subject`).innerText = noteElement.querySelector('.edit-subject').value ? noteElement.querySelector('.edit-subject').value: 'No Subject';
            noteElement.querySelector(`.unedit-note`).innerText = noteElement.querySelector('.edit-note').value
            noteElement.querySelector(`.updated-span .date-text`).innerText = prettyDate(data.updated_at)
        })
        .catch(error => {
            console.error('Fetch error:', error)
        })
    };

    function toggleFavorite(pk, starElement){
        fetch(`/favorite-json/${pk}`)
        .then(response => response.json())
        .then(data => {
            starElement.src = data.favorite ? document.querySelector('.gold-star-logo-src').innerText :document.querySelector('.star-logo-src').innerText;
        })
    };

    function deleteNote(pk, noteElement){
        fetch(`/notes/delete/${pk}`)
        .then(function(){
            notesContainer.removeChild(noteElement)
            // console.log(notesContainer.children)
            if (notesContainer.children.length < 2){
                noNotesAddNote.style.display = 'block'
            }
        })
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    function prettyDate(dateStr){
        const dateObj = new Date(dateStr)
        return `${weekDays[dateObj.getDay()]} ${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()} ${prettyTime(dateObj)}`
    }

    function prettyTime(timeObj){
        let hour = timeObj.getHours()
        const minutes = timeObj.getMinutes() < 10 ? `0${timeObj.getMinutes()}`: timeObj.getMinutes().toString();
        let AmPm = 'am'
        if (hour >= 12){
            hour = hour - 12
            AmPm = 'pm'
        }
        if (hour == '00'){
            hour = 12
        }
        return `${hour}:${minutes} ${AmPm}`
    }
    
    
    fetch('/notes-json')
    .then(response => response.json())
    .then(data => {
        const jsonData = JSON.parse(data)
        // console.log(jsonData)
        notesContainer.removeChild(document.querySelector('.loading'))

        if (Object.keys(jsonData).length < 1){
            noNotesAddNote.style.display = 'block'
        } else {
            for (let entry in jsonData){
                createNote(jsonData[entry].fields, jsonData[entry].pk)
            }
        }
    })


    // const noteForm = document.querySelector('.note-form')

    function createNote(noteObj, pk, newEntry=false){
        const noteElement = document.createElement('div')
        noteElement.className = 'note-element'

        const noteSubject = document.createElement('div')
        noteSubject.className = 'note-subject'
        // noteSubject.innerText = noteObj.subject

        const unEditSubject = document.createElement('div')
        unEditSubject.className = 'unedit-subject'
        unEditSubject.innerText = noteObj.subject

        const editSubject = document.createElement('input')
        editSubject.className = 'edit-subject'
        editSubject.value = noteObj.subject
        editSubject.placeholder = 'Subject...'

        const noteText = document.createElement('div')
        noteText.className = 'note-text'
        
        const unEditNote = document.createElement('div')
        unEditNote.className = 'unedit-note'
        unEditNote.innerText = noteObj.note
        
        const editNote = document.createElement('textarea')
        editNote.className = 'edit-note'
        editNote.value = noteObj.note
        
        const noteDates = document.createElement('div')
        noteDates.className = 'note-dates'
        
        const createdSpan = document.createElement('span')
        createdSpan.className = 'created-span'
        createdSpan.innerText = 'Created at: '
        
        const cDateText = document.createElement('span')
        cDateText.className = 'date-text'
        cDateText.innerText = prettyDate(noteObj.created_at)

        // const d = new Date(noteObj.created_at)
        // console.log(d)
        
        const updatedSpan = document.createElement('span')
        updatedSpan.className = 'updated-span'
        updatedSpan.innerText = 'Updated at: '
        
        const uDateText = document.createElement('span')
        uDateText.className = 'date-text'
        uDateText.innerText = prettyDate(noteObj.updated_at)
        
        const scBtns = document.createElement('div')
        scBtns.className = 'sc-btns'
        scBtns.id = pk

        const saveChanges = document.createElement('button')
        saveChanges.className = 'green-btn'
        // saveChanges.id = pk
        saveChanges.innerText = 'Save'

        const cancelChanges = document.createElement('button')
        cancelChanges.className = 'red-btn'
        cancelChanges.innerText = 'Cancel'

        const deleteLogo = document.createElement('img')
        deleteLogo.classList = 'delete-logo'
        deleteLogo.src = document.querySelector('.delete-logo-src').innerText
        
        const starLogo = document.createElement('img')
        starLogo.className = 'star-logo'
        starLogo.src = noteObj.favorite ? document.querySelector('.gold-star-logo-src').innerText :document.querySelector('.star-logo-src').innerText;
        starLogo.alt = 'Favorite button'
        // starLogo.id = `/favorite-json/${pk}`
        
        createdSpan.appendChild(cDateText)
        updatedSpan.appendChild(uDateText)
        scBtns.appendChild(saveChanges)
        scBtns.appendChild(cancelChanges)
        
        noteDates.appendChild(createdSpan)
        noteDates.appendChild(document.createElement('br'))
        noteDates.appendChild(updatedSpan)
        noteDates.appendChild(scBtns)
        noteDates.appendChild(deleteLogo)
        noteDates.appendChild(starLogo)
        
        noteText.appendChild(unEditNote)
        noteText.appendChild(editNote)
        
        noteSubject.appendChild(unEditSubject)
        noteSubject.appendChild(editSubject)
        
        noteElement.appendChild(noteSubject)
        noteElement.appendChild(noteText)
        noteElement.appendChild(noteDates)
        
        if (newEntry){
            notesContainer.prepend(noteElement)
        } else {
            notesContainer.appendChild(noteElement)
        }
        
        saveChanges.onclick = function(){save_hideEditNote(noteElement)}
        cancelChanges.onclick = function(){save_hideEditNote(noteElement, false)}
        noteText.onclick = function(){showEditNote(noteElement, 'note')}
        noteSubject.onclick = function(){showEditNote(noteElement, 'subject')}
        starLogo.onclick = function(){toggleFavorite(pk, starLogo)}
        deleteLogo.onclick = function(){deleteNote(pk, noteElement)}
    }
})();