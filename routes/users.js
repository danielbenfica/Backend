const router = require("express").Router()
const {userController, checkToken} = require("../controllers/userController")

router
  .route("/users")
  .post((req, res) => userController.create(req, res))

router
  .route("/users/getUserByToken")
  .get((req, res) => userController.getUserByToken(req, res))
  
router
  .route("/users/login")
  .post((req, res) => userController.login(req, res))

router
  .route("/users/:id")
  .get(checkToken,(req, res) => userController.getUser(req, res))
  
router
  .route("/users")
  .get((req, res) => userController.getAll(req, res))

router
.route("/users/:id")
.put(checkToken,(req, res) => userController.updateUserDatas(req, res))



module.exports = router;

