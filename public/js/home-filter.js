const sfBtn = document.querySelectorAll(".sfBtn")
const reviewOrder = document.querySelectorAll(".review-order");
const dropScore = document.querySelectorAll(".drop-score");
const dropTag1 = document.querySelectorAll(".drop-tag-1");
const dropTag2 = document.querySelectorAll(".drop-tag-2");
// const storeProducts = document.querySelectorAll(".col-lg-3");

let Order = false;
let Score = false;
let Tag1 = false;
let Tag2 = false;
let Multi = false;

for (i=0; i < sfBtn.length; i++) {

    sfBtn[i].addEventListener("click", (e) => {
        if (Multi == true && Order == true && Score == false && Tag1 == false && Tag2 == false) {
            console.log("Only Order is applied")
        } else if (Multi == true && Order == false && Score == true  && Tag1 == false && Tag2 == false) {
            console.log("Only Score is applied")
        } else if (Multi == true && Order == false && Score == false && Tag1 == true  && Tag2 == false) {
            console.log("Only Tag1 is applied")
        } else if (Multi == true && Order == false && Score == false && Tag1 == false && Tag2 == true) {
            console.log("Only Tag2 is applied")
        } else if (Multi == true && Order == true && Score == true && Tag1 == false && Tag2 == false) {
            console.log("Order & Score is applied")
        } else if (Multi == true && Order == true && Score == false && Tag1 == true && Tag2 == false) {
            console.log("Order & Tag1 is applied")
        } else if (Multi == true && Order == true && Score == false && Tag1 == false && Tag2 == true) {
            console.log("Order & Tag2 is applied")
        } else if (Multi == true && Order == false && Score == true && Tag1 == true && Tag2 == false) {
            console.log("Score & Tag1 is applied")
        } else if (Multi == true && Order == false && Score == true && Tag1 == false && Tag2 == true) {
            console.log("Score & Tag2 is applied")
        } else if (Multi == true && Order == false && Score == false && Tag1 == true && Tag2 == true) {
            console.log("Tag1 & Tag2 is applied")
        } else if (Multi == true && Order == true && Score == true && Tag1 == true && Tag2 == false) {
            console.log("All except Tag2 is applied")
        } else if (Multi == true && Order == true && Score == true && Tag1 == false && Tag2 == true) {
            console.log("All exept Tag1 is applied")
        } else if (Multi == true && Order == true && Score == false && Tag1 == true && Tag2 == true) {
            console.log("All except Score is applied")
        } else if (Multi == true && Order == false && Score == true && Tag1 == true && Tag2 == true) {
            console.log("All except Order is applied")
        } else if (Multi == true && Order == true  && Score == true && Tag1 == true && Tag2 == true) {
            console.log("All filters applied")
        } else {
            console.log("Only Single Filter Applied")
        }
    })
}

//For Order Filter
for (i=0; i < reviewOrder.length;i++) {
    if (Multi == false) {
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

            for (var i = 0, l = storeProducts.length; i < l; i++) {
                storeProducts[i].innerHTML = originalArray[i];
            }

            Order = true;
            Multi = true;
        })
    }
}

//For Review Filter
for (i=0; i < dropScore.length;i++) {
    if (Multi == false) {
        dropScore[i].addEventListener("click", (e) => {
            e.preventDefault()

            var storeProducts = document.querySelectorAll(".col-lg-3");
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
                        product.style.display = "none"
                    }
                }
            })

            Score = true;
            Multi = true;
        })
    }
}

//For Tag 1 Filter
for (i = 0; i < dropTag1.length; i++) {
    if (Multi == false) {
        dropTag1[i].addEventListener("click", (e) => {
            e.preventDefault()

            const filter1 = e.target.dataset.filter;
            var storeProducts = document.querySelectorAll(".col-lg-3");

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

            Tag1 = true;
            Multi = true;
        })
    }
}

//For Tag 2 Filter
for (i = 0; i < dropTag2.length; i++) {
    if (Multi == false) {
        dropTag2[i].addEventListener("click", (e) => {
            e.preventDefault()

            const filter2 = e.target.dataset.filter;
            var storeProducts = document.querySelectorAll(".col-lg-3");

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

            Tag2 = true;
            Multi = true;
        })
    }
}