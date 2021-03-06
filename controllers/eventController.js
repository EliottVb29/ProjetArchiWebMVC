//Appel aux modèles 
let Event = require('../models/eventModel.js');
let User = require('../models/userModel.js');

// Listes
let eventList = [];
let userList = [];

//Appel à la db
let connection = require('../db.js');

//Pages Rendering
exports.renderMainPage = function (req, res) {
    getMembersFromDb();
    connection.query("SELECT * from event;", function (error, resultSQL) {
        if (error) {
            res.status(400).send(error);
        }
        else {
            res.status(200);
            eventList = resultSQL;
            eventList.forEach(event => {
                event.Date = new Date(event.Date).toDateString();
            });
            res.render('main.ejs', { events: eventList, users: userList });
        }
    });
}

exports.renderAddItemPage = function (req, res) {
    res.render('addItem.ejs');

};


exports.renderUpdateItemPage = function (req, res) {
    connection.query("Select * from event where idcal = ?", req.params.idcal, (error, data) => {
        let date = new Date(data[0].Date).toISOString(); //Norme ISO DATA 
        data[0].Date = date.slice(0,10); // 10 premiers caracteres pour avoir un format "normal"
        res.render('updateItem.ejs', {event: data[0]});
    })
};


exports.renderDetailsItem = function (req, res) {
    let sqlevent = "select type, name, date from event where idcal = ?";
    let sql = "Select lastname, firstname, position, name, type, date, presence" +
        " from event join register_to on register_to.FK_idcal = event.idcal " +
        "join user on register_to.FK_iduser = user.iduser where FK_idcal = ?";
    connection.query(sqlevent, [req.params.idcal], (error, resultSQL) => {
        if (error) {
            res.status(400).send(error);
        }
        else {
            let event = { name: resultSQL[0].name, type: resultSQL[0].type, date: new Date(resultSQL[0].date).toDateString() };
            connection.query(sql, [req.params.idcal], (error, resultSQL) => {
                if (error) {
                    res.status(400).send(error);
                }
                else {
                    listUserYes = [];
                    listUserNo = [];
                    resultSQL.forEach((presence) => {
                        if (presence.presence === "YES") {
                            listUserYes.push(new User(presence.lastname, presence.firstname, presence.position, null));
                        }
                        else {
                            listUserNo.push(new User(presence.lastname, presence.firstname, presence.position, null));
                        }
                    });
                    res.render('detailsEvent.ejs', { users: userList, event: event, listUserYes: listUserYes, listUserNo: listUserNo });
                }
            });
        }
    });
};


//Action EVENTS

exports.createItem = function (req, res) {
    let type = req.body.type;
    let name = req.body.name;
    let date = req.body.date;
    if (type != '' && name != '' && date != '') {
        let event = new Event(type, name, date);
        connection.query("INSERT INTO event set ?", event, function (error, resultSQL) {
            if (error) {
                res.status(400).send(error);
            }
            else {
                res.status(201).redirect('/calendar');
            }
        });
    }
}
exports.updateItem = function (req, res) {
    let type = req.body.type;
    let name = req.body.name;
    let date = new Date(req.body.date);
    let idcal = req.body.idcal;
    let sql = "UPDATE event SET type=?, name=?, date=? WHERE idcal = ?";
    connection.query(sql, [type, name, date, idcal],
        function (error, resultSQL) {
            if (error) {
                console.log(error);
                res.status(400).send(error);
            }
            else {
            }
            res.status(202).redirect('/calendar');
        });
}


exports.removeItem = function (req, res) {
    let sql = "DELETE FROM register_to WHERE FK_idcal = ?";
    connection.query(sql, [req.params.idcal], (error, resultSQL) => {
        if (error) {
            res.status(400).send(error);
        }
        else {
            let sql = "DELETE FROM event WHERE idcal = ?";
            connection.query(sql, [req.params.idcal], (error, resultSQL) => {
                if (error) {
                    res.status(400).send(error);
                }
                else {
                    res.redirect('/calendar')
                }
            });
        }
    });
}

exports.updateYes = function (req, res) {
    getMembersFromDb();
    let sql = "select FK_idcal, FK_iduser from register_to where FK_idcal = ? and FK_iduser = ?";
    connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
        if (error) {
            res.status(400).send(error);
        }
        else {
            if (resultSQL.length === 0) {
                let sql = "INSERT INTO register_to (FK_idcal, FK_iduser, presence) VALUES (?, ?, 'YES')";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).send(error);
                    }
                    else {
                        res.redirect('/calendar');
                    }
                })
            }
            else {
                let sql = "Update register_to SET presence = 'YES' where FK_idcal = ? and FK_iduser = ?";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).send(error);
                    }
                    else {
                        res.redirect('/calendar');
                    }
                });
            }
        }
    });
}

exports.updateNo = function (req, res) {
    let sql = "select FK_idcal, FK_iduser from register_to where FK_idcal = ? and FK_iduser = ?"
    connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
        if (error) {
            res.status(400).send(error);
        }
        else {
            if (resultSQL.length === 0) {
                let sql = "INSERT INTO register_to (FK_idcal, FK_iduser, presence) VALUES (?, ?, 'NO')";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).send(error);
                    }
                    else {
                        res.redirect('/calendar');
                    }
                })
            }
            else {
                let sql = "Update register_to SET presence = 'NO' where FK_idcal = ? and FK_iduser = ?";
                connection.query(sql, [req.params.idcal, req.body.users], (error, resultSQL) => {
                    if (error) {
                        res.status(400).send(error);
                    }
                    else {
                        res.redirect('/calendar');
                    }
                });
            }
        }
    });
}



//functions

function getMembersFromDb() {
    connection.query("SELECT * from user;", function (error, resultSQL) {
        userList = resultSQL;
    });
}