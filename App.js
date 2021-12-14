const express = require('express')
const handlebars = require("express-handlebars")
const app = express()
const admin= require('./rotas/admin')
const path = require('path')
const moment = require("moment")
const mongoose = require("mongoose")
moment.locale('pt-br')
require('./models/Post')
const Postagem = mongoose.model('postagem')



app.use(express.static(path.join(__dirname, "public")))
//config
app.use(express.urlencoded({extended:true}))
app.use(express.json())
//handlebars
app.engine('handlebars', handlebars({defaultLayout:'main', helpers: {
    formatDate: (date) => {
         return moment(date).format('DD/MM/YYYY'),
          moment(date).startOf('now').fromNow()
     }
    }
}))
app.set('view engine', 'handlebars')
//mongoose
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/testdb").then(()=>{
    console.log("conectado ao mongodb")
}).catch((err)=>{
    console.log("erro"+err)
})
//rotas

app.use('/admin',admin)

app.get("/", async (req, res)=>{
    const postagens = await Postagem.find().lean().populate('categoria').sort({data:"desc"})
        res.render("index",{postagens:postagens})
           
})


app.get("/404",(req,res)=>{
    res.send("erro 404")
})
app.get("/posts",(req, res)=>{
    res.render("Lista de posts")
})
app.get("/postagem/:slug",async (req,res)=>{
   const postagem = await Postagem.findOne({slug:req.params.slug}).lean()

   if(postagem){
        res.render("postagem/index",{postagem:postagem})
   }else{
       console.log("erro")
       res.redirect("/")
   }

})



//outros

const PORT =8081
app.listen(PORT,()=>{
    console.log('running server')
})