// DOM Elements
const songForm = document.getElementById('songForm');
const songIdInput = document.getElementById('songId');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const coverUrlInput = document.getElementById('cover_url');
const audioUrlInput = document.getElementById('audio_url');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const formMsg = document.getElementById('formMsg');

const songsTableBody = document.getElementById('songsTableBody');
const tableLoader = document.getElementById('tableLoader');

let songsList = [];
let isEditing = false;

// Fetch Songs for Admin Table
async function fetchAdminSongs() {
  tableLoader.style.display = 'block';
  songsTableBody.innerHTML = '';
  
  try {
    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    songsList = data;
    renderTable(songsList);
  } catch (error) {
    console.error('Error fetching songs:', error.message);
    songsTableBody.innerHTML = `<tr><td colspan="5" style="color: red; text-align: center;">Failed to load songs.</td></tr>`;
  } finally {
    tableLoader.style.display = 'none';
  }
}

// Render Table
function renderTable(songs) {
  songsTableBody.innerHTML = '';
  
  if (songs.length === 0) {
    songsTableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No songs found. Add one above!</td></tr>`;
    return;
  }

  songs.forEach(song => {
    const date = new Date(song.created_at).toLocaleDateString();
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${song.title}</strong></td>
      <td>${song.artist}</td>
      <td>${song.album || '-'}</td>
      <td>${date}</td>
      <td>
        <div class="actions">
          <button class="btn btn-secondary" onclick="editSong('${song.id}')" style="padding: 6px 12px; font-size: 13px;">Edit</button>
          <button class="btn btn-danger" onclick="deleteSong('${song.id}')" style="padding: 6px 12px; font-size: 13px;">Delete</button>
        </div>
      </td>
    `;
    songsTableBody.appendChild(tr);
  });
}

// Form Submit (Add / Update)
songForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  submitBtn.disabled = true;
  submitBtn.textContent = isEditing ? 'Updating...' : 'Adding...';
  formMsg.textContent = '';
  formMsg.style.color = 'var(--text-primary)';

  const songData = {
    title: titleInput.value.trim(),
    artist: artistInput.value.trim(),
    album: albumInput.value.trim() || null,
    cover_url: coverUrlInput.value.trim() || null,
    audio_url: audioUrlInput.value.trim()
  };

  try {
    if (isEditing) {
      const id = songIdInput.value;
      const { error } = await supabaseClient
        .from('songs')
        .update(songData)
        .eq('id', id);
        
      if (error) throw error;
      
      formMsg.textContent = 'Song updated successfully!';
      formMsg.style.color = '#4CAF50';
    } else {
      const { error } = await supabaseClient
        .from('songs')
        .insert([songData]);
        
      if (error) throw error;
      
      formMsg.textContent = 'Song added successfully!';
      formMsg.style.color = '#4CAF50';
    }
    
    resetForm();
    fetchAdminSongs();
    
    setTimeout(() => {
      formMsg.textContent = '';
    }, 3000);
    
  } catch (error) {
    console.error('Error saving song:', error.message);
    formMsg.textContent = 'Error saving song: ' + error.message;
    formMsg.style.color = '#ff3333';
  } finally {
    submitBtn.disabled = false;
  }
});

// Edit Song
window.editSong = (id) => {
  const song = songsList.find(s => s.id === id);
  if (!song) return;
  
  isEditing = true;
  formTitle.textContent = 'Edit Song';
  submitBtn.textContent = 'Update Song';
  cancelBtn.style.display = 'block';
  
  songIdInput.value = song.id;
  titleInput.value = song.title;
  artistInput.value = song.artist;
  albumInput.value = song.album || '';
  coverUrlInput.value = song.cover_url || '';
  audioUrlInput.value = song.audio_url;
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Delete Song
window.deleteSong = async (id) => {
  if (!confirm('Are you sure you want to delete this song?')) return;
  
  try {
    const { error } = await supabaseClient
      .from('songs')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    fetchAdminSongs();
  } catch (error) {
    console.error('Error deleting song:', error.message);
    alert('Error deleting song: ' + error.message);
  }
};

// Cancel Edit
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  isEditing = false;
  songForm.reset();
  songIdInput.value = '';
  formTitle.textContent = 'Add New Song';
  submitBtn.textContent = 'Add Song';
  cancelBtn.style.display = 'none';
}

// Initialize
fetchAdminSongs();
