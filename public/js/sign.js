const token = localStorage.getItem("accessToken");
if (token) {
  location.href = "/container.html";
}

const signUpData = async (data) => {
  const response = await fetch("/api/1.0/signup", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    method: "POST"
  });
  if (response.status === 403) {
    waitingImg.style.display = "none";
    signBlock.style.display = "block";
    alert("Email already exists");
    throw new Error("email已存在");
  }
  if (response.status === 400) {
    waitingImg.style.display = "none";
    signBlock.style.display = "block";
    alert("Invalid email format");
    throw new Error("email格式錯誤");
  }
  const json = await response.json();
  return json;
};

const signInData = async (data) => {
  const response = await fetch("/api/1.0/login", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    method: "POST"
  });
  if (response.status === 403) {
    waitingImg.style.display = "none";
    signBlock.style.display = "block";
    alert("Please check your email or password again!");
    throw new Error("帳號或密碼不存在");
  }
  if (response.status === 400) {
    waitingImg.style.display = "none";
    signBlock.style.display = "block";
    alert("Invalid email format");
    throw new Error("email格式錯誤");
  }
  const json = await response.json();
  return json;
};

const emailUp = document.getElementById("emailUp");
const pwdUp = document.getElementById("pwdUp");
const emailIn = document.getElementById("emailIn");
const pwdIn = document.getElementById("pwdIn");
const waitingImg = document.getElementById("waitingImg");
const signBlock = document.getElementById("signBlock");

// document.addEventListener("click", (e) => {
//   const target = e.target;
//   if (target.id === "emailUp") {
//     target.value = "";
//   }
//   if (target.id === "pwdUp") {
//     target.value = "";
//   }
//   if (target.id === "emailIn") {
//     target.value = "";
//   }
//   if (target.id === "pwdIn") {
//     target.value = "";
//   }
// });

function register () {
  const email = emailUp.value;
  const pwd = pwdUp.value;
  console.log(email);
  console.log(pwd);
  if (!email || !pwd) {
    alert("email and password are required!");
    return;
  }
  console.log("sign Up");
  signBlock.style.display = "none";
  waitingImg.style.display = "block";
  const data = { email: email, password: pwd };
  signUpData(data).then(data => {
    console.log(data);
    localStorage.setItem("accessToken", data.data.access_token);
    // top.postMessage({ updateToken: localStorage.accessToken }, "chrome-extension://koggopoanaidpohodhpdklohbngbjkif/background.html");
    window.location.href = "/container.html";
    // localStorage.setItem("accessToken", data.data.access_token);
  });
}

function logIn () {
  const email = emailIn.value;
  const pwd = pwdIn.value;
  if (!email || !pwd) {
    alert("email and password are required!");
    return;
  }
  console.log("Log In");
  signBlock.style.display = "none";
  waitingImg.style.display = "block";
  const data = { email: email, password: pwd };
  signInData(data).then(data => {
    console.log(data);
    localStorage.setItem("accessToken", data.data.access_token);
    // top.postMessage({ updateToken: localStorage.accessToken }, "chrome-extension://koggopoanaidpohodhpdklohbngbjkif/background.html");
    window.location.href = "/container.html";
    // localStorage.setItem("accessToken", data.data.access_token);
  });
}

const signIn = document.getElementById("signIn");
const signUp = document.getElementById("signUp");
const state = document.getElementById("state");
const exist = document.getElementById("exist");
function signChange () {
  if (signIn.style.display === "none") {
    signIn.style.display = "block";
    signUp.style.display = "none";
    state.innerHTML = "Log In";
    exist.children[0].innerHTML = "Don't have an account ?";
    exist.children[1].innerHTML = "<u>Sign Up</u>";
  } else {
    signIn.style.display = "none";
    signUp.style.display = "block";
    state.innerHTML = "Sign Up";
    exist.children[0].innerHTML = "Already have an account &#63;";
    exist.children[1].innerHTML = "<u>Log In</u>";
  }
}
