const express = require('express');
const router = express.Router();
let AuthentificationService = require('../services/AuthentificationService');
let authentificationService = new AuthentificationService();

router.post('/',(req,res)=>{
    authentificationService
        .authentificate(req.body.username,req.body.password)
        .then(response=>{
            res.status(200).json(response);
        }).catch(error=>{
            res.status(error.code).json(error);
        });
});

module.exports = router;