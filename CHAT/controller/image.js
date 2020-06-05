


module.exports.save_image_chat = function( req, res ){

    if(!req.file || !req.file.filename ){
        response = { code: 500, message: res.__("save file error"), internal_message: res.__("save file error")}
      }else{
        response = { code: 200, message: res.__("save file success"), 
        internal_message: res.__("save file success"), data: { url : "/uploads/" + req.file.filename }}
      }
      return res.end(JSON.stringify(response))
}
