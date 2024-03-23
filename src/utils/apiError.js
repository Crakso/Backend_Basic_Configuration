class apiError extends Error{

constructor(
    statusCode,
    message= "something wents wrong!",
    stack ="",
    errors=[]
){
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.success = false
    this.message = message
    this.data = null

    if(stack){
        this.stack = stack
    }else{
        apiError.captureStackTrace(this,this.constructor)
    }


}

}
export {apiError}