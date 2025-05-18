import { saveStoryToSaved } from '../utils/idb-helper';
class StoryItem extends HTMLElement {
  constructor(story) {
    super();
    this._story = story;
  }

  connectedCallback() {
    this.render();
    this._setupEventListeners();
  }

  render() {
    const userId = localStorage.getItem('userId');
    const isCurrentUserStory = this._story.userId === userId;
    const isLoggedIn = localStorage.getItem('token') !== null;

    const thumbnailSrc = typeof this._story.photoUrl === 'string'
      ? this._story.photoUrl
      : URL.createObjectURL(this._story.photoUrl);

    const element = document.createElement('div');
    element.innerHTML = `
      <article class="story-item">
        <img class="story-item__thumbnail" 
             src="${thumbnailSrc}" 
             alt="Gambar cerita dari ${this._story.name}"
             loading="lazy">
        <div class="story-item__content">
          <h3 class="story-item__title">
            <a href="#/detail/${this._story.id}">${this._story.name}</a>
          </h3>
          <p class="story-item__description">
            ${this._story.description ? this._story.description.substring(0, 100) : ''}...
          </p>
          <div class="story-item__meta">
            <p class="story-item__date">
              <i class="far fa-calendar-alt"></i> 
              ${new Date(this._story.createdAt).toLocaleDateString()}
            </p>
            ${this._story.lat && this._story.lon ? `
              <p class="story-item__location">
                <i class="fas fa-map-marker-alt"></i> 
                ${parseFloat(this._story.lat).toFixed(4)}, ${parseFloat(this._story.lon).toFixed(4)}
              </p>
            ` : ''}
          </div>
          <div class="story-item__actions">
            ${isLoggedIn ? `
              <button class="save-story-btn" data-id="${this._story.id}">
                <i class="far fa-bookmark"></i> Simpan
              </button>
            ` : ''}
            ${isCurrentUserStory ? `
              <a href="#/edit-story/${this._story.id}" class="edit-story-btn">
                <i class="far fa-edit"></i> Edit
              </a>
            ` : ''}
          </div>
        </div>
      </article>
    `;

    this.innerHTML = '';
    this.appendChild(element.firstElementChild);
  }

  _setupEventListeners() {
    const saveBtn = this.querySelector('.save-story-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        await this._handleSaveStory();
      });
    }
  }

  async _handleSaveStory() {
    try {
      const saveBtn = this.querySelector('.save-story-btn');
      saveBtn.innerHTML = '<i class="fas fa-check"></i> Tersimpan';
      saveBtn.disabled = true;

      // Simpan ke IndexedDB
      await saveStoryToSaved(this._story);

      // Tampilkan notifikasi sukses
      this._showToast('Cerita berhasil disimpan');
    } catch (error) {
      this._showToast('Gagal menyimpan cerita', true);
      console.error('Save error:', error);
    }
  }

  _showToast(message, isError = false) {
    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'error' : ''}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
}

customElements.define('story-item', StoryItem);
export default StoryItem;
