var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
let config = require('../../config/app_config');
let User = require('../../schema/user_schema');


var AuthController = {

  register: function(req, res){
    if(!req.body.name || !req.body.mail || !req.body.password){
      let err = "Invalid params"
      return res.status(404).send(err)
    }

    var hashedPassword = bcrypt.hashSync(req.body.password, 8);

    let user = new User({
      name: req.body.name,
      email: req.body.mail,
      password: hashedPassword
    });

    user.save(function (err, user) {
      if (err || !user) {
        err = err || 'Error creating user';
        return res.status(500).send(err)
      }

      var token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      });
      
      res.status(200).send({
        auth: true,
        message: "user successfully added",
        token: token
      })

    });

  },

  updateUserDetails: function(req, res){
    if(!req.headers.authorization){
      let err = "No token provided";
      res.status(401).send({ auth: false, message: err });
    }

    let token = req.headers.authorization;
    let id;
    jwt.verify(token, config.secret, function(err, decoded){
      if (err || !token){
        err = err || 'Failed to authenticate token.'
        return res.status(500).send({ auth: false, message: err });
      }
      id = decoded.id;
    })

    if(!req.body.name || !req.body.mail){
      let err = "Invalid params"
      return res.status(404).send({message:err});
    }

    User.findByIdAndUpdate(id,
    {
      $set: {
        name: req.body.name,
        email: req.body.mail
      }
    }, function(err, user){
      if (err || !user){
        err = err || "No user found."
        return res.status(404).send(err);
      }
      user.save(function(err, user){
        res.status(200).send(user)
      })
    })
  },

  login: function(req, res){
    if(!req.body.mail || !req.body.password){
      let err = "Invalid params"
      //console.log(err);
      return res.status(404).send(err)
    }

    User.findOne({email: req.body.mail}, function(err, user){
      if(err || !user){
        err = err || "No user found"
        return res.status(404).send({error: err})
      }
      if(!bcrypt.compareSync(req.body.password, user.password)){
        return res.status(401).send({auth: false, token: null, message: "Enter correct password or emailId"});
      }

      let token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 86400 // expires in 24 hours
      })

      res.status(200).send({ auth: true, token: token });
    })
  },

  deletUser: function(req, res){
    if(!req.headers.authorization){
      let err = "No token provided";
      res.status(401).send({ auth: false, message: err });
    }

    let token = req.headers.authorization;
    let id;
    jwt.verify(token, config.secret, function(err, decoded){
      if (err || !token){
        err = err || 'Failed to authenticate token.'
        return res.status(500).send({ auth: false, message: err });
      }
      id = decoded.id;
    })

    User.remove({_id : id}, function(err, user){
      if (err || !user){
        err = err || "No user found."
        return res.status(404).send(err);
      }

      res.status(200).send({message: "successfully removed user", user: user});
    })
  }
};

module.exports = AuthController;