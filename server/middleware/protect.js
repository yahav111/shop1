import { verify } from "jsonwebtoken";



async function Protect(req,res,next){
try {
    const token = req.cookies.authToken;
   const decode = verify(token,process.env.JWT_SECRET);

   if(!decode) throw new Error("token not valid!")

} catch (error) {
    console.log(error.message);
    
}
}