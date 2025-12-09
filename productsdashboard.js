// logout logic
function logout() {
  sessionStorage.clear();
  window.location.href = "/login.html";
}
document.getElementById("logoutBtn").addEventListener("click", logout);

//edit the product
// edit the product modal
function openEditForm(prod) {
  document.body.classList.add("modal-open");  // blur background
  const modal = document.getElementById("editModal");
  modal.style.display = "block";

  // Fill form fields with product data
  document.getElementById("editName").value = prod.name;
  document.getElementById("editPrice").value = prod.price;
  document.getElementById("editStock").value = prod.stock;
  document.getElementById("editDescription").value = prod.description;

  // Save button handler
  document.getElementById("saveEditBtn").onclick = async () => {
    const token = sessionStorage.getItem("jwt");
    const updated = {
      price: document.getElementById("editPrice").value,
      stock: document.getElementById("editStock").value,
      description: document.getElementById("editDescription").value
    };

    const formData = new FormData();
    formData.append("updated", new Blob([JSON.stringify(updated)], { type: "application/json" }));

    const res = await fetch(`http://192.168.1.5:8080/seller-dashboard/editProduct/${prod.id}`, {
      method: "PUT",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      alert("Product updated successfully");
      modal.style.display = "none";
    document.body.classList.remove("modal-open");
      loadProducts();
    } else {
      alert("Failed to update product");
    }
  };
}

// fetch and render products
async function loadProducts() {
  const container = document.getElementById("productsContainer");
  container.innerHTML = "<p>Loading products...</p>";

  try {
    const token = sessionStorage.getItem("jwt");
    const res = await fetch("http://192.168.1.5:8080/seller-dashboard/getAllProducts", {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) {
      container.innerHTML = `<p style="color:red;">Failed to load products</p>`;
      return;
    }

    const products = await res.json();
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = "<p>No products found.</p>";
      return;
    }

    products.forEach(prod => {
      const card = document.createElement("div");
      card.className = "product-card";

      // pictures stored as comma-separated URLs
      if (prod.pictures) {
        const urls = prod.pictures.split(",");
        urls.forEach(url => {
          const cleanUrl = url.trim();
          if (cleanUrl) {
            const imgWrapper = document.createElement("div");
            imgWrapper.style.position = "relative";

            const img = document.createElement("img");
            img.src = cleanUrl;
            img.style.width = "100%";
            img.style.height = "150px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "6px";
            img.style.marginBottom = "8px";

            // ✅ Delete single photo button
            const delBtn = document.createElement("button");
            delBtn.textContent = "Delete Photo";
            delBtn.style.position = "absolute";
            delBtn.style.top = "5px";
            delBtn.style.right = "5px";
            delBtn.style.fontSize = "12px";
            delBtn.style.padding = "4px 6px";

            delBtn.addEventListener("click", async () => {
              try {
                const token = sessionStorage.getItem("jwt");
                const formData = new FormData();
                formData.append("updated", new Blob([JSON.stringify({})], { type: "application/json" }));

                const res = await fetch(
                  `http://192.168.1.5:8080/seller-dashboard/editProduct/${prod.id}?photoToDelete=${encodeURIComponent(cleanUrl)}`,
                  {
                    method: "PUT",
                    headers: { "Authorization": `Bearer ${token}` },
                    body: formData
                  }
                );
                if (res.ok) {
                  alert("Photo deleted successfully");
                  loadProducts(); // reload products
                } else {
                  alert("Failed to delete photo");
                }
              } catch (err) {
                console.error(err);
                alert("Error deleting photo");
              }
            });

            imgWrapper.appendChild(img);
            imgWrapper.appendChild(delBtn);
            card.appendChild(imgWrapper);
          }
        });
      }

      const title = document.createElement("h3");
      title.textContent = prod.name;
      card.appendChild(title);

      const price = document.createElement("p");
      price.textContent = `₹${prod.price}`;
      card.appendChild(price);

      const desc = document.createElement("p");
      desc.textContent = prod.description;
      card.appendChild(desc);

      const stock = document.createElement("p");
      stock.textContent = `Stock: ${prod.stock}`;
      card.appendChild(stock);

      // ✅ Edit product button
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit Product";
      editBtn.style.marginTop = "8px";
      editBtn.addEventListener("click", () => {
        openEditForm(prod);
      });
      card.appendChild(editBtn);

      // ✅ Delete all photos button
      const delAllBtn = document.createElement("button");
      delAllBtn.textContent = "Delete All Photos";
      delAllBtn.style.marginLeft = "8px";
      delAllBtn.addEventListener("click", async () => {
        try {
          const token = sessionStorage.getItem("jwt");
          const formData = new FormData();
          formData.append("updated", new Blob([JSON.stringify({ pictures: "DELETE_ALL" })], { type: "application/json" }));

          const res = await fetch(`http://192.168.1.5:8080/seller-dashboard/editProduct/${prod.id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
          });
          if (res.ok) {
            alert("All photos deleted successfully");
            loadProducts();
          } else {
            alert("Failed to delete all photos");
          }
        } catch (err) {
          console.error(err);
          alert("Error deleting all photos");
        }
      });
      card.appendChild(delAllBtn);

      // ✅ Delete product button
const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete Product";
deleteBtn.style.marginTop = "8px";
deleteBtn.style.backgroundColor = "#f44336";
deleteBtn.style.color = "white";
deleteBtn.style.border = "none";
deleteBtn.style.padding = "6px 10px";
deleteBtn.style.borderRadius = "6px";
deleteBtn.style.cursor = "pointer";

deleteBtn.addEventListener("click", async () => {
  if (!confirm(`Are you sure you want to delete "${prod.name}"?`)) return;

  try {
    const token = sessionStorage.getItem("jwt");
    const res = await fetch(`http://192.168.1.5:8080/seller-dashboard/deleteProduct/${prod.id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (res.ok) {
      alert("Product deleted successfully");
      loadProducts(); // reload list
    } else {
      alert("Failed to delete product");
    }
  } catch (err) {
    console.error(err);
    alert("Error deleting product");
  }
});

card.appendChild(deleteBtn);

      // ✅ Add new photos input + button
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.multiple = true;
      fileInput.accept = "image/*";
      card.appendChild(fileInput);

      const uploadBtn = document.createElement("button");
      uploadBtn.textContent = "Add Photos";
      uploadBtn.style.marginLeft = "8px";
      uploadBtn.addEventListener("click", async () => {
        if (fileInput.files.length === 0) {
          alert("Please select files first");
          return;
        }
        const token = sessionStorage.getItem("jwt");
        const formData = new FormData();
        formData.append("updated", new Blob([JSON.stringify({})], { type: "application/json" }));
        for (const file of fileInput.files) {
          formData.append("newFiles", file);
        }

        const res = await fetch(`http://192.168.1.5:8080/seller-dashboard/editProduct/${prod.id}`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData
        });
        if (res.ok) {
          alert("Photos added successfully");
          loadProducts();
        } else {
          alert("Failed to add photos");
        }
      });
      card.appendChild(uploadBtn);

      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="color:red;">Error loading products</p>`;
  }
}

loadProducts();

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