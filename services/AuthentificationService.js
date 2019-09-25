var oracledb = require('oracledb');
var dbConfig = require('../secret').dbConfig;
let secretKey = require('../secret').tokenPrivateKey;
var sha256 = require('sha256');
let jwt = require('jsonwebtoken');

class AuthentificationService {

    authentificate(username , password) {
        return new Promise((resolve, reject) => {

            oracledb.getConnection(dbConfig).then(connection=>{
                let query = `SELECT IDTIERS,WEBPASS FROM TIERS WHERE WEBUSER = :id `;
                let options = {
                    outFormat: oracledb.OUT_FORMAT_OBJECT   // query result format
                };
                connection.execute(query,  [username],options).then(res=>{
                    console.log(res.rows);
                    if (res.rows.length>0) {
                        let originalPwd = res.rows[0]['WEBPASS'];
                        let idUser = res.rows[0]['IDTIERS'];
                        console.log('user' +idUser);
                        let hashedPwd = sha256(password);
                        console.log('hashed +\n' + hashedPwd);
                        console.log('hashed +\n' + originalPwd);

                        if (hashedPwd !== originalPwd) {
                            console.log('psw');
                            connection.close();
                            reject({
                                code: 401,
                                message: "Mot de passe incorect."
                            });
                        } else {
                            jwt.sign({username, hashedPwd, idUser}, secretKey, (err,token)=>{
                                if (err) {
                                    connection.close();
                                    console.log('error1' +err);
                                    reject({
                                        code: 500,
                                        message: "Une erreur s'est produite."
                                    });
                                } else {
                                    console.log('token' +token);
                                    connection.close();
                                    resolve({
                                        idUser: idUser,
                                        username: username,
                                        token: token
                                    });
                                }
                            });
                        }
                    } else {
                        console.log('reject user');
                        connection.close();
                        reject({
                            code: 404,
                            message: "Ce nom d'utilisateur n'existe pas."
                        });
                    }
                }).catch(error=>{
                    connection.close();
                    reject({
                        code: 500,
                        message: "Une erreur s'est produite."
                    });
                });
            }).catch(error=>{
                reject({
                    code: 500,
                    message: "Une erreur s'est produite."
                });
            });

        });
    }
}

module.exports = AuthentificationService;