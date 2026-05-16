function toggleSection(id) {
  const sec = document.getElementById(id);
  sec.classList.toggle('collapsed');
  const hdr = sec.querySelector('.section-header');
  hdr.setAttribute('aria-expanded', !sec.classList.contains('collapsed'));
}

const allItems = Array.from(document.querySelectorAll('.item'));
const allSections = Array.from(document.querySelectorAll('.section'));

const pills = document.querySelectorAll('.pill');
let activeFilter = 'all';

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.dataset.filter;
    applyFilters();
  });
});

const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', applyFilters);

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  let visible = 0;

  allItems.forEach(item => {
    const title   = item.dataset.title.toLowerCase();
    const cat     = item.dataset.cat;
    const catOk   = activeFilter === 'all' || cat === activeFilter;
    const queryOk = !query || title.includes(query);
    const show    = catOk && queryOk;

    item.style.display = show ? '' : 'none';
    if (show) {
      visible++;
      const titleEl = item.querySelector('.item-title');
      if (query) {
        const idx  = title.indexOf(query);
        const orig = item.dataset.title;
        if (idx !== -1) {
          titleEl.innerHTML =
            escHtml(orig.slice(0, idx)) +
            '<mark class="hl">' + escHtml(orig.slice(idx, idx + query.length)) + '</mark>' +
            escHtml(orig.slice(idx + query.length));
        }
      } else {
        titleEl.textContent = item.dataset.title;
      }
    }
  });

  allSections.forEach(sec => {
    const catOk      = activeFilter === 'all' || sec.dataset.cat === activeFilter;
    const hasVisible  = Array.from(sec.querySelectorAll('.item')).some(i => i.style.display !== 'none');
    sec.style.display = (catOk && hasVisible) ? '' : 'none';
  });

  const noR = document.getElementById('noResults');
  noR.style.display = visible === 0 ? 'flex' : 'none';
  document.getElementById('noResultsQuery').textContent = `"${query}"`;

  document.getElementById('resultCount').textContent =
    visible === 0 ? 'No results' : `${visible} activit${visible === 1 ? 'y' : 'ies'}`;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

let focusIdx = -1;
function visibleItems() {
  return allItems.filter(i => i.style.display !== 'none');
}

document.addEventListener('keydown', e => {
  const items = visibleItems();
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    focusIdx = (focusIdx + 1) % items.length;
    updateFocus(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    focusIdx = (focusIdx - 1 + items.length) % items.length;
    updateFocus(items);
  } else if (e.key === 'Enter' && focusIdx >= 0) {
    items[focusIdx].click();
  } else if (e.key === 'Escape') {
    searchInput.value = '';
    focusIdx = -1;
    applyFilters();
    searchInput.focus();
  }
});

function updateFocus(items) {
  items.forEach((it, i) => {
    it.classList.toggle('focused', i === focusIdx);
    if (i === focusIdx) it.scrollIntoView({ block: 'nearest' });
  });
}

document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});
