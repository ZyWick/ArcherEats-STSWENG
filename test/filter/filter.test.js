const filterFunctions = require("./home_page_filter");

describe('ascending or descending rating filter', () => {
    it('should return the estab ratings according to highest to lowest rating filter', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        expect(filterFunctions.orderFilter('highest', storeProductsNum)).toEqual(storeProductsNum.sort().reverse());
        expect(filterFunctions.orderFilter('highest', storeProductsNum2)).toEqual(storeProductsNum2.sort().reverse());
    });

    it('should return the estab ratings according to lowest to highest rating filter', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        expect(filterFunctions.orderFilter('lowest', storeProductsNum)).toEqual(storeProductsNum.sort());
        expect(filterFunctions.orderFilter('lowest', storeProductsNum2)).toEqual(storeProductsNum2.sort());
    });
});

describe('exact rating filter', () => {
    it('should return the estab ratings according to the 4.0 range filter', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        expect(filterFunctions.reviewFilter(4.0, storeProductsNum)).toEqual([4.8, 4.5, 4.0, 4.5, 4.5]);
        expect(filterFunctions.reviewFilter(4.0, storeProductsNum2)).toEqual([4.3, 4.2]);
    });

    it('should return the estab ratingss according to the 2.0 range filter', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        expect(filterFunctions.reviewFilter(2.0, storeProductsNum)).toEqual([2.5]);
        expect(filterFunctions.reviewFilter(2.0, storeProductsNum2)).toEqual([2.3, 2.1]);
    });

    it('should return the same array', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        expect(filterFunctions.reviewFilter('any', storeProductsNum)).toEqual(storeProductsNum);
        expect(filterFunctions.reviewFilter('any', storeProductsNum2)).toEqual(storeProductsNum2);
    });

});