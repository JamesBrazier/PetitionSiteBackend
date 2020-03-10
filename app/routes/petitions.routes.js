const controller = require("../controllers/petitions.controller");

module.exports = function(app)
{
    const url = app.rootURL + "/petitions";

    app.route(url).get(controller.viewAll)
                  .post(controller.add);

    app.route(url + "/:id").get(controller.view)
                           .patch(controller.update)
                           .delete(controller.delete);

    app.route(url + "/categories").get(controller.categories);
}