// Server API Routing -
// The module arguments are required. This code is used to
// access the Express application object, database object, and the root path
// of the application.
// * /
module.exports = function (app, db, approot) {

    var path = require('path');

    var scraper = require(path.join(approot, '/models/serverscrape.js')).scraper;


    var renderdata = {
        heading: scraper.heading, // 'Cleveland.com Scraper',
        origin: scraper.origin   // 'https://www.cleveland.com/'
    };

    // POST /api/list - This path is used when submitting after choosing 
    // an issue from the list

    app.post('/api/list', function (req, res) {
        // find all items with a matching an issue ID
        var issueId = db.mongoose.Types.ObjectId(req.body.issueselect);
        var issueText = '';

        db.IssueModel.findOne({ '_id': issueId })
            .exec(function (err, doc) {
                if (err) throw err;
                issueText = doc.issue;
                db.ItemModel.find({ 'issue': issueId })
                    .exec(function (err, items) {
                        if (err) throw err;
                        var itemlist = Object.assign({}, renderdata, { issueselect: issueId, issue: issueText, items: JSON.parse(JSON.stringify(items)) });
                        res.render('itemlist', itemlist);
                    });
            });
    });


    // POST /api/scrape - This path is used for initiating a new scrape,
    // if there's nothing new to scrape then the user will be notified.

    app.post('/api/scrape', function (req, res) {
        scraper.scrapeIt(db, function (isNew) {
            var path = '/index?isnew=' + isNew;
            res.redirect(path);
        });
    });

    // POST /api/view - This path is used when submitting  and after choosing 
    // an item from the collection

    app.post('/api/view', function (req, res) {
        var itemID = db.mongoose.Types.ObjectId(req.body.itemID);
        var issueID = db.mongoose.Types.ObjectId(req.body.issueselect);
        var issueText = req.body.issue;

        db.ItemModel.findOne({ '_id': itemID })
            .exec(function (err, item) {
                if (err) throw err;
                var item = Object.assign({}, renderdata, { issueselect: issueID, issue: issueText, item: JSON.parse(JSON.stringify(item)) });
                // search for comments associated with this item, and
                // add to the rendering data if any are found
                db.CommentModel.find({ 'item': itemID })
                    .exec(function (err, comments) {

                        var tmp = JSON.parse(JSON.stringify(comments));
                        for (var idx = 0; idx < tmp.length; idx++) {
                            tmp[idx].date = new Date(tmp[idx].date).toLocaleString();
                        }
                        var fullitem = Object.assign({}, item, { comments: tmp });
                        res.render('item', fullitem);
                    });
            });
    });


    // POST /api/comment - This path is used when submitting after entering 
    // a comment for a viewed item

    app.post('/api/comment', function (req, res) {
        var itemID = db.mongoose.Types.ObjectId(req.body.itemID);
        var issueText = req.body.issue;

        // create a new comment
        var newComment = {
            item: itemID,
            body: req.body.comment
        };

        var tmp = new db.CommentModel(newComment);
        tmp.save(function (err, doc) {
            if (err) throw err;
            // new comment created, add to the item's comment list
            db.ItemModel.findOneAndUpdate({ _id: itemID },
                { $push: { 'comments': doc._id, $sort: 1 } },
                { new: true },
                function (err, item) {
                    if (err) throw err;
                    // the 307 status allows for redirecting a POST with a body
                    res.redirect(307, '/api/view');
                }
            );
        });
    });


    // POST /api/delete - This path is used when submitting to delete 
    // a comment for a viewed item.
    // NOTE: Since this function needs to redirect the POST with a body
    // it can't be a DELETE method. 

    app.post('/api/delete', function (req, res) {
        var itemID = db.mongoose.Types.ObjectId(req.body.itemID);
        var commentID = db.mongoose.Types.ObjectId(req.body.commentID);
        var issueText = req.body.issue;

        db.CommentModel.findOneAndUpdate({ _id: commentID },
            { deleted: true },
            function (err, item) {
                if (err) throw err;
                // the 307 status allows for redirecting a POST with a body
                res.redirect(307, '/api/view');
            }
        );
    });
};