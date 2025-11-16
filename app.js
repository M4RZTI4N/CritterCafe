const express = require('express')
const session = require('express-session')
const flash = require("express-flash")
const multer = require("multer")
const ejs = require("ejs")
const app = express()
const path  = require("path")
const port = 3000

const storage = multer.diskStorage({
  destination: function(req,file,cb){
    cb(null,"./uploads/")
  },
  filename: function(req,file,cb){
    cb(null,file.fieldname + "-"+Date.now() + "-" + +Math.random().toString() + path.extname(file.originalname))
  }
})

const upload = multer({storage:storage}).array("images",4)

app.use(session({
  secret: "lalala",
  resave: false,
  saveUninitialized: false
}))
app.use(flash())
app.use(express.urlencoded({ extended: true }));
app.use((req,res,next)=>{
  res.locals.session = req.session;
  next();
})
app.set("view engine","ejs")
app.set('views', path.join(__dirname, 'views'));


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://dev:iamastro42@cluster0.jcmziu4.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

async function checkLogin(user,pass){
  try {
    await client.connect();
    let logins = await client.db("CritterCafe").collection("Logins").find({username: user}).toArray()
   
    console.log(logins)
    if(logins.length > 0){
      if(logins[0].password == pass){return true}
      else {return false}
    } else {
      return false
    }

    

  } catch {
    await client.close()
  }
}

async function addLogin(user,pass){
  try {
    await client.connect();


    
    
    let logins = await client.db("CritterCafe").collection("Logins").insertOne({
      username:user,
      password:pass
    })

    return true

  } catch {
    await client.close()
    return false
  }
}
async function getRecipes(){
  try{
    await client.connect();
    let recipes = await client.db("CritterCafe").collection("Recipe").find().toArray();
    return {
      status: "success",
      data: recipes
    }
  } catch {
    await client.close()
    return {
      status: "error",
      data: "something went wrong"
    }
  }
}
async function getRecipe(username,title){
  try{
    await client.connect();
    let recipe = await client.db("CritterCafe").collection("Recipe").find({
      username:username,
      recipe_name: title
    }).toArray();
    return recipe[0]
  } catch {
    await client.close()
    
  }
}

async function addrecipe(username,recipe,ingredients,directions,img){
  try {
    await client.connect();


    
    
    let logins = await client.db("CritterCafe").collection("Recipe").insertOne({
      username:username,
      recipe_name:recipe,
      ingredients: ingredients,
      directions: directions,
      img: img
    })

    return true

  } catch {
    await client.close()
    return false
  }
}

app.get('/', async (req, res) => {
  let info = req.flash("info")[0]
  console.log(info)
  let recipes = await getRecipes();
  res.render("index",{
    "info":info,
    "username":req.session.username,
    "password":req.session.password,
    "recipes": recipes
  })
})

app.get('/login',(req,res) => {
  if(req.session.username){
    res.redirect("/profile")
  } else {
    res.render("login")
  }
})

app.get('/signup',(req,res)=>{
  res.render("signup")
})

app.get('/submit',(req,res)=>{
  if(req.session.username){
    res.render("submit",{
      "username":req.session.username
    })
  } else {
    req.flash("info","log in first")
    res.redirect("/")
  }
  
})

app.get('/profile',(req,res)=>{
  if(req.session.username){
    res.render("profile",{
      "username":req.session.username
    })
  } else {
    req.flash("info","log in first")
    res.redirect("/")
  }
})

app.get('/recipe/:username-:title', async (req,res)=>{
  console.log("searching for:",req.params.username,req.params.title)
  let recipe = await getRecipe(req.params.username,req.params.title)
  console.log("got recipe:",recipe)
  console.log("imgs: ", recipe.img)
  res.render("recipe",{
    username: recipe.username,
    title: recipe.recipe_name,
    ingredients: recipe.ingredients,
    instructions: recipe.directions,
    img: recipe.img
  })
})

app.post('/api/submit',upload, async (req,res)=>{
  let filepaths = []
  if(req.files){
    console.log("uploaded files: ", req.files)
    req.files.forEach(function(f){
      filepaths.push(f.path.replace("\\","/"))
    })
  }

  let success = await addrecipe(req.session.username,req.body.name,req.body.ingredients,req.body.instructions,filepaths)
  console.log(req.body)
  res.redirect("/")
})


app.post('/api/login',async (req,res)=>{
  console.log("form response: ", req.body)
  let result = await checkLogin(req.body.username,req.body.password)
  console.log("login result: ", result)
  if(result){
    req.session.username = req.body.username;
    req.session.password = req.body.password
    res.redirect('/profile')
  }else{
    req.flash("info","incorrect login")
    res.redirect('/')
  }
    
})

app.post('/api/signup', async (req,res)=>{
  let sucess = await addLogin(req.body.username,req.body.password)
  if(sucess){
    req.session.username = req.body.username;
    req.session.password = req.body.password;
    res.redirect('/profile')
  } else {
    req.flash("info","error with creating account")
    res.redirect("/")
  }
  
})

app.get('/api/signout',async (req,res)=>{
  delete req.session.username
  delete req.session.data
  req.flash("info","you have been signed out")
  res.redirect("/")
})

app.use('/css',express.static("css"))
app.use('/js',express.static("js"))
app.use('/img',express.static("img"))
app.use('/uploads', express.static("uploads"))
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
