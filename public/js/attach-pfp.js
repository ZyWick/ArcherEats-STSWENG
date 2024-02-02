const imgDiv = document.querySelector('.user-img');
const file = document.querySelector('#file');
const uploadbtn = document.querySelector('#uploadbtn');

document.addEventListener('change', (event) => {
    if(event.target.id == "file") {
        const chosedfile = event.target.files[0];
        img = document.querySelector('#pfp-input');
        if (chosedfile) {
            const reader = new FileReader();
            reader.addEventListener('load', function(){
                img.setAttribute('src', reader.result);
            })
            reader.readAsDataURL(chosedfile);
            console.log(reader.result)
        }
    }
})