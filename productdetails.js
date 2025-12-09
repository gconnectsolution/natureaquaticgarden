// thumbs -> change main image
document.querySelectorAll('.thumb').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    document.querySelectorAll('.thumb').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    const src = btn.dataset.src;
    const main = document.getElementById('mainImage');
    if(main && src) main.src = src;
  });
});

// favorite toggle
const favBtn = document.getElementById('favBtn');
favBtn && favBtn.addEventListener('click', ()=>{
  if(favBtn.classList.contains('fav-active')){
    favBtn.classList.remove('fav-active');
    favBtn.textContent = '♡';
  } else {
    favBtn.classList.add('fav-active');
    favBtn.textContent = '♥';
  }
});

// quantity controls
let qty = 1;
const qtyValue = document.getElementById('qtyValue');
const plus = document.getElementById('qtyPlus');
const minus = document.getElementById('qtyMinus');

plus && plus.addEventListener('click', ()=>{
  qty++;
  qtyValue.textContent = qty;
});
minus && minus.addEventListener('click', ()=>{
  qty = Math.max(0, qty - 1);
  qtyValue.textContent = qty;
});

// Buy now action
const buyBtn = document.getElementById('buyNow');
buyBtn && buyBtn.addEventListener('click', () => {
  alert(`Proceeding to buy ${qty} item(s).`);
});

// Pincode verify (simple client-side mock)
const verifyBtn = document.getElementById('verifyPin');
verifyBtn && verifyBtn.addEventListener('click', ()=>{
  const pin = document.getElementById('pincode').value.trim();
  if(!pin || !/^\d{6}$/.test(pin)){
    alert('Enter a valid 6-digit pincode');
    return;
  }
  // Simple demo: accept some pincodes
  const deliverable = ['560001','560002','500000']; // demo
  if(deliverable.includes(pin)){
    alert('Delivery available to this pincode');
  } else {
    alert('Delivery not available to this pincode');
  }
});

const accountBtn = document.querySelector('.account-button');
const accountDropdown = document.querySelector('.account-dropdown');

accountBtn.addEventListener('mouseenter', () => {
  accountDropdown.classList.add('show');
});

accountBtn.addEventListener('mouseleave', () => {
  setTimeout(() => {
    if (!accountDropdown.matches(':hover')) {
      accountDropdown.classList.remove('show');
    }
  }, 150);
});

accountDropdown.addEventListener('mouseleave', () => {
  accountDropdown.classList.remove('show');
});
