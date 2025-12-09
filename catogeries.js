document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href").substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      event.preventDefault();
      window.scrollTo({
        top: target.offsetTop - 90,
        behavior: "smooth",
      });
    }
  });
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
