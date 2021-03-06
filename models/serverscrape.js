// Parses our HTML and helps us find elements
var cheerio = require("cheerio");
// Makes HTTP request for HTML page
var request = require("request");

// First, tell the console what server1.js is doing
console.log("\n***********************************\n" +
    "Grabbing every story with a photo and link\n" +
    "from cleveland.com web page:" +
    "\n***********************************\n");

// Making a request for reddit's "webdev" board. The page's HTML is passed as the callback's third argument
request("https://www.cleveland.com/", function (error, response, html) {

    // Load the HTML into cheerio and save it to a variable
    // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
    var $ = cheerio.load(html);

    // An empty array to save the data that we'll scrape
    var results = [];

    // With cheerio, find each  li class=  "river-item has-photo" 
    // (i: iterator. element: the current element)
    $("river-item has-photo").each(function (i, element) {

        // Save the text of the element in a "title" variable
        var title = $(element).text();

        // In the currently selected element, look at its child elements,
        // then save the values for any "href" attributes that the child elements may have
        var link = $(element).children().attr("articleheadline", "href", "entry-Content");

        // Save these results in an object that we'll push into the results array we defined earlier
        results.push({
            title: articleheadline,
            link: href,
            brief: entry - Content

        });
    });

    // Log the results once you've looped through each of the elements found with cheerio
    module.exports = scrape;
});
