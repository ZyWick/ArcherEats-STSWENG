const editButton = document.querySelector("#edit-profile-btn")

var currentlyEditing = false;

function toggleEditing() {
    if (!currentlyEditing) {
        editProfile();
    } else {
        finishEditing();
    }

    currentlyEditing = !currentlyEditing;
}

function editProfile() {
    desc = document.querySelector("#profile-description");
    textarea = document.querySelector("#profile-description-textarea");

    desc.style.display = "none";
    textarea.style.display = null;
    textarea.innerHTML = desc.innerHTML.trim();
    editButton.innerHTML = "Finish editing";
}

async function finishEditing() {
    formmm = new FormData(document.forms.userDescs);
    await fetch("/user/changeDesc", {
        method: "PATCH",
        body: JSON.stringify({
            userDesc: formmm.get("userDesc")
        }),
        headers: {
        'Content-type': 'application/json; charset=UTF-8',
        },
    }).then(res => {console.log(res);
        if (res.status == 200)
            location.reload(); 
    }).catch((err) => console.log(err))
}

editButton.addEventListener("click", toggleEditing);

// window.addEventListener("load", event=> {
//     if ( document.URL.includes("user-profile-view.html") ) {
//     thename = document.querySelector('.username')
//     thename.innerHTML = localStorage.getItem('savedUsername')
//     profdesc = document.querySelector('#profile-description')
//     profdesc.innerHTML =  localStorage.getItem('descProf')
//     anchor = document.querySelector('a.logout')
//     anchor.href = "index.html"
//     dpic = document.querySelector("#profile-img-top")
//     dpic.src = `${localStorage.getItem('pfp')}`;
//     pfP = document.querySelectorAll(".samplePfp")
//     sName = document.querySelectorAll(".sampleName")
//     for (let i=0; i < pfP.length; i++) {
//         pfP[i].src = `${localStorage.getItem('pfp')}`;
//     } for (let i=0; i < sName.length; i++) {
//         sName[i].innerHTML = localStorage.getItem('savedUsername')
//     }
// }})

document.addEventListener ("change", async events=>{
    const fileInputs = document.querySelector('#profile-img-caption');
    formEl = document.forms.ImgChange;
    formData = new FormData(formEl);
    if (events.target.id == "profile-img-caption")
    await fetch("/user/changePfp", {
        method: "PATCH",
        body: formData
    }).then(res => { console.log(res)
        if (res.status == 200)
            location.reload(); 
    }).catch((err) => console.log(err))
    console.log("yo")
})

$('#showNotifButton').on({
    click: function (event) {
      $(this).attr('data-bs-toggle', 'none');
      $("#showAllPostsButton").attr('data-bs-toggle', 'collapse');
      $('#showAllPostsButton').removeClass('active')
  
      $('#allPosts').collapse('hide')
      $('#showNotifButton').addClass('active')
    }
  })
  
  $('#showAllPostsButton').on({
    click: function (event) {
      $(this).attr('data-bs-toggle', 'none');
      $("#showNotifButton").attr('data-bs-toggle', 'collapse');
      $('#showNotifButton').removeClass('active')
  
      $('#notifsTab').collapse('hide')
      $('#showAllPostsButton').addClass('active')
    }
  })

  const notifs = document.querySelector("#notifsTab")

  notifs.addEventListener("click", (event) => {
    theCARD = event.target.closest('.notifCard')
    if (event.target.classList.contains("delNotif")) {
        deleteNotif(theCARD)
    }
    else if(theCARD.classList.contains("read") == false) {
        readNotif(theCARD)
    }
  })

  async function readNotif (theCARD) {
    await fetch("/user/notif", {
        method: "PATCH",
        body: JSON.stringify({notifId: theCARD.id}),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
    }).then(res => {console.log(res);
        switch (res.status) {
            case 200: theCARD.classList.add("read"); break;
            default:  statusResp(res.status); break;
        }
    }).catch((err) => console.log(err))
  }

  async function deleteNotif (theCARD) {
    console.log("whad")
    await fetch("/user/notif", {
        method: "DELETE",
        body: JSON.stringify({notifId: theCARD.id}),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
    }).then(res => {console.log(res);
        switch (res.status) {
            case 200: theCARD.style.display = "none"; break;
            default:  statusResp(res.status); break;
        }
    }).catch((err) => console.log(err))
  }

  function statusResp (status) {
    switch (status) {
        case 401: console.log("401: no user credentials");window.location.replace("/login"); break;
        case 402: console.log("402: user banned"); break;
        case 400: console.log("400: Bad Request");break;
        case 500: console.log("500: Internal Server Error");break;
    }
}