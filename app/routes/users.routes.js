const controller = require("../controllers/users.controller");

module.exports = function(app)
{
    const url = app.rootURL + "/users";

    app.route(url + "/register").post(controller.add);

    app.route(url + "/login").post(controller.login);

    app.route(url + "/logout").post(controller.logout);

    app.route(url + "/:id").get(controller.get)
                           .patch(controller.update);
}