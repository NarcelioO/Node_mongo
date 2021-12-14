const express = require('express')
const app = express()
const router = express.Router()
const mongoose = require("mongoose")
require ("../models/Categoria")
require("../models/Post")
const Categoria = mongoose.model("categorias")
const Postagem = mongoose.model("postagem")
const session = require("express-session")
const flash = require("connect-flash")

console.log(Categoria)
app.use(session({
    secret:"cursonode",
    resave:true,
    saveUninitialized:true
}))
app.use(flash())
app.use((req, res, next)=>{
    res.locale.success_msg = req.flash("Success message")
    res.locale.error_msg =req.flash("error")
    next()
})
router.get('/', (req,res)=>{
    res.render("admin/index")
})
router.get('/posts',(req,res)=>{
    res.send("posts")
})
router.get('/categorias',async (req,res)=>{

    const categorias = await Categoria.find().sort({date:'desc'}).lean()

    res.render('admin/categorias', {categorias:categorias})
    
})
router.get('/categorias/add', (req,res)=>{
    res.render("admin/addcategoria")
})
router.post('/categorias/nova', (req,res)=>{
    var erros = []


    if(!req.body.nome || typeof req.body.nome == undefined||typeof req.body.nome==null){
            erros.push({texto:"nome invalido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined||typeof req.body.slug==null){
        erros.push({texto:"slug invalido"})
    }  
    if(req.body.slug.length < 2){
        erros.push({texto:"nome muito pequeno"})
    } 
    if(erros.length > 0){
        res.render("admin/addcategoria",{erros:erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(()=>{
            res.redirect('/admin/categorias')
        }).catch((err)=>{
            
            res.redirect('/admin')
        })
    }




    
})
router.get("/categorias/edit/:id",(req,res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategorias",{categoria:categoria})
    }).catch((err)=>{
        console.log(err)
        res.redirect('/admin/categorias')
    })
    
})
router.post("/categorias/edit",(req,res)=>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            console.log(err)
            res.redirect("/admin/categorias")
        }) 
    }).catch((err)=>{
        console.log(err)
        res.redirect('/admin/categorias')
    })
    
})
router.post("/categorias/deletar", (req, res)=>{
 Categoria.deleteOne({_id:req.body.id}).then(()=>{
     res.redirect("/admin/categorias")
 })
})

router.get("/postagens", async (req,res)=>{
    try{
    const posts = await Postagem.find().lean().populate("categoria").sort({data:'desc'})
    res.render("admin/postagens",{posts:posts})
    } catch(error){
        res.send('/404')
    }
})
router.get("/postagens/add",(req,res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagens", {categorias:categorias})
    }).catch((err)=>{
        console.log(err)
        res.redirect("/admin")
    })
     
})

router.post("/postagens/nova",(req,res)=>{
    const erros =[]

    if(req.body.categoria == "0"){
        erros.push({text:"categoria invalida"})
    }
    if(erros.length>0){
        res.send("admin/postagens",{erros:erros })
    }else{
        const NovaPostagem={
            titulo:req.body.titulo,
            descricao:req.body.descricao,
            conteudo:req.body.conteudo,
            categoria:req.body.categoria,
            slug:req.body.slug
        }

        new Postagem(NovaPostagem).save().then(()=>{
            console.log("post criado")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            console.log(err)
            res.redirect("/admin/postagens")
        })
    }
})
router.get("/postagens/edit/:id", (req,res)=>{

    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens",{categorias:categorias,postagem:postagem})
        })
    })
  
})

router.post("/postagens/edit",(req,res)=>{
    Postagem.findOne({_id: req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        

        postagem.save().then(()=>{
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            console.log(err)
            res.redirect("/admin/postagens")
        }) 
    }).catch((err)=>{
        console.log(err)
        res.redirect('/admin/postagens')
    })
    
})

router.post("/postagens/deletar", (req, res)=>{
    Postagem.deleteOne({_id:req.body.id}).then(()=>{
        res.redirect("/admin/postagens")
    })
   })


module.exports = router