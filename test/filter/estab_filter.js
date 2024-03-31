

//For Order Filter

function orderFilter(filter, storeReviews2, items) {

    const reviewOrder = filter;
    var max = 2;

    if (storeReviews2.length < 2) {
        max = storeReviews2.length;
    }

    var languages = [];
    var topReviews = [];

    for (var i = 0, l = items.length; i < l; i++) {
        languages.push(items[i]);
    }

    for (var i = 0, l = max; i < l; i++) {
        topReviews.push(storeReviews2[i]);
    }

    if (reviewOrder == "highest") {
        languages.sort();
        languages.reverse();

        topReviews.sort();
        topReviews.reverse();
    } else if (reviewOrder == "lowest") {
        languages.sort();
        topReviews.sort();
    }

    for (var i = 0, l = items.length; i < l; i++) {
        items[i] = languages[i];
    }

    for (var i = 0, l = max; i < l; i++) {
        storeReviews2[i] = topReviews[i];
    }


    return [storeReviews2, items];

}

//For Review Filter

function reviewFilter(filterScore, storeReviews) {

    var results = [];
    storeReviews.forEach((review) => {
        if (filterScore == "any") {
            results.push(review);
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
            if (review >= reviewScore && review < (reviewScore + 1)) {
                results.push(review);
            }
        }
    })
    return results;
}


module.exports = { orderFilter, reviewFilter };