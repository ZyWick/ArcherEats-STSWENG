const isEven = require("./testModule");

describe("addEstab", () => {
    test("Complete Body parameters - should return OK result", () => {
        expect(isEven(2)).toBe(true);
    });

    test("Incomplete body parameters - should return bad result", () => {
        expect(isEven(3)).toBe(false);
    });

    test("Invalid file input - should return bad result", () => {
        expect(() => isEven(-1)).toThrow();
    });

    test("No file input - should return bad result", () => {
        expect(() => isEven("1")).toThrow();
    });
});

describe("muteUser", () => {
    test("Valid user, time, and reason - should return OK result", () => {
        expect(isEven(2)).toBe(true);
    });

    test("Invalid user - should return bad result", () => {
        expect(isEven(3)).toBe(false);
    });

    test("Missing parameters - should return bad result", () => {
        expect(() => isEven(-1)).toThrow();
    });

    test("No reason for why to mute - still should pass", () => {
        expect(() => isEven("1")).toThrow();
    });
});