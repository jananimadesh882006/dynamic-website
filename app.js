let songs = [];
let currentSongIndex = -1;
let isPlaying = false;

// DOM Elements
const songGrid = document.getElementById('songGrid');
const loadingIndicator = document.getElementById('loadingIndicator');
const searchInput = document.getElementById('searchInput');

// Player Elements
const audioPlayer = document.getElementById('audioPlayer');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumeLevel = document.getElementById('volumeLevel');
const volumeIcon = document.getElementById('volumeIcon');

// Initialize
async function fetchSongs() {
  try {
    const { data, error } = await supabaseClient
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    songs = data;
    renderSongs(songs);
  } catch (error) {
    console.error('Error fetching songs:', error.message);
    songGrid.innerHTML = `<p style="color: red; grid-column: 1/-1;">Failed to load songs. Please check your Supabase connection.</p>`;
  } finally {
    loadingIndicator.style.display = 'none';
  }
}

// Render Songs
function renderSongs(songsToRender) {
  songGrid.innerHTML = '';
  
  if (songsToRender.length === 0) {
    songGrid.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1/-1;">No songs found.</p>`;
    return;
  }

  songsToRender.forEach((song, index) => {
    // Find original index in full array for playing
    const originalIndex = songs.findIndex(s => s.id === song.id);
    
    const card = document.createElement('div');
    card.className = 'song-card';
    card.onclick = () => playSong(originalIndex);
    
    card.innerHTML = `
      <div class="cover-container">
        <img src="${song.cover_url || 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=400'}" alt="${song.title}" loading="lazy">
        <div class="play-overlay">
          <span class="material-icons">${currentSongIndex === originalIndex && isPlaying ? 'pause' : 'play_arrow'}</span>
        </div>
      </div>
      <div class="song-info">
        <div class="title">${song.title}</div>
        <div class="artist">${song.artist}</div>
        <div class="album">${song.album || 'Unknown Album'}</div>
      </div>
    `;
    songGrid.appendChild(card);
  });
}

// Search Functionality
searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  const filtered = songs.filter(song => 
    song.title.toLowerCase().includes(term) || 
    song.artist.toLowerCase().includes(term) ||
    (song.album && song.album.toLowerCase().includes(term))
  );
  renderSongs(filtered);
});

// Player Logic
function playSong(index) {
  if (index < 0 || index >= songs.length) return;
  
  const song = songs[index];
  
  if (currentSongIndex === index) {
    togglePlay();
    return;
  }
  
  currentSongIndex = index;
  
  // Update Player UI
  audioPlayer.src = song.audio_url;
  playerTitle.textContent = song.title;
  playerArtist.textContent = song.artist;
  playerCover.src = song.cover_url || 'https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=100';
  playerCover.style.opacity = '1';
  
  // Play
  audioPlayer.play();
  isPlaying = true;
  updatePlayButton();
  renderSongs(songs); // Re-render to update play overlays
}

function togglePlay() {
  if (currentSongIndex === -1) return;
  
  if (isPlaying) {
    audioPlayer.pause();
  } else {
    audioPlayer.play();
  }
  isPlaying = !isPlaying;
  updatePlayButton();
  renderSongs(songs); // Update overlays
}

function updatePlayButton() {
  playBtn.innerHTML = `<span class="material-icons">${isPlaying ? 'pause' : 'play_arrow'}</span>`;
}

function playNext() {
  let next = currentSongIndex + 1;
  if (next >= songs.length) next = 0; // Loop back
  playSong(next);
}

function playPrev() {
  // If playing for more than 3 seconds, restart song
  if (audioPlayer.currentTime > 3) {
    audioPlayer.currentTime = 0;
    return;
  }
  let prev = currentSongIndex - 1;
  if (prev < 0) prev = songs.length - 1; // Loop to end
  playSong(prev);
}

// Event Listeners for Player
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);
audioPlayer.addEventListener('ended', playNext);

// Progress Bar
audioPlayer.addEventListener('timeupdate', () => {
  if (!isNaN(audioPlayer.duration)) {
    const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progress.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
  }
});

audioPlayer.addEventListener('loadedmetadata', () => {
  durationTimeEl.textContent = formatTime(audioPlayer.duration);
});

progressBar.addEventListener('click', (e) => {
  if (currentSongIndex === -1) return;
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  const duration = audioPlayer.duration;
  audioPlayer.currentTime = (clickX / width) * duration;
});

// Volume Control
volumeSlider.addEventListener('click', (e) => {
  const width = volumeSlider.clientWidth;
  const clickX = e.offsetX;
  const volume = clickX / width;
  audioPlayer.volume = volume;
  volumeLevel.style.width = `${volume * 100}%`;
  updateVolumeIcon(volume);
});

function updateVolumeIcon(vol) {
  if (vol === 0) volumeIcon.textContent = 'volume_off';
  else if (vol < 0.5) volumeIcon.textContent = 'volume_down';
  else volumeIcon.textContent = 'volume_up';
}

// Utility
function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Start
fetchSongs();
