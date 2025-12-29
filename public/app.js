async function login() {
  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value
    })
  });
console.log("app.js loaded");

  const data = await res.json();
  if (data.error) alert(data.error);
  else window.location = "/play.html";
}

async function pay() {
  const res = await fetch("/checkout", { method: "POST" });
  const data = await res.json();
  window.location = data.url;
}
