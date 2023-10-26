document.addEventListener("DOMContentLoaded", () => {
  const feed = document.getElementById("feed");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.getElementById("login");
  const bruteForceButton = document.getElementById("bruteForce");
  const resultText = document.getElementById("result");
  const logoutButton = document.getElementById("logout");
  const postCreation = document.getElementById("postCreation");

  const getPosts = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      logoutButton.classList.add("hidden");
      postCreation.classList.add("hidden");
      return;
    }
    logoutButton.classList.remove("hidden");
    postCreation.classList.remove("hidden");

    feed.innerHTML = "";
    const response = await fetch("/api/posts", {
      headers: {
        Authorization: `Bearer ${token}`,
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

  const login = async (username, password) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(username)) {
      resultText.innerHTML = "Invalid E-Mail";
      resultText.classList.replace('text-green-500', 'text-red-500');
      return;
    }
    if (!password || password.length < 10) {
      resultText.innerHTML = "Password must be at least 10 characters.";
      resultText.classList.replace('text-green-500', 'text-red-500');
      return;
    }
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        throw new Error('Login failed');
      }
      const result = await response.text();
      sessionStorage.setItem("token", result);
      resultText.innerHTML = "Login Successful";
      resultText.classList.replace('text-red-500', 'text-green-500');
      getPosts();
    } catch (error) {
      console.error('Login failed:', error);
      resultText.innerHTML = "Login Failed";
      resultText.classList.replace('text-green-500', 'text-red-500');
    }
  };

  loginButton.addEventListener("click", async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    await login(username, password);
  });

  bruteForceButton.addEventListener("click", async () => {
    // Dieser Code kann potenziell gefährlich sein, wenn er missbraucht wird.
    const username = usernameInput.value;
    const password = passwordInput.value;
    while (true) {
      await login(username, password);
    }
  });

  logoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("token");
    logoutButton.classList.add("hidden");
    postCreation.classList.add("hidden");
    feed.innerHTML = "";
  });

  getPosts();
});
