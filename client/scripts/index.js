document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("feed");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login");
  const bruteForceButton = document.getElementById("bruteForce");
  const resultText = document.getElementById("result");
  const logoutButton = document.getElementById("logout");

  const getPosts = async () => {
    if (!sessionStorage.getItem("token")) {
      logoutButton.classList.add("hidden");
      return;
    }
    feed.innerHTML = "";
    const response = await fetch("/api/posts", {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
      },
    });
    const posts = await response.json();
    for (const post of posts) {
      const postElement = document.createElement("div");
      postElement.innerHTML = `
        <h3>${post.title}</h3>
        <p>${post.content}</p>
      `;
      feed.appendChild(postElement);
    }
  };
  getPosts();

  const login = async (username, password) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(username)) {
      resultText.innerHTML = "Invalid E-Mail";
      return;
    }
    if (!password || password.length < 10) {
      resultText.innerHTML = "Password must be at least 10 characters.";
      return;
    }
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    const result = await response.text();
    if (!result) return;
    sessionStorage.setItem("token", result);
    logoutButton.classList.remove("hidden");
    getPosts();
  };

  loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    await login(username, password);
  });

  bruteForceButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    while (true) {
      await login(username, password);
    }
  });

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    location.reload();
  });
});
