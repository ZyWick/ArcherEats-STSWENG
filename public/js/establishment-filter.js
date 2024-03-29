const reviewOrder = document.querySelectorAll(".review-order");
const dropScore = document.querySelectorAll(".drop-score");
const storeReviews = document.querySelectorAll(".reviewCard");

//For Order Filter
for (i=0; i < reviewOrder.length;i++) {
    reviewOrder[i].addEventListener("click", (e) => {
        e.preventDefault()
        const reviewOrder = e.target.dataset.filter;

        var languages = [];
        var items = document.getElementsByClassName("revList"); //replace mb-3
        
        for (var i = 0, l = items.length; i < l; i++) {
            languages.push(items[i].innerHTML)
        }

        if (reviewOrder == "highest"){
            languages.sort();
            languages.reverse();
        } else if (reviewOrder == "lowest"){
            languages.sort();
        }

        for (var i = 0, l = items.length; i < l; i++) {
            items[i].innerHTML = languages[i];
        }

        console.log(items)
    })
}

//For Review Filter
for (i=0; i < dropScore.length;i++) {
    dropScore[i].addEventListener("click", (e) => {
        e.preventDefault()

        const filterScore = e.target.dataset.filter;
        storeReviews.forEach((review) => {
            if (filterScore == "any"){
                review.style.display = "block"
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
                if (review.classList[4] >= reviewScore && review.classList[4] < (reviewScore + 1)) {
                    review.style.display = "block"
                } else {
                    review.style.display = "none"
                }
            }
        })
    })
}