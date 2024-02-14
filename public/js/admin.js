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
