const imgDiv = document.querySelector(".user-img");
const file = document.querySelector("#file");
const uploadbtn = document.querySelector("#uploadbtn");

document.addEventListener("change", (event) => {
  if (event.target.id == "file") {
    const chosedfile = event.target.files[0];
    img = document.querySelector("#pfp-input");
    if (chosedfile) {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        img.setAttribute("src", reader.result);
      });
      reader.readAsDataURL(chosedfile);
    }
  }
});

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
    const description = form.description.value;
    const formData = new FormData();
    let profilePicture = "static/assets/user-pfp-placeholders/unknown.jpg"
  
    if (file.files[0]) {
        console.log("nada");
      formData.append("file", file.files[0]);
      try {
        const res = await fetch("/upload", {
          method: "POST",
          body: formData,
        });
  
        const data = await res.json();
        if (data.path) {
          const filePath = data.path;
          profilePicture = filePath;
  
          console.log("Uploaded file path:", filePath);
        }
      } catch (err) {
        console.error(err);
      }

    }
  
    try {
      const res = await fetch("/signup", {
        method: "POST",
        body: JSON.stringify({ username, password, description, profilePicture }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      console.log(data);
      if (data.errors) {
        usernameError.textContent = data.errors.username;
        passwordError.textContent = data.errors.password;
      }
      if (data.user) {
        // localStorage.setItem('savedUsername', data.user.username);
        // localStorage.setItem('descProf', data.user.description);
        // localStorage.setItem('pfp',  data.user.pfp);
        localStorage.setItem('currentLogin', 'true')

        const redirect = "/users/" + username;
        location.assign(redirect);
      }
    } catch (err) {
      console.log(err);
    }
});