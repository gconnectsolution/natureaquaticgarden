/* --------------------------------------------------
   SMOOTH SCROLL FOR INTERNAL LINKS
-------------------------------------------------- */
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

/* --------------------------------------------------
   VARIABLES
-------------------------------------------------- */
const API_URL = "http://192.168.1.5:8080/seller-dashboard/getAllProducts";
let allProducts = []; // STORE ALL PRODUCTS FOR FRONTEND FILTERING



/* --------------------------------------------------
   RENDER PRODUCTS
-------------------------------------------------- */
const container = document.querySelector(".products-grid");
function renderProducts(products) {
 

  if (!container) return;
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p style='text-align:center;'>No products found.</p>";
    return;
  }

  products.forEach(prod => {

    const card = document.createElement("article");
    card.className = "product-card";

    card.addEventListener("click", () => {
        gotoProductdetailsPage(prod.name);
    });

    const pictures = typeof prod.pictures === 'string' ? prod.pictures : '';
    const firstImage = pictures ? pictures.split(",")[0].trim() : null;

    // IMAGE BOX
    const imageDiv = document.createElement("div");
    imageDiv.className = "product-image";

    const img = document.createElement("img");
    img.src = firstImage || 'assets/images/default-product.png';
    img.alt = prod.name;

    imageDiv.appendChild(img);
    card.appendChild(imageDiv);

    // TITLE
    const title = document.createElement("h3");
    title.textContent = prod.name;
    card.appendChild(title);

    // FIXED RATING
    const rating = document.createElement("div");
    rating.className = "rating";
    rating.innerHTML = "<span>★★★★★</span>";
    card.appendChild(rating);

    // PRICE
    const price = document.createElement("p");
    price.className = "product-price";
    price.innerHTML = `<span class="currency">₹</span> ${prod.price}`;
    card.appendChild(price);

    // DESCRIPTION
    const desc = document.createElement("p");
    desc.className = "product-copy";
    desc.textContent = prod.description;
    card.appendChild(desc);

    // STOCK
    const stock = document.createElement("p");
    stock.textContent = `Stock: ${prod.stock}`;
    card.appendChild(stock);

    // ADD TO CART
    const addBtnContainer = document.createElement("div");
    addBtnContainer.className = "add-btn-container";

    const addBtn = document.createElement("button");
    addBtn.textContent = "Add to Cart";
    addBtn.className = "add-btn";
    addBtnContainer.appendChild(addBtn);
    card.appendChild(addBtnContainer);

    let quantity = 0;

    addBtn.addEventListener("click", () => {
      if (quantity === 0) {
        quantity = 1;
        renderStepper();
      }
    });
    function renderStepper() {
      addBtnContainer.innerHTML = "";

      const minusBtn = document.createElement("button");
      minusBtn.textContent = "−";
      minusBtn.className = "qty-btn";

      const qtyDisplay = document.createElement("span");
      qtyDisplay.textContent = quantity;
      qtyDisplay.className = "qty-display";

      const plusBtn = document.createElement("button");
      plusBtn.textContent = "+";
      plusBtn.className = "qty-btn";

      addBtnContainer.appendChild(minusBtn);
      addBtnContainer.appendChild(qtyDisplay);
      addBtnContainer.appendChild(plusBtn);

      plusBtn.addEventListener("click", () => {
        quantity++;
        qtyDisplay.textContent = quantity;
      });

      minusBtn.addEventListener("click", () => {
        quantity--;
        if (quantity <= 0) {
          quantity = 0;
          renderAddButton();
        } else {
          qtyDisplay.textContent = quantity;
        }
      });
    }
    function renderAddButton() {
      addBtnContainer.innerHTML = "";
      addBtn.textContent = "Add to Cart";
      addBtnContainer.appendChild(addBtn);
    }
    document.querySelector(".products-grid").appendChild(card);
  });
}

function gotoProductdetailsPage(productId){
    console.log(productId);
}

