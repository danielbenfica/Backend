const express = require("express")
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send("Hello World")
})

app.get('/mesa/caneta', (req, res) => {
  res.send("Escrever no papel")
})

app.listen(port, () => {
  console.log("App running")
})