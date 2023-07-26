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
            noNotesAddNote.style.display = 'block'
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
        if (notesContainer.children.length < 1){
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
            if (notesContainer.children.length < 1){
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
        document.body.removeChild(document.querySelector('.loading'))
        
        if (Object.keys(jsonData).length < 1){
            noNotesAddNote.style.display = 'block'
        } else {
            for (let entry in jsonData){
                createNote(jsonData[entry].fields, jsonData[entry].pk)
            }
            // console.log(notesContainer.children)
        }
    })

    // const g = 'This is what it is'
    // let start = 0
    // while (g.indexOf('s', start) != -1){
    //     const k = g.indexOf('s', start)
    //     // console.log(k)
    //     // console.log(g.slice(k, k+1))
    //     start = k + 1
    // }

    // function insertAt(text, word, index){
    //     if (index < 0 || index > text.length){
    //         return text;
    //     }

    //     const a = text.slice(0, index)
    //     const b = text.slice(index)

    //     return a + word + b;
    // }

    // function putBrackets(text, index1, index2){
    //     const a = text.slice(0, index1)
    //     const b = text.slice(index1, index2)
    //     const c = text.slice(index2)

    //     return a + '<' + b + '>' + c
    // }

    const search = document.querySelector('.search')

    let currentSearchElems = notesContainer

    search.addEventListener('input', function(){
        // console.log(document.querySelectorAll('.note-element[style*="display: block;"]'))
        for (let elem of document.querySelectorAll('.note-element')){
            if (elem.querySelector('.unedit-subject').innerText.toLowerCase().includes(search.value.toLowerCase()) || elem.querySelector('.unedit-note').innerText.toLowerCase().includes(search.value.toLowerCase())){
                elem.querySelector('.unedit-subject').innerHTML = highlight(elem.querySelector('.unedit-subject').innerText, search.value)
                elem.querySelector('.unedit-note').innerHTML = highlight(elem.querySelector('.unedit-note').innerText, search.value)
                elem.style.display = 'block'
                // console.log(highlight(elem.querySelector('.unedit-note').innerText, search.value))
            } else {
                elem.style.display = 'none'
            }
        }
    })

    const sortBy = document.getElementById('sort-by')

    const sortAsc = document.getElementById('asc')
    const sortAscLabel = document.querySelector(`label[for="${sortAsc.id}"]`)
    
    const sortDes = document.getElementById('des')
    const sortDesLabel = document.querySelector(`label[for="${sortDes.id}"]`)

    sortBy.addEventListener('change', function(){
        // let newOrder;
        switch (sortBy.value){
            case 'date-created':
                setSortBy('date-created')
                break;
            case 'date-updated':
                setSortBy('date-updated')
                break;
            case 'subject':
                setSortBy('subject')
                break;
            case 'favorite':
                setSortBy('favorite')
                break;
            }
        })

    document.querySelectorAll('.sort-order').forEach(each => {
        each.addEventListener('change', function(){
            setSortBy(sortBy.value, each.id)
            console.log(sortBy.value, each.id)
        })
    })

    function setSortBy(selectedSort, order='asc'){
        let newArray = [...notesContainer.children] //[...X] is spread operator
        // console.log(newArray)
        switch (selectedSort){
            case 'date-created':
                sortAscLabel.innerText = 'Older to Newer'
                sortDesLabel.innerText = 'Newer to Older'
                
                newArray.sort((elem1, elem2) => {
                    // console.log(new Date(elem1.querySelector('.created-span .date-text').id))
                    const date1 = new Date(elem1.querySelector('.created-span .date-text').id.slice(1));
                    const date2 = new Date(elem2.querySelector('.created-span .date-text').id.slice(1));
                    return toggleAndReturn(order, date1, date2)
                }); break;
                
            case 'date-updated':
                sortAscLabel.innerText = 'Older to Newer'
                sortDesLabel.innerText = 'Newer to Older'
                
                newArray.sort((elem1, elem2) => {
                    // console.log(new Date(elem1.querySelector('.updated-span .date-text').id.slice(1)))
                    const date1 = new Date(elem1.querySelector('.updated-span .date-text').id.slice(1));
                    const date2 = new Date(elem2.querySelector('.updated-span .date-text').id.slice(1));
                    return toggleAndReturn(order, date1, date2)
                }); break;

            case 'subject':
                sortAscLabel.innerText = 'A to Z'
                sortDesLabel.innerText = 'Z to A'
                
                newArray.sort((elem1, elem2) => {
                    // console.log(elem2.querySelector('.unedit-subject').innerText)
                    const subject1 = elem1.querySelector('.unedit-subject').innerText;
                    const subject2 = elem2.querySelector('.unedit-subject').innerText;
                    // console.log('inn')
                    return toggleAndReturn(order, subject1, subject2, true)
                }); break;
                
            case 'favorite':
                sortAscLabel.innerText = 'Favorite first'
                sortDesLabel.innerText = 'Favorite last'

                newArray.sort((elem1, elem2) => {
                    // console.log(elem1.querySelector('.star-logo').src.includes('gold'))
                    const fav1 = elem1.querySelector('.star-logo').src.includes('gold') ? 0: 1;
                    const fav2 = elem2.querySelector('.star-logo').src.includes('gold') ? 0: 1;
                    return toggleAndReturn(order, fav1, fav2)
                }); break;
        }
        notesContainer.innerHTML = ''
        newArray.forEach(elem => notesContainer.appendChild(elem))
    }

    function toggleAndReturn(order, a, b, string=false){
        switch (order){
            case 'asc':
                sortDes.checked = false
                sortAsc.checked = true
                if (string){
                    return a.localeCompare(b)
                }
                return a - b; break;
            case 'des':
                sortAsc.checked = false
                sortDes.checked = true
                if (string){
                    return b.localeCompare(a)
                }
                return b - a; break;
        }
    }

    function highlight(text, word){
        let lowerText = text.toLowerCase();
        word = word.toLowerCase();
        if (word.length > 0){
            let start = 0
            let indecies = []
            while (lowerText.indexOf(word, start) != -1){
                indecies.push(lowerText.indexOf(word, start))
                console.log(lowerText.indexOf(word, start))
                start = lowerText.indexOf(word, start) + 1
            }
    
            const opening = '<span class="highlight">'
            const closing = '</span>'
            
            let newText = text
            let incrementor = 0
            
            let secondIter = 0
            for (let ind of indecies){
                // console.log(ind)
                let ind1 = ind + incrementor
                // console.log(ind1)
                let ind2 = word.length + ind1
                if (secondIter){
                    if (newText.slice(0, ind1)[newText.slice(0, ind1).length - 1] != '>'){
                        incrementor += (word.length-1)
                        ind1 = ind + incrementor
                        ind2 = word.length + ind1
                    }
                }
                else {
                    secondIter++
                }
                const a = newText.slice(0, ind1)
                console.log('a:', a, ind1)
                const b = newText.slice(ind1, ind2)
                console.log('b:', b, b.length)
                const c = newText.slice(ind2)
                console.log('c:', c, ind2)
                newText = a + opening + b + closing + c
                console.log('all:', newText)
                
                incrementor += (opening + closing).length
            }
            return newText
        }
        return lowerText
    }

    function unHighlight(element){
        for (let span of element.querySelectorAll('.highlight')){
            const spanTextNode = document.createTextNode(span.innerText)
            element.replaceChild(spanTextNode, span)
        }
    }
    
    // console.log(highlight('aa a aa a aaaa a', 'a'))

    // console.log(putBrackets('My name is Ziyad', 3, 7))
    // console.log(insertAt('hello my friends', '!', 6))


    // const noteForm = document.querySelector('.note-form')

    function createNote(noteObj, pk, newEntry=false){
        const noteElement = document.createElement('div')
        noteElement.className = 'note-element'
        noteElement.setAttribute('style', 'display: block;')

        const noteSubject = document.createElement('div')
        noteSubject.className = 'note-subject'

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
        cDateText.id = `c${noteObj.created_at}`
        cDateText.innerText = prettyDate(noteObj.created_at)

        // const d = new Date(noteObj.created_at)
        // console.log(d)
        
        const updatedSpan = document.createElement('span')
        updatedSpan.className = 'updated-span'
        updatedSpan.innerText = 'Updated at: '
        
        const uDateText = document.createElement('span')
        uDateText.className = 'date-text'
        uDateText.id = `u${noteObj.updated_at}`
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