/* --------------------------------------------------
   LOAD PRODUCTS ONCE
-------------------------------------------------- */
async function loadProducts() {
  const container = document.querySelector(".products-grid");
  if (!container) return;

  container.innerHTML = "<p style='text-align:center;'>Loading...</p>";

  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    allProducts = data;           // SAVE ALL PRODUCTS
    renderProducts(allProducts); // FIRST RENDER

  } catch (err) {
    console.error(err);
    container.innerHTML =
      "<p style='color:red;text-align:center;'>Failed to load products.</p>";
  }
}

/* --------------------------------------------------
   FRONTEND FILTERS
-------------------------------------------------- */
function applyFrontendFilters(minPrice, maxPrice, sortOption) {
  let filtered = [...allProducts];

  // PRICE FILTER
  filtered = filtered.filter(p => p.price >= minPrice && p.price <= maxPrice);

  // SORTING
  if (sortOption === "low-high") {
    filtered.sort((a, b) => a.price - b.price);
  }
  if (sortOption === "high-low") {
    filtered.sort((a, b) => b.price - a.price);
  }
  if (sortOption === "newest") {
    filtered.sort((a, b) => b.id - a.id);
  }

  renderProducts(filtered);
}



/* --------------------------------------------------
   FILTER PANEL UI + EVENTS
-------------------------------------------------- */
async function applyFilters() {
  const filterContainer = document.getElementById("products-filter");
  const filterBtn = document.getElementById("filter-button");

  const filterPanel = document.createElement("div");
  filterPanel.className = "filter-panel hidden";

  let selectedSortValue = "";

  // PRICE UI
  filterPanel.innerHTML = `
      <div class="filter-section">
          <label class="filter-label">Price Range</label>
          <div class="price-slider-box">
              <div class="slider-values">
                  <span>₹ <span id="priceMin">0</span></span>
                  <span>₹ <span id="priceMax">5000</span></span>
              </div>
              <div class="range-slider">
                  <input type="range" id="minRange" min="0" max="5000" value="0" />
                  <input type="range" id="maxRange" min="0" max="5000" value="5000" />
              </div>
          </div>
      </div>

      <div class="filter-section">
          <label class="filter-label">Sort By</label>
          <select id="sortSelect">
              <option value="">Select</option>
              <option value="low-high">Price: Low → High</option>
              <option value="high-low">Price: High → Low</option>
              <option value="newest">Newest First</option>
          </select>
      </div>
  `;

  filterContainer.appendChild(filterPanel);

  const sortSelect = filterPanel.querySelector("#sortSelect");
  sortSelect.addEventListener("change", e => selectedSortValue = e.target.value);

  function initSlider() {
    const minRange = document.getElementById("minRange");
    const maxRange = document.getElementById("maxRange");
    const priceMin = document.getElementById("priceMin");
    const priceMax = document.getElementById("priceMax");

    minRange.oninput = () => {
      if (+minRange.value > +maxRange.value) minRange.value = maxRange.value;
      priceMin.textContent = minRange.value;
    };

    maxRange.oninput = () => {
      if (+maxRange.value < +minRange.value) maxRange.value = minRange.value;
      priceMax.textContent = maxRange.value;
    };
  }

  // APPLY BUTTON
  const applyBtn = document.createElement("button");
  applyBtn.className = "apply-btn";
  applyBtn.textContent = "Apply";
  filterPanel.appendChild(applyBtn);

  applyBtn.addEventListener("click", () => {
    applyFrontendFilters(
      +document.getElementById("minRange").value,
      +document.getElementById("maxRange").value,
      selectedSortValue
    );
  });
  const clearBtn = document.createElement("button");
  clearBtn.className = "clear-btn";
  clearBtn.textContent = "Clear";
  filterPanel.appendChild(clearBtn);

  clearBtn.addEventListener("click", () => {
    applyFrontendFilters(
      document.getElementById("minRange").value = 0,
      document.getElementById("maxRange").value = 5000,
      selectedSortValue
    );
  });

  filterBtn.addEventListener("click", () => {
    filterPanel.classList.toggle("hidden");
    if (!filterPanel.classList.contains("hidden")) initSlider();
  });
}

/* --------------------------------------------------
   INIT
-------------------------------------------------- */
loadProducts();
applyFilters();

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
