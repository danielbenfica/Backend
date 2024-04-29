const router = require("express").Router()

//Register router
const registerRouter = require("./users")

router.use("/", registerRouter)

module.exports = router
