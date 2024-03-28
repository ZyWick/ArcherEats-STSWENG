const dropScore = document.querySelectorAll(".drop-score"); //
const dropTag1 = document.querySelectorAll(".drop-tag-1");
const dropTag2 = document.querySelectorAll(".drop-tag-2");
const storeProducts = document.querySelectorAll(".col-lg-3");

//product.style.display = "block" SHOWS the product
//product.style.display = "none" REMOVES the product

for (i=0; i < dropScore.length;i++) {
    dropScore[i].addEventListener("click", (e) => {
        e.preventDefault()

        const filterScore = e.target.dataset.filter;
        storeProducts.forEach((product) => {
            if (filterScore == "any"){
                product.style.display = "block"
            } else {
                
                //Creates a usable variable for comparing and checking the condition
                let reviewScore = 0;
                for(let j = 0; j < 6; j++){
                    let stringCounter = j.toString();
                    if(stringCounter == filterScore){
                        reviewScore = parseInt(stringCounter);
                    }
                }

                //Filters out reviews with a certain review score range
                if (product.classList[1] >= reviewScore && product.classList[1] < (reviewScore + 1)) {
                    product.style.display = "block"
                } else {
                    console.log(reviewScore)
                    product.style.display = "none"
                }
            }
        })
    })
}


for (i = 0; i < dropTag1.length; i++) {
    dropTag1[i].addEventListener("click", (e) => {
        e.preventDefault()
        const filter1 = e.target.dataset.filter;
        storeProducts.forEach((product) => {
            if (filter1 == "any") { //If all filter is selected,
                
                product.style.display = "block" //Display all establishments
            } else {
                if (product.classList.contains(filter1)) { //If a tag is selected,
                    product.style.display = "block" //Display the product with that tag
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
                if (product.classList.contains(filter2)) {
                    product.style.display = "block"
                } else {
                    product.style.display = "none"
                }
            }
        })

    })
}