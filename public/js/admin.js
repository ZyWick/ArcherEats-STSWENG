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

async function restrictUser (event){
  formData = new FormData(document.forms.restrictForm)
  event.preventDefault()
  console.log(formData)

  if(formData.get("muteUser") != "") {
    console.log("gotIn")
    await fetch("/user/restrict", {
      method: "PATCH",
      body: formData,
      // headers: {
      //   'Content-type': 'application/json; charset=UTF-8',
      // },
    }).then(res => {console.log(res);
      if (res.status == 200)
          location.reload(); 
    }).catch((err) => console.log(err))
  }
}
