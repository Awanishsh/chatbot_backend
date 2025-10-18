import User from "../models/User.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Chat from "../models/chat.js";


// generate JWT

const generateToken = (id)=> {
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn: '30d'
    })
}

// API for user resistration

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await User.findOne({email})
    if(userExist){
        return res.json({success: false, message:" User already exites"})
    }

    const user = await User.create({name, email, password})
    const token = generateToken(user._id)
    res.json({success:true, token})

    
  } catch (error) {
    return res.json({success: false, message: error.message})
  }
};


// Api to user login 

export const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
           const user = await User.findOne({email})

           if(user){
            const isMatch = await bcrypt.compare(password, user.password)
            if(isMatch){
                const token = generateToken(user._id);
                return res.json({success:true, token})
            }


           }

           return res.json({success:false, message: "Invalid email or password"})
    } catch (error) {
         return res.json({success: false, message: error.message})
    }
}

// api to get user data 

export const getUser = async( req, res)=>{
  try {
     const user = req.user;
     return res.json({success: true, user})
  } catch (error) {
     return res.json({success: false, message: error.message})
  }
}


// api to get publish images 

export const getPublishedImages = async (req, res)=>{
  try {
    const publishImageMessage = await Chat.aggregate([
      {
        $unwind:"$messages"
      },
      {$match:{
        "messages.isImage":true,
         "messages.isPublished":true,
      }
    },
    {
      $project:{
        _id:0,
        imageUrl:"$messages.content",
        userName:"$userName"
      }
    }
    ])
    res.json({success:true, image:publishImageMessage.reverse()})
  } catch (error) {
    res.json({success:false, message:error.message})
  }
}