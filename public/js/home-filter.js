const sfBtn = document.querySelectorAll(".sfBtn")
const reviewOrder = document.querySelectorAll(".review-order");
const dropScore = document.querySelectorAll(".drop-score");
const dropTag1 = document.querySelectorAll(".drop-tag-1");
const dropTag2 = document.querySelectorAll(".drop-tag-2");
// const storeProducts = document.querySelectorAll(".col-lg-3");

//For Tag 1 Filter
for (i = 0; i < dropTag1.length; i++) {
    dropTag1[i].addEventListener("click", (e) => {
        e.preventDefault()
        const filter1 = e.target.dataset.filter;

        let element = document.getElementById("sortTag2");
        let hidden = element.getAttribute("hidden");

        if (hidden && filter1 != "any") {
            element.removeAttribute("hidden");
        } else {
            element.setAttribute("hidden", "hidden");
        }

        Tag1(filter1,2);
    })
}

function Tag1(filter1,index){
    var storeProducts = document.querySelectorAll(".col-lg-3");

    storeProducts.forEach((product) => {
        if (filter1 == "any") { //If all filter is selected,
            product.style.display = "block" //Display all establishments
        } else {
            if (product.classList[index] == filter1) { //If a tag is selected,
                product.style.display = "block" //Display the product with that tag
            } else {
                product.style.display = "none"
            }

            //For Tag 2 Filter
            for (i = 0; i < dropTag2.length; i++) {
                dropTag2[i].addEventListener("click", (e) => {
                    e.preventDefault()
                    const filter2 = e.target.dataset.filter;
                    Tag2(filter1,filter2,2,3);
                })
            }
        }
    })
}

function Tag2(filter1,filter2,index1,index2){
    var storeProducts = document.querySelectorAll(".col-lg-3");

    storeProducts.forEach((product) => {
        if (filter1 == "any" && filter2 == "any") {
            product.style.display = "block"
        } else {
            if (product.classList[index1] == filter1 && product.classList[index2] == filter2) {
                product.style.display = "block"
            } else {
                product.style.display = "none"
            }
        }
    })
}

//For Order Filter
for (i=0; i < reviewOrder.length;i++) {
    reviewOrder[i].addEventListener("click", (e) => {
        e.preventDefault()

        const reviewOrder = e.target.dataset.filter;
        var originalArray = [];
        var storeProducts = document.getElementsByClassName("col-lg-3");
        
        for (var i = 0, l = storeProducts.length; i < l; i++) {
            originalArray.push(storeProducts[i].innerHTML)
        }
    
        if (reviewOrder == "highest"){
            originalArray.sort();
            originalArray.reverse();
        } else if (reviewOrder == "lowest"){
            originalArray.sort();
        }

        for (var i = 0, l = storeProducts.length; i < l; i++) {
            storeProducts[i].innerHTML = originalArray[i];
        }
    })
}

//For Review Filter
for (i=0; i < dropScore.length;i++) {
    dropScore[i].addEventListener("click", (e) => {
        e.preventDefault()
        const filterScore = e.target.dataset.filter;

        var storeProducts = document.querySelectorAll(".col-lg-3");

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
                    product.style.display = "none"
                }
            }
        })
    })
}