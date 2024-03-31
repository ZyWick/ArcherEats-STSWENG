const filterFunctions = require("./estab_filter");

describe('ascending or descending REVIEWS IN ESTAB rating filter', () => {
    it('should return the REVIEWS IN ESTAB according to highest to lowest rating filter', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        var results = filterFunctions.orderFilter('highest', storeProductsNum, storeProductsNum2)

        expect(results[0]).toEqual(storeProductsNum.sort().reverse());
        expect(results[1]).toEqual(storeProductsNum2.sort().reverse());
    });

    it('should return the REVIEWS IN ESTAB according to lowest to highest rating filter', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        var results = filterFunctions.orderFilter('lowest', storeProductsNum, storeProductsNum2)

        expect(results[0]).toEqual(storeProductsNum.sort());
        expect(results[1]).toEqual(storeProductsNum2.sort());
    });
});

describe('exact REVIEWS IN ESTAB rating filter', () => {
    it('should return the REVIEWS IN ESTAB according to 4.0 ratings', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        var results = filterFunctions.reviewFilter(4.0, storeProductsNum);
        var results1 = filterFunctions.reviewFilter(4.0, storeProductsNum2);

        expect(results).toEqual([4.8, 4.5, 4.0, 4.5, 4.5]);
        expect(results1).toEqual([4.3, 4.2]);
    });

    it('should return the REVIEWS IN ESTAB according to 2.0 ratings', () => {

        var storeProductsNum = [4.8, 4.5, 4.0, 3.4, 4.5, 4.5, 5.0, 2.5, 1.0];
        var storeProductsNum2 = [1.2, 4.3, 4.2, 2.3, 2.1, 5.0];

        var results = filterFunctions.reviewFilter(2.0, storeProductsNum);
        var results1 = filterFunctions.reviewFilter(2.0, storeProductsNum2);

        expect(results).toEqual([2.5]);
        expect(results1).toEqual([2.3, 2.1]);
    });
});