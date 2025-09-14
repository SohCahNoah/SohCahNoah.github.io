// Render a single project card from JSON
function renderCard(p) {
  const imgHtml = p.image
    ? `<a class="card-media" href="${p.demo_url || p.repo_url || '#'}" target="_blank" rel="noopener">
         <img src="${p.image}" alt="${p.title} preview">
       </a>`
    : `<a class="card-media" href="${p.demo_url || p.repo_url || '#'}" target="_blank" rel="noopener" aria-label="${p.title}"></a>`;

  const linkTarget = p.repo_url || p.demo_url || '#';
  const tags = Array.isArray(p.tags) ? p.tags : [];
  const dataTags = [...tags, ...(Array.isArray(p.tech) ? p.tech : [])].join(' ').toLowerCase();

  return `
    <article class="card" data-tags="${dataTags}">
      ${imgHtml}
      <div class="card-body">
        <h3 class="card-title">
          <a href="${linkTarget}" target="_blank" rel="noopener">${p.title}</a>
        </h3>
        <p class="card-text">${p.description || ''}</p>
        <div class="card-tags">
          ${tags.map(t => `<span>${t}</span>`).join('')}
        </div>
      </div>
    </article>
  `;
}

// Inject cards into the grid
function populateGrid(projects) {
  const grid = document.getElementById('projectGrid');
  if (!grid) return;
  grid.innerHTML = projects.map(renderCard).join('');
}

// Search across title, description, tags, tech (live filter)
function setupSearch(inputId) {
  const input = document.getElementById(inputId);
  const grid = document.getElementById('projectGrid');
  if (!input || !grid) return;

  const filter = () => {
    const q = (input.value || '').toLowerCase().trim();
    const cards = Array.from(grid.querySelectorAll('.card'));
    for (const card of cards) {
      const text = [
        card.querySelector('.card-title')?.innerText || '',
        card.querySelector('.card-text')?.innerText || '',
        card.dataset.tags || ''
      ].join(' ').toLowerCase();
      card.style.display = text.includes(q) ? '' : 'none';
    }
  };

  input.addEventListener('input', filter);
}

// Mobile nav
function setupMobileNav() {
  const btn = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
  });
}

function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

// Fetch projects.json and render
async function loadProjects() {
  const status = document.getElementById('projectStatus');
  try {
    const res = await fetch('/projects.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Optional: sort by title asc
    data.sort((a, b) => a.title.localeCompare(b.title));

    populateGrid(data);
    setupSearch('projectSearch');

    if (status) status.textContent = `${data.length} project${data.length === 1 ? '' : 's'}`;
  } catch (err) {
    console.error('Failed to load projects.json:', err);
    if (status) status.textContent = 'Could not load projects.json';
    populateGrid([]); // clear
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setYear();
  loadProjects();
});
