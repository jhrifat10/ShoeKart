const DATA_URL = 'products.json';
const STORAGE_KEY = 'shk_admin_products_v1';
let products = [];

function uid(){return Math.random().toString(36).slice(2,9)}

async function loadInitial(){
  try{
    const resp = await fetch(DATA_URL);
    if(resp.ok){
      const initial = await resp.json();
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      products = stored && Array.isArray(stored) ? stored : initial;
    } else {
      products = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }
  }catch(e){
    products = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }
}

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }

function render(){
  const tbody = document.getElementById('products-tbody');
  tbody.innerHTML = '';
  products.forEach(p=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${escapeHtml(p.title)}</td>
      <td>${escapeHtml(p.category||'')}</td>
      <td>Tk ${Number(p.price).toFixed(2)}</td>
      <td>${p.stock}</td>
      <td>
        <button class="action-btn" data-id="${p.id}" data-action="edit">Edit</button>
        <button class="action-btn" data-id="${p.id}" data-action="delete">Delete</button>
      </td>`;
    tbody.appendChild(tr);
  })
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#39;"
  }[c]))
}

function bind(){
  const form = document.getElementById('product-form');
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const id = document.getElementById('product-id').value || uid();
    const prod = {
      id,
      title: document.getElementById('title').value.trim(),
      category: document.getElementById('category').value.trim(),
      price: Number(document.getElementById('price').value) || 0,
      stock: Number(document.getElementById('stock').value) || 0,
      image: document.getElementById('image').value.trim()
    };
    const idx = products.findIndex(x=>x.id===id);
    if(idx>=0) products[idx]=prod; else products.unshift(prod);
    save(); render(); form.reset(); document.getElementById('product-id').value='';
  })

  document.getElementById('reset-btn').addEventListener('click',()=>{
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value='';
  })

  document.getElementById('products-tbody').addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id; const action = btn.dataset.action;
    if(action==='delete'){
      if(!confirm('Delete product?')) return;
      products = products.filter(p=>p.id!==id); save(); render();
    }
    if(action==='edit'){
      const p = products.find(x=>x.id===id); if(!p) return;
      document.getElementById('product-id').value = p.id;
      document.getElementById('title').value = p.title || '';
      document.getElementById('category').value = p.category || '';
      document.getElementById('price').value = p.price || 0;
      document.getElementById('stock').value = p.stock || 0;
      document.getElementById('image').value = p.image || '';
      window.scrollTo({top:0,behavior:'smooth'});
    }
  })

  document.getElementById('export-btn').addEventListener('click', ()=>{
    const b = JSON.stringify(products, null, 2);
    const blob = new Blob([b],{type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href=url; 
    a.download='shk-products.json'; 
    a.click(); 
    URL.revokeObjectURL(url);
  })
}

(async function(){
  await loadInitial(); bind(); render();
})();
