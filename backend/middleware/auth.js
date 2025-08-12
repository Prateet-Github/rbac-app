const jwt = require('jsonwebtoken');
const User = require('../models/User');

const roles = {
  admin: ['read', 'write', 'delete', 'manageUsers'],
  user: ['read', 'write'],
  guest: ['read']
}

// Authentication middleware

async function authenticate(req,res,next) {
  const authHeader = req.headers.authorization;
  if(!authHeader){
   req.user = {role: 'guest'};
   return next();
  }


const token = authHeader.split(' ')[1];
if(!token) {
  req.user = {role: 'guest'};
  return next();
}

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const dbUser = await User.findOne({username: decoded.username}).select('username role');

  if(!dbUser) {
    req.user = {role: 'guest'};
    return next();
  } else{
    req.user = {
      username: dbUser.username,
      role: dbUser.role
    };
    return next();
  }
  
} 
catch (error) {
  req.user = {role:'guest'}
  return next();
}

}

// Authorization middleware

 function authorize(permission) {

  return (req, res, next) => {
    const role = req.user.role || 'guest';

    const allowed = roles[role] || [];

    if (allowed.includes(permission)) {
      return next();
    } else {
      return res.status(403).json({ message: 'Access Denied' });
    }
  }
}

module.exports = {
  authenticate,
  authorize
};