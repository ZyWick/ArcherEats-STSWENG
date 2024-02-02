var filterBtn = document.querySelector("#star-filter-dropdown");
var filterDropdownItems = document.querySelectorAll(".star-filter");

var storeToggle = document.querySelector("#store-toggle");
var reviewToggle = document.querySelector("#review-toggle");

var storeResultList = document.querySelector("#store-section-result");
var reviewResultList = document.querySelector("#review-section-result");

var storeResultListHTMLCopy = storeResultList.innerHTML;
var reviewResultListHTMLCopy = reviewResultList.innerHTML;

var isStoreVisible = true;
var isReviewVisible = true;

let url = window.location.href;

if(url.slice(-9, -1) == "&filter=") url = url.slice(0, -9);

filterDropdownItems.forEach((item) => {
    item.addEventListener('click', () => {
        if (item.innerHTML[0] == 'N') {
            item.setAttribute("href", url)
        }
        else {
            item.setAttribute("href", url + "&filter=" + item.innerHTML[0]); 
        }
        console.log("f");
        showStore();
    });
});

storeToggle.addEventListener('click', () => {
    if(isStoreVisible) {
        hideStore();
    } else {
        showStore();
    }
});

reviewToggle.addEventListener('click', () => {
    if(isReviewVisible) {
        hideReview();
    } else {
        showReview();
    }
});

function showStore() {
    isStoreVisible = true;

    storeToggle.innerHTML = "Hide"
    storeResultList.innerHTML = storeResultListHTMLCopy;
}

function showReview() {
    isReviewVisible = true;

    reviewToggle.innerHTML = "Hide"
    reviewResultList.innerHTML = reviewResultListHTMLCopy;
}

function hideStore() {
    isStoreVisible = false;

    storeToggle.innerHTML = "Show";
    storeResultList.innerHTML = "";
}

function hideReview() {
    isReviewVisible = false;

    reviewToggle.innerHTML = "Show";
    reviewResultList.innerHTML = "";
}