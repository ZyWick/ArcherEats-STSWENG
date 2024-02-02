const form = document.querySelector("form");
const usernameError = document.querySelector(".username.error");
const passwordError = document.querySelector(".password.error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
 
    // reset errors
    usernameError.textContent = "";
    passwordError.textContent = "";

    // get values
    const username = form.username.value;
    const password = form.password.value;
    const rememberMe = form.rememberMe.checked

    localStorage.setItem("rememberMe", rememberMe)

    try {
        const res = await fetch("/login", {
            method: "POST",
            body: JSON.stringify({ username, password}),
            headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        console.log(data);
        if (data.errors) {
            usernameError.textContent = data.errors.username;
            passwordError.textContent = data.errors.password;
        }
        if (data.user) {
            //change
            console.log(data.user.name)
            localStorage.setItem('currentLogin', 'true')
            const redirect = "/users/" + username;
            location.assign(redirect);
        }
    } catch (err) {
        console.log(err);
    }
});

document.addEventListener("click", event => {
  classlist = event.target.classList;
  if (classlist.contains("logout")) {
    rememberMe = false;
    localStorage.removeItem("rememberMe"); // Clear the value from Local Storage
  }
});

// Function to refresh the JWT and set the updated token as a cookie
function refreshToken(token) {
  // Update the expiration time of the token by 3 weeks (in seconds)
  const threeWeeksInSeconds = 3 * 7 * 24 * 60 * 60;
  const updatedExpiration = Math.floor(Date.now() / 1000) + threeWeeksInSeconds;

  // Set the updated token as a new cookie with the extended expiration time
  document.cookie = `jwt=${token}; expires=${new Date(updatedExpiration * 1000).toUTCString()}; path=/;`;
}

function checkJWTOnLoad() {
  const jwtCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('jwt='));
  console.log(jwtCookie)

  if (jwtCookie) {
    // JWT cookie exists
    const token = jwtCookie.split('=')[1];
    const decodedToken = parseJWT(token);

    if (decodedToken.exp * 1000 > Date.now()) {
      // JWT is still valid
      // Check if the "Remember Me" option was selected during login
      const rememberMeValue = localStorage.getItem('rememberMe');
      if (rememberMeValue === 'true') {
        // If "Remember Me" was selected, refresh the token
        console.log("token refresh")
        refreshToken(token);
      } else {
        // If "Remember Me" was not selected, there's no need to refresh the token
        console.log('Remember Me not selected. Token not refreshed.');
      }
    } else {
      // JWT has expired, handle the expiration as needed
      console.log('JWT has expired.');
    }
  } else {
    // JWT cookie does not exist, handle the absence as needed
    console.log('JWT cookie not found.');
  }
}

console.log(localStorage.getItem('rememberMe'))
// Function to parse the JWT payload
function parseJWT(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = decodeURIComponent(atob(base64).split('').map(char => {
    return '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(payload);
}

// Call the checkJWTOnLoad function on page load to handle the JWT
if (localStorage.getItem('rememberMe')) {
  console.log('Hi')
  checkJWTOnLoad();
}