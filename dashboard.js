/* ------------------------------
   SIDEBAR TOGGLE LOGIC
------------------------------ */

// elements
const sidebar = document.getElementById("sidebar");
const smallLogo = document.getElementById("smallLogo");
const bigLogo = document.getElementById("bigLogo");
const menuItems = document.querySelectorAll(".menu li");

// expand sidebar
smallLogo.addEventListener("click", () => {
  sidebar.classList.add("expanded");
  smallLogo.classList.add("hidden");
  bigLogo.classList.remove("hidden");
});

// collapse sidebar
bigLogo.addEventListener("click", () => {
  sidebar.classList.remove("expanded");
  bigLogo.classList.add("hidden");
  smallLogo.classList.remove("hidden");
});

// menu routes
menuItems.forEach(item => {
  item.addEventListener("click", () => {
    window.location.href = item.getAttribute("data-page");
  });
});

// remove default preview modal opening
// document.getElementById("previewModal").classList.add("active");
function closePreview() {
  document.getElementById("previewModal").classList.remove("active");
}

/* ------------------------------
   JWT, FORM, IMAGE UPLOAD
------------------------------ */

const token = sessionStorage.getItem("jwt");

let sellerId = null;
let sellerName = null;
let shopName = null;
let expiry = null;

if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    sellerId = payload.id;
    sellerName = payload.userName;
    shopName = payload.shopName;
    expiry = payload.exp * 1000;

    sessionStorage.setItem("sellerId", sellerId);
    sessionStorage.setItem("sellerName", sellerName);
    sessionStorage.setItem("shopName", shopName);
    sessionStorage.setItem("expiry", expiry);

  } catch (err) {
    console.error("Invalid token:", err);
    logout();
  }
} else {
  logout();
}

function showWelcome() {
  const welcomeText = document.getElementById("welcomeText");
  const name = sessionStorage.getItem("sellerName");
  const shop = sessionStorage.getItem("shopName");

  welcomeText.textContent =
    name && shop ? `Hello ${name}, welcome to ${shop}'s dashboard!`
                 : "Welcome, seller!";
}

function logout() {
  sessionStorage.clear();
  window.location.href = "/login.html";
}

document.getElementById("logoutBtn").addEventListener("click", logout);

/* AUTO LOGOUT */
function scheduleAutoLogout() {
  const expiry = sessionStorage.getItem("expiry");
  if (!expiry) return;

  const timeout = expiry - Date.now();
  if (timeout > 0) {
    setTimeout(() => {
      alert("Session expired. Please log in again.");
      logout();
    }, timeout);
  } else {
    logout();
  }
}

/* IMAGE UPLOAD */
async function uploadImages(files) {
  if (files.length > 4) throw new Error("Max 4 images allowed");

  for (let file of files) {
    if (file.size > 2 * 1024 * 1024)
      throw new Error("Each image must be ≤ 2MB");
  }

  const formData = new FormData();
  for (let file of files) formData.append("files", file);

  const res = await fetch("http://192.168.1.5:8080/upload/images", {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error("Image upload failed");
  return await res.json();
}

document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("message");

  try {
    const imageFiles = document.getElementById("image").files;
    const imageUrls = await uploadImages(imageFiles);

    const product = {
      name: document.getElementById("name").value,
      price: parseFloat(document.getElementById("price").value),
      description: document.getElementById("description").value,
      stock: parseInt(document.getElementById("stock").value),
      catogires: document.getElementById("category").value,
      shopName: sessionStorage.getItem("shopName"), // ✅ fixed
      pictures: imageUrls.join(",")
    };

    const res = await fetch(
      "http://192.168.1.5:8080/seller-Dashboard/addProduct",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(product)
      }
    );

    msg.textContent = await res.text();
    msg.style.color = res.ok ? "green" : "red";

  } catch (err) {
    msg.textContent = err.message || "Upload failed.";
    msg.style.color = "red";
  }
});

showWelcome();
scheduleAutoLogout();

/* ----------------------------------------
   APPLE STYLE PREVIEW (WITH ALL FIELDS)
----------------------------------------- */

function openApplePreview(files) {
  const modal = document.getElementById("applePreview");

  const detailsBox = document.getElementById("appleDetails");
  const imageGrid = document.getElementById("applePreviewGrid");

  // clear previous content
  detailsBox.innerHTML = "";
  imageGrid.innerHTML = "";

  /* 🟦 1. PRODUCT DETAILS */
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const description = document.getElementById("description").value;
  const catogeries = document.getElementById("category").value;
  const stock = document.getElementById("stock").value;
  const shop = sessionStorage.getItem("shopName"); // ✅ fixed

  detailsBox.innerHTML = `
    <p><b>Name:</b> ${name}</p>
    <p><b>Price:</b> ₹${price}</p>
    <p><b>Category:</b> ${catogeries}</p>
    <p><b>Description:</b> ${description}</p>
    <p><b>Stock:</b> ${stock}</p>
    <p><b>Shop:</b> ${shop}</p>
  `;

  /* 🟦 2. IMAGES ON RIGHT SIDE */
  [...files].forEach(file => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.style.width = "100%";
      img.style.height = "130px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "12px";
      imageGrid.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  modal.classList.add("active");
}

function closeApplePreview() {
  document.getElementById("applePreview").classList.remove("active");
}

/* Image selection triggers preview */
document.getElementById("image").addEventListener("change", function () {
  const files = this.files;

  if (files.length > 4) {
    alert("Max 4 images allowed");
    this.value = "";
    return;
  }

  for (let f of files) {
    if (f.size > 2 * 1024 * 1024) {
      alert("Each image must be ≤ 2MB");
      this.value = "";
      return;
    }
  }

  openApplePreview(files);
});