// simple interactions: back button and optional search toggle
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('backBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // If history available, go back, else go to products page
      if (window.history.length > 1) window.history.back();
      else window.location.href = '/products.html';
    });
  }

  // placeholder: search button behavior
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      alert('Search is not implemented in this static mock. Replace with your search UI.');
    });
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
