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
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use((req,res,next)=>{
  res.locals.session = req.session;
  next();
})
app.set("view engine","ejs")
app.set('views', path.join(__dirname, 'views'));


const { MongoClient, ServerApiVersion } = require('mongodb');
const { encode } = require('punycode')
const uri = "mongodb+srv://dev:iamastro42@cluster0.jcmziu4.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
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
      password:pass,
      favorites:[]
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
async function getRecipe(uri){
  try{
    await client.connect();
    let recipe = await client.db("CritterCafe").collection("Recipe").find({
      url:uri
    }).toArray();
    return recipe[0]
  } catch {
    await client.close()
    
  }
}

async function editRecipe(oldURI, new_name,new_ingredients,new_directions,removeIMG,newIMG,allergens){
  try{
    console.log("////////////////")
    await client.connect();
    let collection = await client.db("CritterCafe").collection("Recipe")
    let response = await collection.find({
      url:oldURI
    }).toArray();
    
    let recipe = response[0]
    console.log(recipe)
    let docID = recipe._id
    const filter = {_id: docID}
    let uri = recipe.username + "-" + new_name
    uri = uri.replace(/\s/g, "").trim();
    let existingIMG = recipe.img
    console.log("existing img: ",existingIMG)
    console.log("remove img: ", removeIMG)
    let reusltIMG = existingIMG.filter((img) => !removeIMG.includes(img))
    console.log("post removal: ", reusltIMG)

    let docIMG = newIMG.concat(reusltIMG)
    console.log("final img list: ", docIMG)
    const updateDoc = {
      $set:{
        recipe_name: new_name,
        ingredients: new_ingredients,
        directions: new_directions,
        url: uri,
        img: docIMG,
        allergens: allergens
      }
    } 

    const result = await collection.updateOne(filter,updateDoc)
    
    console.log(result)
    console.log("\\\\\\\\\\\\\\\\\\\\\\\\")

  } catch {
    await client.close()
    
  }
}

async function deleteRecipe(uri){
  try {
    await client.connect();
    const collection = await client.db("CritterCafe").collection("Recipe")

    const result = await collection.deleteOne({url:uri})

    console.log(`${result.deletedCount} documents deleted`)
  } catch {
    await client.close()
  }
}

async function addrecipe(username,recipe,ingredients,directions,img,allergens){
  try {
    await client.connect();

    let uri = username + "-" + recipe
    uri = uri.replace(/\s/g, "").trim();
    
    
    let logins = await client.db("CritterCafe").collection("Recipe").insertOne({
      username:username,
      recipe_name:recipe,
      url: uri,
      ingredients: ingredients,
      directions: directions,
      img: img,
      likes:[],
      dislikes:[],
      allergens:allergens
    })

    return true

  } catch {
    await client.close()
    return false
  }
}
async function searchRecipe(name){
  try{
    await client.connect();
    console.log("query: ", name)
    const pipeline = [
      {
        $search:{
          index:"default",
          text:{
            query: name,
            path: ["recipe_name"],
            fuzzy:{}
          }
        }
      }
    ]

    
    let recipe = await client.db("CritterCafe").collection("Recipe").aggregate(pipeline).toArray()
    
    console.log(recipe)
    return {
      status: "success",
      data: recipe
    }
  } catch (e){
    await client.close()
    console.error("atlas search error")
    console.error(e)
    return {
      status: "error",
      data: "something went wrong"
    }
  }
}

async function upvote(username, uri){
  try {

    await client.connect();
    let db = await client.db("CritterCafe")
    let recipes = await db.collection("Recipe")

    let result = await recipes.updateOne(
      {url:uri},{
        $addToSet:{
          likes: username
        },
        $pull:{
          dislikes: username
        }
      }
    )
    console.log("upvote: docs matched",result.matchedCount,"docs changed",result.modifiedCount)
    

  } catch {
    await client.close()
  }
}
async function downvote(username, uri){
  try {
    await client.connect();
    let db = await client.db("CritterCafe")
    let recipes = await db.collection("Recipe")
    let result = await recipes.updateOne(
      {url:uri},{
        $pull:{
          likes: username
        },
        $addToSet:{
          dislikes: username
        }
      }
    )
    console.log("downvote: docs matched",result.matchedCount,"docs changed",result.modifiedCount)

  } catch {
    await client.close()
  }
}
async function novote(username, uri){
  try {
    await client.connect();
    let db = await client.db("CritterCafe")
    let recipes = await db.collection("Recipe")
    let result = await recipes.updateOne(
      {url:uri},{
        $pull:{
          likes: username,
          dislikes: username
        }
    })
    console.log("novote: docs matched",result.matchedCount,"docs changed",result.modifiedCount)

  } catch {
    await client.close()
  }
}
async function addFav(username, uri){
  try {

    await client.connect();
    let db = await client.db("CritterCafe")
    let users = await db.collection("Logins")

    let result = await users.updateOne(
      {username:username},{
        $addToSet:{
          favorites: uri
        }
      }
    )
    console.log("add fav: docs matched",result.matchedCount,"docs changed",result.modifiedCount)
  } catch {
    await client.close()
  }
}
async function removeFav(username, uri){
  try {

    await client.connect();
    let db = await client.db("CritterCafe")
    let users = await db.collection("Logins")

    let result = await users.updateOne(
      {username:username},{
        $pull:{
          favorites: uri
        }
      }
    )
    console.log("remove fav: docs matched",result.matchedCount,"docs changed",result.modifiedCount)
  } catch {
    await client.close()
  }
}
async function getFavs(username){
  try{
    await client.connect();
    let user = await client.db("CritterCafe").collection("Logins").find({
      username: username
    }).toArray();
    return user[0].favorites
  } catch {
    await client.close()
    
  }
}
async function getRecipiesFromFav(fav_list){
  try{
    await client.connect();
    let recipes = await client.db("CritterCafe").collection("Recipe").find({
      url:{
        $in:fav_list
      }
    }).toArray();
    return recipes
  } catch {
    await client.close()
    return null
  }
}









