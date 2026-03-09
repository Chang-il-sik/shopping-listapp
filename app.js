// Created: 2026-03-09

const SUPABASE_URL = 'https://fizelvehpmzztijpmlbx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpemVsdmVocG16enRpanBtbGJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMjQ3NTgsImV4cCI6MjA4ODYwMDc1OH0.n_lRq4GCwoy1IxeJywp8kd6ovvGt2yF3eTx-uKraTKA';

const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');
const summary = document.getElementById('summary');
const clearCheckedBtn = document.getElementById('clearCheckedBtn');

let items = [];

async function apiFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error: ${err}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function loadItems() {
  const data = await apiFetch('shopping_items?order=created_at.asc');
  items = data || [];
  render();
}

async function addItem() {
  const text = itemInput.value.trim();
  if (!text) { itemInput.focus(); return; }

  const [newItem] = await apiFetch('shopping_items', {
    method: 'POST',
    body: JSON.stringify({ text, checked: false }),
  });
  items.push(newItem);
  render();
  itemInput.value = '';
  itemInput.focus();
}

async function toggleItem(id) {
  const item = items.find(i => i.id === id);
  const [updated] = await apiFetch(`shopping_items?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ checked: !item.checked }),
  });
  const idx = items.findIndex(i => i.id === id);
  items[idx] = updated;
  render();
}

async function deleteItem(id) {
  await apiFetch(`shopping_items?id=eq.${id}`, { method: 'DELETE', headers: { 'Prefer': '' } });
  items = items.filter(i => i.id !== id);
  render();
}

async function clearChecked() {
  const checkedIds = items.filter(i => i.checked).map(i => i.id);
  if (checkedIds.length === 0) return;
  await apiFetch(`shopping_items?id=in.(${checkedIds.join(',')})`, { method: 'DELETE', headers: { 'Prefer': '' } });
  items = items.filter(i => !i.checked);
  render();
}

function render() {
  itemList.innerHTML = '';

  if (items.length === 0) {
    itemList.innerHTML = '<li class="empty-msg">아이템을 추가해 보세요!</li>';
    summary.textContent = '';
    return;
  }

  items.forEach(item => {
    const li = document.createElement('li');
    if (item.checked) li.classList.add('checked');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => toggleItem(item.id));

    const span = document.createElement('span');
    span.className = 'item-text';
    span.textContent = item.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '✕';
    delBtn.title = '삭제';
    delBtn.addEventListener('click', () => deleteItem(item.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    itemList.appendChild(li);
  });

  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  summary.textContent = `${checked} / ${total} 완료`;
}

addBtn.addEventListener('click', addItem);
itemInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addItem();
});
clearCheckedBtn.addEventListener('click', clearChecked);

loadItems();
