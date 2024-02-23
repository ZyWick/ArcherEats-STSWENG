console.log("WHAHTT")

$("[data-toggle='collapse'] ").click(function(event) {
    event.stopPropagation();
    console.log("wat")
    var thisModal = $(this).attr('data-target');
    console.log(thisModal)
    $(thisModal).collapse('show');
});

$('#userManagementButton').on({
    click: function(event){
        $(this).attr('data-bs-toggle', 'none');
        $("#addEstabButton").attr('data-bs-toggle', 'collapse');
        $('#addEstabButton').removeClass('active')
    
         $('#addEstabTab').collapse('hide')
         $('#userManagementButton').addClass('active')
     }
})

$('#addEstabButton').on({
    click: function(event){
        $(this).attr('data-bs-toggle', 'none');
        $("#userManagementButton").attr('data-bs-toggle', 'collapse');
        $('#userManagementButton').removeClass('active')

        $('#userManTab').collapse('hide')
        $('#addEstabButton').addClass('active')
    },
    'hide.bs.collapse': function() {
    }
})

document.getElementById('submitEstabButton').addEventListener('click', addEstablishment);

document.getElementById('restrictButton').addEventListener('click', restrictUser);

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

async function addEstablishment (event) {
  console.log("ok kuha")
  fData = new FormData(document.forms.establishmentForm)
  event.preventDefault()

  console.log(fData.get("estabNameInput"))
  console.log(fData.get("estabDescInput"))
  console.log(fData.get("tag1Input"))
  console.log(fData.get("tag2Input"))
  console.log(fData.get("displayAddressInput"))
  console.log(fData.get("longitudeInput"))
  console.log(fData.get("latitudeInput"))
}

async function restrictUser (event){
  formData = new FormData(document.forms.restrictForm)
  event.preventDefault()

  const currentDate = new Date()

  console.log(formData.get("muteUser"))
  console.log(formData.get("dateType"))
  console.log(formData.get("durationMultiplier"))

  switch (formData.get("dateType")) {
    case "days": endRestrictionDate = new Date(currentDate.setDate(currentDate.getDate() + formData.get("durationMultiplier"))); console.log("day"); break;
    case "months": endRestrictionDate = new Date(currentDate.setMonth(currentDate.getMonth() + formData.get("durationMultiplier"))); console.log("month"); break;
    case "years": endRestrictionDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + formData.get("durationMultiplier"))); console.log("year"); break;
  }
  
  if(formData.get("muteUser") != "") {
    console.log("gotIn")
    console.log(`restrictonTime`)
    await fetch("/user/restrict", {
      method: "PATCH",
      body: JSON.stringify({
        username: formData.get("muteUser"),
        muteDuration: endRestrictionDate
    }),
    headers: {
    'Content-type': 'application/json; charset=UTF-8',
    },
    }).then(res => {console.log(res);
      if (res.status == 200){
        setTimeout(function(){
          location.reload();
        }, 10000)
      }
          
    }).catch((err) => console.log(err))
  }
}
