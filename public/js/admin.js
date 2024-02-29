console.log("WHAHTT")

$("[data-toggle='collapse'] ").click(function (event) {
  event.stopPropagation();
  console.log("wat")
  var thisModal = $(this).attr('data-target');
  console.log(thisModal)
  $(thisModal).collapse('show');
});

$('#userManagementButton').on({
  click: function (event) {
    $(this).attr('data-bs-toggle', 'none');
    $("#addEstabButton").attr('data-bs-toggle', 'collapse');
    $('#addEstabButton').removeClass('active')

    $('#addEstabTab').collapse('hide')
    $('#userManagementButton').addClass('active')
  }
})

$('#addEstabButton').on({
  click: function (event) {
    $(this).attr('data-bs-toggle', 'none');
    $("#userManagementButton").attr('data-bs-toggle', 'collapse');
    $('#userManagementButton').removeClass('active')

    $('#userManTab').collapse('hide')
    $('#addEstabButton').addClass('active')
  },
  'hide.bs.collapse': function () {
  }
})

document.addEventListener("change", (event) => {
  if (event.target.id == "estabImageInput") {
    console.log("wha")
    const chosedfile = event.target.files[0];
    img = document.querySelector("#estabImageInputDisplay");
    if (chosedfile) {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        img.setAttribute("src", reader.result);
      });
      reader.readAsDataURL(chosedfile);
    }
  }
});

const restForm = document.getElementById('restrictForm')
restForm.addEventListener('submit', async () => {
  formData = new FormData(document.forms.restrictForm)

  let currentDate = new Date();

  console.log(formData.get("muteUser"))
  console.log(formData.get("dateType"))
  console.log(formData.get("durationMultiplier"))
  number = parseInt(formData.get("durationMultiplier"));

  switch (formData.get("dateType")) {
    case "days": endRestrictionDate = new Date(currentDate.setDate(currentDate.getDate() + number)); console.log("day"); break;
    case "months": endRestrictionDate = new Date(currentDate.setMonth(currentDate.getMonth() + number)); console.log("month"); break;
    case "years": endRestrictionDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + number)); console.log("year"); break;
  }

  if (formData.get("muteUser") != "" && formData.get("muteUser") != "boss_nik") {
    console.log("gotIn")
    console.log(`restrictonTime`)
    if (formData.get("muteUser") != "boss_nik") {
      await fetch("/user/restrict", {
        method: "PATCH",
        body: JSON.stringify({
          username: formData.get("muteUser"),
          muteDuration: endRestrictionDate
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      }).then(res => {
        console.log(res);
        if (res.status == 200) {
          setTimeout(function () {
            location.reload();
            alert("Success!");
          }, 10000)
        }
        if (res.status == 501) {
          console.log("no such user")
          alert("No such user.");
        }

      }).catch((err) => console.log(err))
    }
    else {
      console.log("cannot ban admin!");
    }

  }
  else {
    if (formData.get("muteUser") == '') {
      alert("Please place a user!");
    }
    else {
      alert("Cannot ban an admin.");
    }

  }
})

const estabForm = document.getElementById('addEstabForm')
estabForm.addEventListener('submit', async () => {
  formData = new FormData(document.forms.addEstabForm)

  if (formData.get("estabImageInput").name != '') {
    console.log("nada");
    pic = new FormData();
    pic.append("file", formData.get("estabImageInput"));
    try {
      const res = await fetch("/uploadEstab", {
        method: "POST",
        body: pic,
      });

      const data = await res.json();
      if (data.path) {
        const filePath = data.path;
        estabPicture = filePath;

        console.log("Uploaded file path:", filePath);
      }
    } catch (err) {
      console.error(err);
    }

    estabData = JSON.stringify({
      estabPicture: estabPicture,
      estabNameInput: formData.get("estabNameInput"),
      estabDescInput: formData.get("estabDescInput"),
      tag1Input: formData.get("tag1Input"),
      tag2Input: formData.get("tag2Input"),
      displayAddressInput: formData.get("displayAddressInput"),
      longitudeInput: formData.get("longitudeInput"),
      latitudeInput: formData.get("latitudeInput"),
    })

    try {
      await fetch("/addEstab", {
        method: "POST",
        body: estabData,
        headers: { "Content-Type": "application/json" },
      }).then(res => {
        console.log(res);
        switch (res.status) {
          case 200: console.log("Yey"); setTimeout(function () {
            location.reload();
            alert("Success!");
          }, 1000); break;
          case 400: alert("400: Bad Request"); break;
          case 500: alert("500: Internal Server Error"); break;
        }
      }).catch((err) => {
        console.log(err);
        alert("error");
      })

    } catch (err) {
      console.log(err);
    }
  } else {
    console.log("no file input");
    alert("Please insert an image.");
  }
})
