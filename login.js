document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("loginFullName").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const res = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, password })
  });

  const data = await res.json();
  alert(data.message);

  if (data.success) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "home.html"; // or dashboard
  }
});
