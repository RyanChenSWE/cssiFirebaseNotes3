let googleUserId; 
let deleteArray = []; 
let noteTitleArray = []; 
let archivedNotes = []; 

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        console.log('Logged in as: ' + user.displayName);
        googleUserId = user.uid;
        getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html'; 
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

const renderDataAsHtml = (data) => {
  let cards = ``;
  for(const noteId in data) {
    const note = data[noteId];    
    // For each note create an HTML card
    noteTitleArray.push([note.title, note, noteId])
    noteTitleArray.sort()
  };

  for (const noteData in noteTitleArray) {
    cards += createCard(noteTitleArray[noteData][1], noteTitleArray[noteData][2])  
  };

  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (note, noteId) => {
    return `
     <div id="${noteId}" class="column is-one-quarter">
       <div class="card">
         <header class="card-header">
           <p class="card-header-title">${note.title}</p>
         </header>
         <div class="card-content">
           <div class="content">${note.text}</div>
         </div>
         <footer class="card-footer">
            <a id="${"Delete" + noteId}" href="#" class="card-footer-item" onclick="deleteNote('${noteId}')">Archive</a>
            <a href="#" class="card-footer-item" onclick="editNote('${noteId}')">Edit</a>
         </footer>
       </div>
     </div>
   `;
};

function editNote(noteId) {
    const editNoteModal = document.querySelector("#editNoteModal");
    
    const notesRef = firebase.database().ref(`users/${googleUserId}/${noteId}`)
    notesRef.on('value', (snapshot) => {
        const note = snapshot.val(); 
        document.querySelector('#editTitleInput').value = note.title; 
        document.querySelector('#editTextInput').value = note.text; 
        document.querySelector('#noteId').value = noteId; 
    });
    
    editNoteModal.classList.toggle('is-active');
}

function deleteNote(noteId) {
    const deleteButton = document.querySelector(`#${"Delete" + noteId}`);
    if (deleteArray.includes(`${noteId} delete`)) {
        // firebase.database().ref(`users/${googleUserId}/${noteId}`).remove();
        const note = document.getElementById(noteId);
        note.style.display = "none"; 
        archivedNotes.push(note);
    } else {
        deleteArray.push(`${noteId} delete`); 
        deleteButton.innerHTML = "Sure?";
    }
}

function showArchived() {
    for (note in noteTitleArray) {
        let noteId = document.getElementById(noteTitleArray[note][2]);
        noteId.style.display = "none";  
    }

    for (archivedNote in archivedNotes) {
        archivedNotes[archivedNote].style.display = ""; 
    }
}

function showUnarchived() {
    for (note in noteTitleArray) {
        let noteId = document.getElementById(noteTitleArray[note][2]);
        noteId.style.display = "";  
    }

    for (archivedNote in archivedNotes) {
        archivedNotes[archivedNote].style.display = "none"; 
    }
}

function saveEditedNote() {
    const title = document.querySelector('#editTitleInput').value;
    const text = document.querySelector('#editTextInput').value; 
    const noteId = document.querySelector('#noteId').value; 
    const editedNote = { title, text };
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(editedNote); 
    closeEditModal(); 
}

function closeEditModal() {
    const editNoteModal = document.querySelector("#editNoteModal");
    editNoteModal.classList.toggle('is-active');
}
