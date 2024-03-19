const asyncHandler = (reqHandler) =>{
    (req,res,next)=>{
        Promise.resolve(reqHandler(req,res,next))
        .catch(err => next(err))
    }
}


export {asyncHandler}



// const asyncHandler = (fn) => {}
// const asyncHandler = (func) => {()=>{}}
// const asyncHandler = (fun) => async(req,res,next)=>{
//         try {
//             await fun(req,res,next)
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success : false,
//                 message : error.message}
//             ) 
            
//         }
// }