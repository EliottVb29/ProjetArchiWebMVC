let express = require('express');
let router = express.Router();

var eventController = require('./controllers/eventController');
var userController = require('./controllers/userController');


// GET CALENDAR

router.get('/calendar', eventController.renderMainPage);

router.get('/calendar/add', eventController.renderAddItemPage);

router.get('/calendar/update/:idcal', eventController.renderUpdateItemPage);

router.get('/calendar/remove/:idcal', eventController.removeItem);

router.get('/calendar/details/:idcal', eventController.renderDetailsItem);



//POST CALENDAR

router.post('/calendar/new', eventController.createItem);

router.post('/calendar/update', eventController.updateItem);

router.post('/calendar/yes/:idcal', eventController.updateYes);

router.post('/calendar/no/:idcal', eventController.updateNo);



// GET MEMBERS

router.get('/members', userController.renderSecondPage);

router.get('/members/add', userController.renderAddMemberPage);

router.get('/members/update/:iduser', userController.renderUpdateMemberPage);

router.get('/members/remove/:iduser', userController.removeUser);

//POST MEMBERS

router.post('/members/new', userController.userNew);

router.post('/members/update/', userController.updateUser);


module.exports = router;