const $ = sel => document.querySelector(sel);
const format = (v) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(v);

let items = [];
let currentModalItem = null;

async function loadData(){
  try{
    const res = await fetch('data.json');
    items = await res.json();
    populateCategories();
    render(items);
  }catch(e){
    document.getElementById('catalog').innerHTML = '<p>Gagal memuat data katalog.</p>';
    console.error(e);
  }
}

function populateCategories(){
  const cats = Array.from(new Set(items.map(i=>i.category)));
  const sel = $('#category');
  cats.forEach(c=>{
    const o = document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o);
  });
}

function render(list){
  const root = $('#catalog'); root.innerHTML='';
  if(list.length===0){ root.innerHTML='<p>Tidak ada produk yang cocok.</p>'; return }
  list.forEach((item, idx)=>{
    const el = document.createElement('article'); el.className='card fade-in';
    const icon = iconForCategory(item.category);
    el.innerHTML = `
      <img src="${item.image}" alt="${item.title}" loading="lazy">
      <div class="card-body">
        <div class="card-head">
          <div class="service-icon">${icon}</div>
          <div>
            <h3 class="card-title">${item.title}</h3>
            ${idx===0?'<div style="margin-top:6px"><span class="badge">Popular</span></div>':''}
          </div>
        </div>
        <div class="card-meta">${item.category}</div>
        <div class="price">${item.priceText ? item.priceText : format(item.price)}</div>
        <div class="card-actions">
          <button class="btn view" data-id="${item.id}">Lihat</button>
          <button class="btn secondary" data-id="${item.id}">Beli</button>
        </div>
      </div>`;
    root.appendChild(el);
  });

  root.querySelectorAll('.btn.view').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; openModal(items.find(i=>i.id==id));
  }));
}

function iconForCategory(cat){
  const c = (cat||'').toLowerCase();
  if(c.includes('jaringan')||c.includes('network')||c.includes('server')){
    return `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 13h4v-2H3v2zM17 13h4v-2h-4v2zM11 13h2v-2h-2v2z" fill="#0b84c9"/><path d="M7 17h10v-2H7v2zM7 9h10V7H7v2z" fill="#06a6e0"/></svg>`;
  }
  if(c.includes('maintenance')||c.includes('service')||c.includes('perawatan')){
    return `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 7l-6 6" stroke="#0b84c9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 21l6-6" stroke="#06a6e0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 3l7 7" stroke="#0b84c9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }
  if(c.includes('cctv')||c.includes('keamanan')||c.includes('camera')){
    return `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="16" height="10" rx="2" stroke="#0b84c9" stroke-width="1.6"/><path d="M22 7l-6 3v4l6 3V7z" fill="#06a6e0"/></svg>`;
  }
  if(c.includes('website')||c.includes('web')||c.includes('desain')){
    return `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="14" rx="2" stroke="#0b84c9" stroke-width="1.6"/><path d="M7 20h10" stroke="#06a6e0" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }
  // default icon
  return `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#0b84c9" stroke-width="1.6"/><path d="M8 12h8" stroke="#06a6e0" stroke-width="1.6" stroke-linecap="round"/></svg>`;
}

function applyFilters(){
  const q = $('#search').value.trim().toLowerCase();
  const cat = $('#category').value;
  let out = items.filter(i=>{
    if(cat!=='all' && i.category!==cat) return false;
    if(!q) return true;
    return (i.title + ' ' + (i.description||'')).toLowerCase().includes(q);
  });

  const sort = $('#sort').value;
  if(sort==='price-asc') out.sort((a,b)=>a.price-b.price);
  if(sort==='price-desc') out.sort((a,b)=>b.price-a.price);
  if(sort==='title-asc') out.sort((a,b)=>a.title.localeCompare(b.title));

  render(out);
}

function openModal(item){
  if(!item) return;
  currentModalItem = item;
  $('#modal-image').src = item.image;
  $('#modal-image').alt = item.title;
  $('#modal-title').textContent = item.title;
  $('#modal-desc').textContent = item.description || '';
  $('#modal-price').textContent = item.priceText ? item.priceText : format(item.price);
  // add or update estimate inside modal-right
  const existing = document.getElementById('modal-estimate');
  if(item.estimate){
    if(existing){ existing.textContent = 'Estimasi Waktu: ' + item.estimate; }
    else{
      const p = document.createElement('p'); p.id='modal-estimate'; p.className='card-meta'; p.textContent = 'Estimasi Waktu: ' + item.estimate;
      const right = document.querySelector('.modal-right'); if(right) right.appendChild(p);
    }
  } else if(existing){ existing.remove(); }
  // set buy button data
  const buyBtn = document.getElementById('modal-buy'); if(buyBtn) buyBtn.dataset.id = item.id;
  const modal = $('#modal'); modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  const modal = $('#modal'); modal.setAttribute('aria-hidden','true');
}

document.addEventListener('DOMContentLoaded', ()=>{
  loadData();
  $('#search').addEventListener('input', debounce(applyFilters,220));
  $('#category').addEventListener('change', applyFilters);
  $('#sort').addEventListener('change', applyFilters);
  $('#modal-close').addEventListener('click', closeModal);
  const modalBuy = document.getElementById('modal-buy');
  if(modalBuy){
    modalBuy.addEventListener('click', ()=>{
      closeModal();
      const form = document.getElementById('contact-form');
      if(form){
        form.message.value = `Saya tertarik membeli: ${currentModalItem ? currentModalItem.title : ''}`;
        window.location.hash = '#contact';
        form.name.focus();
      }
    });
  }
  const modalContact = document.getElementById('modal-contact');
  if(modalContact){
    modalContact.addEventListener('click', ()=>{
      closeModal();
      window.location.hash = '#contact';
      const form = document.getElementById('contact-form'); if(form) form.message.focus();
    });
  }
  $('#modal').addEventListener('click', e=>{ if(e.target===e.currentTarget) closeModal(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
  // Contact form handling
  const form = document.getElementById('contact-form');
  if(form){
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = $('#contact-status');
      status.textContent = 'Mengirim...';
      const data = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        message: form.message.value.trim()
      };
      // If form has a data-endpoint attribute, try to POST to it (e.g., Formspree)
      const endpoint = form.getAttribute('data-endpoint');
      try{
        if(endpoint){
          const res = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
          if(res.ok){ status.textContent = 'Terima kasih — pesan Anda telah diterima.'; form.reset(); }
          else { status.textContent = 'Gagal mengirim. Silakan coba lewat email atau telepon.' }
        }else{
          // Simulate send when no endpoint configured
          await new Promise(r=>setTimeout(r,700));
          status.textContent = 'Terima kasih — pesan Anda telah diterima. Kami akan menghubungi Anda segera.';
          form.reset();
        }
      }catch(err){
        console.error(err); status.textContent = 'Terjadi kesalahan saat mengirim. Silakan coba kembali nanti.';
      }
    });
  }
  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  if(navToggle){ navToggle.addEventListener('click', ()=>{ document.body.classList.toggle('nav-open'); }); }
});

function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); } }
