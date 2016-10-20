request = require("request"),
cheerio = require("cheerio");
async   = require("async");
var express = require('express');
var app = express();

var leaderboard = {};
var sortable = [];
var curPage = 1;
var numPages = 35;

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index', {sortable: sortable});
});

function sendRequest(n, done) {
    console.log('Calling sendRequest', n+1);

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

        done(null);
    });
};

async.timesSeries(numPages, sendRequest, function () {
    for (var k in leaderboard) {
      sortable.push([k, leaderboard[k]])
    }
    sortable.sort( function(a, b) {
        return a[1] - b[1]
    });
    console.log(sortable.reverse());

    app.listen(app.get('port'), function() {
      console.log('Node app is running on port', app.get('port'));
    });

});
