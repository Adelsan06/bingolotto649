console.log("app.js loaded");
async function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const res = await fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
    return;
  }

  alert("Signup successful. You can now log in.");
}


async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });

  const data = await res.json();
  if (data.error) alert(data.error);
  else window.location = "/play.html";
}

async function pay() {
  const res = await fetch("/checkout", { method: "POST" });
  const data = await res.json();
  window.location = data.url;
}
