require('dotenv').config()
const mongoose = require("mongoose")


async function main(){
  try {
    const dbUser = process.env.DB_USER
    const dbPassword = process.env.DB_PASS

    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@cluster0.kkv4zck.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    )

    console.log("Conectado ao banco!")
  } catch (error) {
    console.log(error)
  }

}

module.exports = main;
