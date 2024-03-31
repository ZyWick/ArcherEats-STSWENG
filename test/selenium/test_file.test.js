// import chromedriver so that selenium can by itself open a chrome driver

require("chromedriver");

// import this classes from selenium
const { Builder, By, Key, until } = require("selenium-webdriver");

var assert = require("assert");
const { elementIsVisible } = require("selenium-webdriver/lib/until");

// describe test
/*
describe("Add Establishment", function () {
    // it describes expected behaviour when user perfroms search on google
    it("An admin adds an establishment", async function () {
        // open chrome browser
        let driver = await new Builder().forBrowser("chrome").build();
        try {
            // navigate to to this website
            await driver.get("http://localhost:3000/login");

            // find a search box element with name ='q'
            await driver.findElement(By.name("username"));

            // type 'reflect run' in the search box then press ENTER Key
            await driver.findElement(By.name("username")).sendKeys("boss_nik");

            await driver.findElement(By.name("password"));

            // type 'reflect run' in the search box then press ENTER Key
            await driver.findElement(By.name("password")).sendKeys("banana");

            await driver.findElement(By.css('.btn.btn-light.mt-4.gy-0.signin-js')).click();

            /* wait for the page to load the search result untill the page
              title is equal to `Reflect run - Google Search */
/*await driver.wait(until.titleIs("boss_nik - Profile | ArcherEats"), 1000);

// Get the pagetitle of the current Page

// assert that the current pageTitle is equal to 'Reflect run - Google Search'


await driver.findElement(By.css('.nav-link.dropdown-toggle.p-0')).click();

await driver.findElement(By.xpath('//a[@href="/admin"]')).click();

await driver.wait(until.titleIs("Admin | ArcherEats"), 1000);


await driver.findElement(By.id('estabNameInput')).sendKeys("Test Establishment");

await driver.findElement(By.id('estabDescInput')).sendKeys("Test Description");

await driver.findElement(By.id('tag1Input')).sendKeys("Tag1");

await driver.findElement(By.id('tag2Input')).sendKeys("Tag2");

await driver.findElement(By.id('displayAddressInput')).sendKeys("Address Here");

await driver.findElement(By.id('longitudeInput')).sendKeys("23");

await driver.findElement(By.id('latitudeInput')).sendKeys("123");

await driver.findElement(By.id('addEstabButtonForm')).click();

await driver.wait(until.titleIs("Admin | ArcherEats"), 1000);

let pageTitle = await driver.getTitle();

assert.strictEqual(pageTitle, "Admin | ArcherEats");
if (pageTitle) {
    console.log("Page Title:", pageTitle);
}

} finally {
// close the browser
await driver.quit();
}
});
});
*/

describe("Mute User", function () {
    // it describes expected behaviour when user perfroms search on google
    it("An admin mutes a user", async function () {
        // open chrome browser
        let driver = await new Builder().forBrowser("chrome").build();
        try {
            // navigate to to this website
            await driver.get("http://localhost:3000/login");

            // find a search box element with name ='q'
            await driver.findElement(By.name("username"));

            // type 'reflect run' in the search box then press ENTER Key
            await driver.findElement(By.name("username")).sendKeys("boss_nik");

            await driver.findElement(By.name("password"));

            // type 'reflect run' in the search box then press ENTER Key
            await driver.findElement(By.name("password")).sendKeys("banana");

            await driver.findElement(By.css('.btn.btn-light.mt-4.gy-0.signin-js')).click();

            /* wait for the page to load the search result untill the page
              title is equal to `Reflect run - Google Search */
            await driver.wait(until.titleIs("boss_nik - Profile | ArcherEats"), 1000);

            // Get the pagetitle of the current Page

            // assert that the current pageTitle is equal to 'Reflect run - Google Search'


            await driver.findElement(By.css('.nav-link.dropdown-toggle.p-0')).click();

            await driver.findElement(By.xpath('//a[@href="/admin"]')).click();

            await driver.wait(until.titleIs("Admin | ArcherEats"), 1000);


            await driver.findElement(By.id('userManagementButton')).click();


            await driver.wait(until.titleIs("Admin | ArcherEats"), 1000);

            let pageTitle = await driver.getTitle();

            assert.strictEqual(pageTitle, "Admin | ArcherEats");
            if (pageTitle) {
                console.log("Page Title:", pageTitle);
            }

        } finally {
            // close the browser
            await driver.quit();
        }
    });
});