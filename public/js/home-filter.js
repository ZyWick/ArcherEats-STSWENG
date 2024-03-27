const dropTag1 = document.querySelectorAll(".drop-tag-1");
const dropTag2 = document.querySelectorAll(".drop-tag-2");
const storeProducts = document.querySelectorAll(".col-lg-3");

for (i = 0; i < dropTag1.length; i++) {
    dropTag1[i].addEventListener("click", (e) => {
        e.preventDefault()

        const filter1 = e.target.dataset.filter;
        storeProducts.forEach((product) => {
            if (filter1 == "any") {
                product.style.display = "block"
            } else {
                let text = filter1;
                let letter = text.charAt(0); //Grabs first character of string
                console.log(letter);
                
                if (product.classList.contains(filter1)) {
                    product.style.display = "block"
                } else {
                    product.style.display = "none"
                }
            }
        })

    })
}

for (i = 0; i < dropTag2.length; i++) {
    dropTag2[i].addEventListener("click", (e) => {
        e.preventDefault()

        const filter2 = e.target.dataset.filter;
        storeProducts.forEach((product) => {
            if (filter2 == "any") {
                product.style.display = "block"
            } else {
                let text = filter2;
                let letter = text.charAt(0); //Grabs first character of string
                console.log(letter);
                
                if (product.classList.contains(filter2)) {
                    product.style.display = "block"
                } else {
                    product.style.display = "none"
                }
            }
        })

    })
}