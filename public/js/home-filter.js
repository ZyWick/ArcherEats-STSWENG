const sfBtn = document.querySelectorAll(".sfBtn")
const reviewOrder = document.querySelectorAll(".review-order");
const dropScore = document.querySelectorAll(".drop-score");
const dropTag1 = document.querySelectorAll(".drop-tag-1");
const dropTag2 = document.querySelectorAll(".drop-tag-2");

const ratingsBtn = document.querySelector("#sortRatingsOrder");
const reviewBtn = document.querySelector("#sortReviewScore");
const primaryTagBtn = document.querySelector("#sortTag1");
var withSort = false;

var currLevel = 1;
// const storeProducts = document.querySelectorAll(".col-lg-3");

//For Order Filter
for (i = 0; i < reviewOrder.length; i++) {
    reviewOrder[i].addEventListener("click", (e) => {
        e.preventDefault()
        ratingsBtn.disabled = true;
        const dropDown = document.querySelector('#select');
        dropDown.style.display = 'none';
        withSort = true;

        const reviewOrder = e.target.dataset.filter;
        var originalArray = [];
        var storeProducts = document.getElementsByClassName("col-lg-3");

        for (var i = 0, l = storeProducts.length; i < l; i++) {
            originalArray.push(storeProducts[i].innerHTML);
            originalArray[i] = originalArray[i].slice(0, 30) + ' ' + storeProducts[i].classList[2] + ' ' + storeProducts[i].classList[3] + originalArray[i].slice(30);
        }

        if (reviewOrder == "highest") {
            originalArray.sort();
            originalArray.reverse();
        } else if (reviewOrder == "lowest") {
            originalArray.sort();
        }

        for (var i = 0, l = storeProducts.length; i < l; i++) {
            storeProducts[i].innerHTML = originalArray[i];
            currLevel += 1;
        }
    })
}

//For Review Filter
for (i = 0; i < dropScore.length; i++) {
    dropScore[i].addEventListener("click", (e) => {
        e.preventDefault()
        ratingsBtn.disabled = true;

        const filterScore = e.target.dataset.filter;

        var storeProducts = document.querySelectorAll(".col-lg-3");

        storeProducts.forEach((product) => {

            //product = new DOMParser().parseFromString(product, "text/xml");

            var productRating = product.innerHTML.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(function (v) { return +v; })[0];
            if (filterScore == "any") {
                product.style.display = "block"
            } else {
                //Creates a usable variable for comparing and checking the condition
                let reviewScore = 0;
                for (let j = 0; j < 6; j++) {
                    let stringCounter = j.toString();
                    if (stringCounter == filterScore) {
                        reviewScore = parseInt(stringCounter);
                    }
                }

                //Filters out reviews with a certain review score range
                if (productRating >= reviewScore && productRating < (reviewScore + 1)) {
                    product.style.display = "block"
                } else {
                    product.style.display = "none"
                }
            }
        })
    })
}

//For Tag Filter
for (i = 0; i < dropTag1.length; i++) {
    dropTag1[i].addEventListener("click", (e) => {
        e.preventDefault();
        ratingsBtn.disabled = true;
        reviewBtn.disabled = true;
        var filter1 = e.target.dataset.filter;
        let element = document.getElementById("sortTag2");

        Tag1(filter1, 2, element);
    })
}

function Tag1(filter1, index, element) {
    var storeProducts = document.querySelectorAll(".col-lg-3");

    storeProducts.forEach((product) => {
        if (filter1 == "any") { //If all filter is selected,
            product.style.display = "block" //Display all establishments
            element.setAttribute("hidden", "hidden");
        } else {
            console.log(String(product.innerHTML).split(' ')[18].split('"'));

            if (withSort == false) {

                if (product.classList[index] == filter1) { //If a tag is selected,
                    if (product.style.display == 'block')
                        product.style.display = "block" //Display the product with that tag
                } else {
                    product.style.display = "none"
                }
            }
            else {
                if (String(product.innerHTML).split(' ')[18].split('"')[0] == filter1) { //If a tag is selected,
                    if (product.style.display == 'block')
                        product.style.display = "block" //Display the product with that tag
                } else {
                    product.style.display = "none"
                }
            }

            primaryTagBtn.disabled = true;
            var dropDownBtn = document.querySelectorAll('.show');
            dropDownBtn[dropDownBtn.length - 1].style.display = 'none';

            element.removeAttribute("hidden"); //Secondary Tag revealed

            //For Tag 2 Filter
            for (i = 0; i < dropTag2.length; i++) {
                dropTag2[i].addEventListener("click", (e) => {
                    e.preventDefault()
                    var filter2 = e.target.dataset.filter;
                    primaryTagBtn.disabled = true;
                    Tag2(filter1, filter2, 2, 3);

                    var dropDownBtn = document.querySelectorAll('.show');
                    var secondaryTagBtn = document.querySelector('#sortTag2');
                    secondaryTagBtn.disabled = true;
                    dropDownBtn[dropDownBtn.length - 1].style.display = 'none';
                })
            }
        }
    })
}

function Tag2(filter1, filter2, index1, index2) {
    var storeProducts = document.querySelectorAll(".col-lg-3");

    storeProducts.forEach((product) => {
        if (filter1 == "any" && filter2 == "any") {
            product.style.display = "block"
        } else {
            if (withSort == false) {
                if (product.classList[index1] == filter1 && product.classList[index2] == filter2 && product.style.display != 'none') {
                    product.style.display = "block"
                } else {
                    product.style.display = "none"
                }
            }
            else {
                if (String(product.innerHTML).split(' ')[18].split('"')[0] == filter1 && String(product.innerHTML).split(' ')[19].split('"')[0] == filter2 && product.style.display != 'none') {
                    product.style.display = "block"
                } else {
                    product.style.display = "none"
                }
            }
        }
    })
}