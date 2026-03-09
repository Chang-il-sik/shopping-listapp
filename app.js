// Created: 2026-03-09

const STORAGE_KEY = 'shopping_list';

let items = loadItems();

const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');
const summary = document.getElementById('summary');
const clearCheckedBtn = document.getElementById('clearCheckedBtn');

function loadItems() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
  itemList.innerHTML = '';

  if (items.length === 0) {
    itemList.innerHTML = '<li class="empty-msg">아이템을 추가해 보세요!</li>';
    summary.textContent = '';
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement('li');
    if (item.checked) li.classList.add('checked');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = item.checked;
    checkbox.addEventListener('change', () => toggleItem(index));

    const span = document.createElement('span');
    span.className = 'item-text';
    span.textContent = item.text;

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.textContent = '✕';
    delBtn.title = '삭제';
    delBtn.addEventListener('click', () => deleteItem(index));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    itemList.appendChild(li);
  });

  const total = items.length;
  const checked = items.filter(i => i.checked).length;
  summary.textContent = `${checked} / ${total} 완료`;
}

function addItem() {
  const text = itemInput.value.trim();
  if (!text) {
    itemInput.focus();
    return;
  }
  items.push({ text, checked: false });
  saveItems();
  render();
  itemInput.value = '';
  itemInput.focus();
}

function toggleItem(index) {
  items[index].checked = !items[index].checked;
  saveItems();
  render();
}

function deleteItem(index) {
  items.splice(index, 1);
  saveItems();
  render();
}

function clearChecked() {
  items = items.filter(i => !i.checked);
  saveItems();
  render();
}

addBtn.addEventListener('click', addItem);
itemInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addItem();
});
clearCheckedBtn.addEventListener('click', clearChecked);

render();