app.get('/', async (req, res) => {
  let info = req.flash("info")[0]
  console.log(info)
  res.render("index",{
    "info":info,
    "username":req.session.username,
    "password":req.session.password
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

app.get('/profile',async (req,res)=>{
  if(req.session.username){
    let favs = await getFavs(req.session.username)
    let fav_list = await getRecipiesFromFav(favs)
    res.render("profile",{
      "username":req.session.username,
      "favs":fav_list
    })
  } else {
    // req.flash("info","log in first")
    res.redirect("/login")
  }
})

app.get('/browse',async (req,res)=>{
  const query = req.query.query
  console.log(query)
  if(query){
    let searchedRecipes = await searchRecipe(query)
    res.render("browse",{
      recipes: searchedRecipes,
      username: req.session.username
    })
  } else {
    let allRecipes = await getRecipes()
    res.render("browse",{
      recipes: allRecipes,
      username: req.session.username
    })
  }
})

app.get('/about',(req,res)=>{
  res.render("about",{
    username:req.session.username
  })
})

app.get('/recipe/:uri', async (req,res)=>{
  console.log("searching for:",req.params.uri)
  let recipe = await getRecipe(req.params.uri)
  console.log("got recipe:",recipe)
  console.log("imgs: ", recipe.img)
  let fav_list = []
  if(req.session.username){
    fav_list = await getFavs(req.session.username)
  }

  if (req.session.username == recipe.username){
    res.render("edit_recipe",{
      username: recipe.username,
      title: recipe.recipe_name,
      ingredients: recipe.ingredients,
      instructions: recipe.directions,
      img: recipe.img,
      uri: recipe.url,
      likes:recipe.likes,
      dislikes:recipe.dislikes,
      allergens:recipe.allergens,
      favs: fav_list
    })
  } else {
    res.render("recipe",{
      username: recipe.username,
      title: recipe.recipe_name,
      ingredients: recipe.ingredients,
      instructions: recipe.directions,
      img: recipe.img,
      uri: recipe.url,
      likes:recipe.likes,
      dislikes:recipe.dislikes,
      allergens:recipe.allergens,
      favs: fav_list
    })
  }
  
})





app.post('/api/submit',upload, async (req,res)=>{
  let filepaths = []
  if(req.files){
    console.log("uploaded files: ", req.files)
    req.files.forEach(function(f){
      filepaths.push(f.path.replace("\\","/"))
    })
  }
  console.log(req.body)
  let data = req.body //why do i have to do this 
  let keys = Object.keys(data)
  let allergens = keys.filter(key => data[key] === "on");
  console.log(allergens)
  let success = await addrecipe(req.session.username,req.body.name,req.body.ingredients,req.body.instructions,filepaths,allergens)
  
  res.redirect("/")
})

app.post('/api/edit',upload,async (req,res)=>{
  console.log("==================== <<< EDIT DATA")
  console.log(req.body)
  console.log(req.files)
  console.log("====================")
  let filepaths = []
  if(req.files){
    console.log("uploaded files: ", req.files)
    req.files.forEach(function(f){
      filepaths.push(f.path.replace("\\","/"))
    })
  }
  let data = req.body //why do i have to do this 
  let keys = Object.keys(data)
  let allergens = keys.filter(key => data[key] === "on");
  console.log(allergens)
  await editRecipe(req.body.oldURI,req.body.name,req.body.ingredients,req.body.instructions,req.body.imgRemove,filepaths,allergens)
  res.redirect("/")
})

app.post('/api/delete',async (req,res)=>{
  console.log("deleting ", req.body.uri)
  await deleteRecipe(req.body.uri.trim())
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

app.post('/api/upvote',async (req,res)=>{
  if(req.session.username){
    console.log("got upvote from ", req.session.username)
    console.log(req.body)
    await upvote(req.session.username,req.body.url)
  }
})
app.post('/api/downvote',async (req,res)=>{
  if(req.session.username){
    console.log("got downvote from ", req.session.username)
    console.log(req.body)
    await downvote(req.session.username,req.body.url)
  }
})
app.post('/api/novote',async (req,res)=>{
  if(req.session.username){
    console.log("got novote from ", req.session.username)
    console.log(req.body)
    await novote(req.session.username,req.body.url)
  }
})
app.post('/api/addFav',async (req,res)=>{
  if(req.session.username){
    console.log("got add fav from ", req.session.username)
    console.log(req.body)
    await addFav(req.session.username,req.body.url)
  }
})
app.post('/api/removeFav',async (req,res)=>{
  if(req.session.username){
    console.log("got remove fav from ", req.session.username)
    console.log(req.body)
    await removeFav(req.session.username,req.body.url)
  }
})




app.use('/css',express.static("css"))
app.use('/js',express.static("js"))
app.use('/img',express.static("img"))
app.use('/uploads', express.static("uploads"))
app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})
