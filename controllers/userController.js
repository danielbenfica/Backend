require('dotenv').config()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { User } = require("../models/User")

function checkToken(req, res, next){
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(" ")[1]

  if(!token){
    return res.status(401).json({msg: "Acesso negado!"})
  }

  try {
    const secret = process.env.SECRET
    jwt.verify(token, secret)
    next()
  } catch (error) {
    res.status(400).json({msg: "Token Inválido"})
  }
}

const userController = {
  create: async(req, res) => {
    try{
      const {name, email, password, confirmPassword} = req.body

      if(!name){
        return res.status(422).json({msg: "O nome é obrigatório"})
      }
      if(!email){
        return res.status(422).json({msg: "O email é obrigatório"})
      }
      if(!password){
        return res.status(422).json({msg: "A senha é obrigatório"})
      }
      if(password !== confirmPassword ){
        return res.status(422).json({msg: "As senhas não conferem"})
      }

      const userExists = await User.findOne({email: email}) 
      
      if(userExists){
        return res.status(422).json({msg: "Por favor, utilize outro e-mail"})
      }

      const salt = await bcrypt.genSalt(12)
      const passwordHash = await bcrypt.hash(password, salt)

      const user = new User({
        name,
        email,
        password: passwordHash,
        biography: ""
      })

      try{
        const userSaved = await user.save()

        const secret = process.env.SECRET

        const token = jwt.sign({
          id: userSaved._id
        }, secret)

        const newUser = await User.findById(userSaved._id, "-password")
        res.status(201).json({msg: "Usuário criado com sucesso!", newUser, token})
      }catch(error){
        res.status(500).json({msg: "Ocorreu um erro no servidor, tente novamente mais tarde!"})
      }

    } catch(error){
      console.log(error)
    }
  },
  login: async(req, res) => {
    const {email, password} = req.body

    if(!email){
      return res.status(422).json({msg: "O email é obrigatório"})
    }
    if(!password){
      return res.status(422).json({msg: "A senha é obrigatório"})
    }

    const user = await User.findOne({email: email}) 
      
    if(!user){
      return res.status(404).json({msg: "Usuário não encontrado"})
    }
    
    const checkPassword = await bcrypt.compare(password, user.password)
    
    if(!checkPassword){
      return res.status(422).json({msg: "Usuário ou senha inválidos"})
    }

    try{
      const secret = process.env.SECRET

      const token = jwt.sign({
        id: user._id
      }, secret)

      const returnUser = await User.findById(user._id, "-password")

      res.status(200).json({msg: "Usuário autenticado com sucesso!", token, returnUser})
    
    }catch(error){
      console.log(error)
      res.status(500).json({msg: "Ocorreu um erro no servidor, tente novamente mais tarde!"})
    }
  },

  getUser: async(req, res) => {
    const id = req.params.id

    const user = await User.findById(id, "-password")

    if(!user){
      return res.status(404).json({msg: "Usuário não encontrado!"})
    }

    res.status(200).json({user})
  },
  getAll: async(req, res) => {
    try{
      const users = await User.find({}, "-password")
      res.json({users})
    } catch(error){
      console.log(error)
      res.status(500).json({msg: "Houve um erro ao tentar buscar usuários"})
    }
  },
  updateUserDatas: async(req, res) => {
    try {
      const routerId = req.params.id
      const userId = req.body.id
      
      if(routerId !== userId){
        return res.status(400).json({msg: "Esse usuário não autorização para editar esse dado"})
      }

      const oldUser = await User.findById(userId)

      if(req.body.email){
        const emailExists = await User.findOne({email: req.body.email}) 
        if(emailExists !== oldUser && emailExists){
          return res.status(422).json({msg: "Por favor utilize outro e-mail"})
        }
      }


      const newUserDatas = {
        id: userId,
        name: req.body.name ? req.body.name : oldUser.name,
        email: req.body.email ? req.body.email : oldUser.email,
        biography: req.body.biography ? req.body.biography : oldUser.biography,
      }

      const updateUserDatas = await User.findByIdAndUpdate(userId, newUserDatas)

      if(!updateUserDatas){
        return res.status(404).json({msg:"Usuário não encontrada"})
      }

      const updatedUser = await User.findById(userId, "-password")

      res.status(200).json({updatedUser})


    } catch (error) {
      console.log(error)
    }
  },
  getUserByToken: async(req, res) => {
    try{
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(" ")[1]

      const tokenDatas = jwt.decode(token)
      const userId = tokenDatas.id
      const user = await User.findById(userId, "-password")

      if(!user){
        return res.status(404).json({msg: "Usuário não encontrado"})
      }

      res.status(200).json({user})

    }catch(error){
      console.log(error)
      return res.status(500).json({msg: "Ocorreu um erro no servidor, por favor tente novamente mais tarde"})
    }
  } 
}

module.exports = {userController, checkToken};
