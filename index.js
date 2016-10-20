request = require("request"),
cheerio = require("cheerio");
range   = require("range");
async   = require("async");

var leaderboard = {};

var curPage = 1;

function sendRequest(callback) {

    if (curPage == 1) {
        curURL = 'http://www.iwaspoisoned.com/reports/';
    } else {
        curURL = 'http://www.iwaspoisoned.com/reports/page/' + curPage;
    }

    curPage++;

    options = {
        url : curURL,
        headers : {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A'
        }
    };

    request(options, function (error, response, body) {
      if (!error) {
        var $ = cheerio.load(body);

        $(".report > h3 > a").each(function () {
            title = this.children[0].data,
            restaurant = title.split(',')[0];

            if (leaderboard[restaurant] != undefined) {
                leaderboard[restaurant] = leaderboard[restaurant] + 1;
            } else {
                leaderboard[restaurant] = 1;
            }
        });

      } else {
        console.log("We’ve encountered an error: " + error);
      }

        callback(null);
    });

};

function sendRequestWrapper(n, done) {
    console.log('Calling sendRequest', n);
    sendRequest(function(err) {
        done(err);
    });
};

async.timesSeries(35, sendRequestWrapper, function () {
    var sortable = [];
    for (var k in leaderboard) {
      sortable.push([k, leaderboard[k]])
    }
    sortable.sort( function(a, b) {
        return a[1] - b[1]
    });
    console.log(sortable.reverse());
});