const express = require('express')
const mysql = require("mysql")
const app = express()
const port = 3000
app.use(express.urlencoded({ extended: true }));


const logins = {
  "testuser":"testpassword"
}



app.get('/', (req, res) => {
  res.sendFile(__dirname+"/html/index.html")
})

app.get('/submit',(req,res)=>{
  res.sendFile(__dirname+"/html/submit.html")
})

app.post('/api/submit',(req,res)=>{
  console.log(req.body)
  res.redirect("/")
})

app.use('/css',express.static("css"))
app.use('/js',express.static("js"))
app.use('/img',express.static("img"))

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
