const controller = require("../controllers/petitions.signatures.controller");

module.exports = function(app)
{
    const url = app.routeUrl + "/petitions/:id/signatures";

    app.route(url).get(controller.get)
                  .post(controller.add)
                  .delete(controller.delete);
}