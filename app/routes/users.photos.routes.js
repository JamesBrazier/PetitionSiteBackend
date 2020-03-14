const controller = require("../controllers/users.photo.controller");

module.exports = function(app)
{
    const url = app.rootUrl + "/users/:id/photo";

    app.route(url).get(controller.get)
                  .put(controller.set)
                  .delete(controller.delete);
}