const signUp = async (data) => {
  const response = await fetch("/api/1.0/signup", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    method: "POST"
  });
  const json = await response.json();
  return json;
};

const signIn = async (data) => {
  const response = await fetch("/api/1.0/login", {
    body: JSON.stringify(data),
    headers: new Headers({
      "Content-Type": "application/json"
    }),
    method: "POST"
  });
  const json = await response.json();
  return json;
};

const emailUp = document.getElementById("emailUp");
const pwdUp = document.getElementById("pwdUp");
const emailIn = document.getElementById("emailIn");
const pwdIn = document.getElementById("pwdIn");

function register () {
  const email = emailUp.value;
  const pwd = pwdUp.value;
  const data = { email: email, password: pwd };
  signUp(data).then(data => {
    console.log(data);
    // localStorage.setItem("accessToken", data.data.access_token);
  });
}

function logIn () {
  const email = emailIn.value;
  const pwd = pwdIn.value;
  const data = { email: email, password: pwd };
  signIn(data).then(data => {
    console.log(data);
    // localStorage.setItem("accessToken", data.data.access_token);
  });
}
