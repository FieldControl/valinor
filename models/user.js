var mongoose = require('mongoose');
var schema = mongoose.Schema;

userShema = new schema({
  nome:{type:String,require:true},
  email:{type:String,require:true},
  telefone:{type:Number,require:true},
  endereco:{type:String,require:true}
})

module.exports = mongoose.model("User",userShema);