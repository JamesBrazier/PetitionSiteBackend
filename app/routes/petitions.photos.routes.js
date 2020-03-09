const controller = require("../controllers/petitions.photos.controller");

module.exports = function(app) 
{
    const url = app.rootURL + "/petitions/:id/photo";

    app.route(url).get(controller.get)
                  .put(controller.set);
}