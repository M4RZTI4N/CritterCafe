const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(__dirname+"/html/index.html")
})

app.use('/css',express.static("css"))
app.use('/js',express.static("js"))
app.use('/img',express.static("img"))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
