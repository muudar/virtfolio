const mysql = require('mysql');
const promise = require('mysql2/promise')
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { request } = require('http');
const validator = require("email-validator");
const { isBuffer } = require('util');
 
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}
 
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

const connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : 'ABC123',
	database : 'virtfolio'
});


const app = express();

app.set('view-engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());




app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/register', (req, res) =>{
	res.render('register.ejs', {error: false, errorMsg: ""});
})

app.get('/login', (request, response) =>{
	response.render('login.ejs', {error:false});
})


app.post('/login', function(request, response) {
	// Capture the input fields
	let email = request.body.email;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (email && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM users WHERE email = ? AND hashedPassword = ?', [email, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.id = results[0].id;
				request.session.loggedin = true;
				request.session.email = email;
				request.session.firstName = results[0].firstName;
				request.session.lastName = results[0].lastName;
				request.session.balance = results[0].balance;
				// Redirect to home page
				response.redirect('/');
			} else {
				response.render('login.ejs', {error:true});
			}			
			response.end();
		});
	} else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

app.get('/login', function(request, response) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts',function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				response.redirect('/');
			} else {
				response.render('login', {error:true})
			}			
			response.end();
		});
});

app.get('/', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		response.render('index.ejs', {loggedin: true, firstName : request.session.firstName});
	} else {
		// Not logged in
		response.render('index.ejs', {loggedin : false});
	}
	response.end();
});


app.get('/market', function(request, response){
	response.render('news.ejs', {loggedin: request.session.loggedin});
});


function onlyLetters(str) {
	return /^[A-Za-z]*$/.test(str);
}

function validatePassword(password) { var passwordRegExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/; if(passwordRegExp.test(password)) { return true; } else { return false; } }


app.post('/register', function(req, res){
	let email = req.body.email;	
	let firstName = req.body.firstName;
	let lastName = req.body.lastName;
	let password = req.body.password;
	let repeatedPassword = req.body.repeatedPassword;
	let balance = req.body.deposit;
	
	if(!validator.validate(email)){ // Error checking valid Email
		res.render('register.ejs', {error: true, errorMsg: "Invalid Email"});
	}
	else if(!onlyLetters(firstName)){
		res.render('register.ejs', {error: true, errorMsg: "First Name can only contain letters"});
	}
	else if(firstName.length < 2 || firstName.length > 13){
		res.render('register.ejs', {error: true, errorMsg: "First Name must be between 2-12 letters"});
	}

	else if(!onlyLetters(lastName)){
		res.render('register.ejs', {error: true, errorMsg: "Last Name can only contain letters"});
	}
	else if(lastName.length < 2 || lastName.length > 13){
		res.render('register.ejs', {error: true, errorMsg: "Last Name must be between 2-12 letters"});
	}
	else if(balance > 100000 || balance < 100){
		res.render('register.ejs', {error: true, errorMsg: "Initial Deposit has to be between 100 and 100000"});
	}

	else if(password != repeatedPassword){
		res.render('register.ejs', {error: true, errorMsg: "Passwords do not match"});
	}
	else if(!validatePassword(password)){
		res.render('register.ejs', {error: true, errorMsg: "Password must be atleast 8 characters and contains atleast one number, one lowercase letter, and one uppercase letter"});
	}
	else{
	var uniqueQuery = "SELECT * FROM users WHERE email = '" + email + "'"; 
	var sql = "INSERT INTO `users` (`email`, `firstName`, `lastName`, `balance`, `hashedPassword`) VALUES ('"+email+"','"+ firstName+"','"+lastName+"','"+balance+"','"+password+"')";
	connection.query(uniqueQuery,(err, result) => {
		if(err) throw err;
		else if(result.length > 0){
			res.render('register.ejs', {error: true, errorMsg: "Email already in use"});
		}
		else{
			connection.query(sql, (err, result) => {
				if(err) throw err;
				else{
					req.session.loggedin = true;
					req.session.email = email;
					req.session.firstName = firstName;
					req.session.lastName = lastName;
					req.session.balance = balance;
					res.redirect('/');
				}
			})
		}
	  });
	}
})

app.get('/portfolio', function(req, res){
	res.render('portfolio.ejs', {errorMsg: "", successMsg: "", firstName: req.session.firstName, errorMsg:''});
})

app.get('/logout', function(req, res){
	req.session.loggedin = false;
	req.session.email = "";
	req.session.firstName = "";
	req.session.lastName = "";
	res.redirect('/');
})


app.post('/portfolio', function(req, res){
	let costInDollars = parseFloat(req.body.costInDollars);
	let cryptoChoice = req.body.cryptoChoice;
	let units = parseFloat(req.body.units);
	var sql = "SELECT * FROM users where email = '" + req.session.email + "'";
	connection.query(sql, (err, result) => {
		if(err) throw err;
		else{
			let id = result[0].id;
			let balance = result[0].balance;
			if(balance < costInDollars) {
				res.render('portfolio.ejs', {errorMsg:"Not Enough Funds" ,successMsg: "",firstName: req.session.firstName,errorMsg: 'Not Enough Funds'});
			}
			else{
				let newBalance = balance - costInDollars;
				var query = "UPDATE users SET balance = '" + newBalance + "' WHERE email = '" + req.session.email + "'";
				connection.query(query, (err, result) =>{
					if(err) throw err;
					else{
						var myQuery = "SELECT * FROM cryptos WHERE apiname = '" + cryptoChoice + "'";
						connection.query(myQuery, (err, result) => {
							if(err) throw err;
							let cryptoId = result[0].id;
							var updateQuery = "SELECT * FROM user_crypto WHERE user_id = '" + id + "' AND crypto_id = '" + cryptoId + "'";
							connection.query(updateQuery, (err, result) => {
								if(err) throw err;
								var queryToRun;
								if(result.length > 0){
									let oldAmount = result[0].amount;
									let newAmount = oldAmount + units;
									queryToRun = "UPDATE user_crypto SET amount = '" + newAmount + "' WHERE user_id = '" + id + "' AND crypto_id = '" + cryptoId + "'";
								}
								else{
									queryToRun = "INSERT INTO `user_crypto` (`user_id`, `crypto_id`, `amount`) VALUES ('"+id+"','"+ cryptoId+"','"+units+"')";
								}
								connection.query(queryToRun, (err, result) => {
									if(err) throw err;
									let buyPrice = costInDollars / units;
									var lastQuery = "INSERT INTO crypto_transactions (`user_id`, `crypto_id`, `amount`, `price`, `date` ) VALUES ('"+id+"','"+ cryptoId+"','"+units+"','"+ buyPrice+ "','"+new Date().toMysqlFormat()+"')";
									connection.query(lastQuery, (err, result) =>{
										if(err) throw err;
										res.render('portfolio.ejs', { errorMsg : "",successMsg: "Operation Successful!"});
									})
								})
							}) 
						})
					}
				})
			}
		}
	})
})

app.post('/sell', function(req, res){
	let costInDollars = parseFloat(req.body.sellDollars);
	let cryptoChoice = req.body.cryptoChoiceSell;
	let units = parseFloat(req.body.sellUnits);
	var sql = "SELECT * FROM users where email = '" + req.session.email + "'";
	connection.query(sql, (err, result) => {
		if(err) throw err;
		else{
			let id = result[0].id;
			let balance = result[0].balance;
			var thisQuery = "SELECT * FROM cryptos WHERE apiname = '" + cryptoChoice + "'";
			connection.query(thisQuery, (err, result) =>{
				let cryptoId = result[0].id;
				if(err) throw err;
				else{
					var query = "SELECT * FROM user_crypto WHERE user_id = '" + id +"' AND crypto_id = '" +cryptoId + "'";
					connection.query(query, (err, result) =>{
						if(err) throw err;
						let amount = parseFloat(result[0].amount);
						let newAmount = amount - units;
						if(amount < units){
							res.render('portfolio.ejs', { errorMsg : "Not Enough Units",successMsg: ""});
						}
						else{
							let newBalance = balance + costInDollars;
							var myQuery = "UPDATE users SET balance = '"+newBalance+"'";
							connection.query(myQuery, (err , result)=> {
								if(err) throw err;
								else{
									var myQuery1 = "UPDATE user_crypto SET amount = '"+newAmount+"'WHERE user_id = '" + id +"' AND crypto_id = '" +cryptoId + "'";
								    connection.query(myQuery1, (err,result)=>{
                                        if(err) throw err;
										else{
											let sellPrice = costInDollars / units;
									        var lastQuery = "INSERT INTO crypto_transactions (`user_id`, `crypto_id`, `amount`, `price`, `date` ) VALUES ('"+id+"','"+ cryptoId+"','"+(-1*units)+"','"+sellPrice+ "','"+new Date().toMysqlFormat()+"')";
									        connection.query(lastQuery, (err, result) =>{
										if(err) throw err;
										res.render('portfolio.ejs', { errorMsg : "",successMsg: "Operation Successful!"});
									})
										}
									})
								}
							})
						}
					})
				}
			})
		}
	});
})

app.post('/deposit',function(req,res){
	let pass=req.body.depositPassword;
	let value=parseFloat(req.body.depositAmount);
	var sql = "SELECT * FROM users where email = '" + req.session.email + "'";
	connection.query(sql,(err,result)=>{
		if(err) throw err;
		else{
			let id = result[0].id;
			let password = result[0].hashedPassword;
			let oldBalance =result[0].balance;
			if(password!=pass){
				res.render('portfolio.ejs', {errorMsg: "Incorrect Password" ,successMsg: ""});
			}
			else{
				let newBalance = oldBalance + value;
				var query ="UPDATE users SET balance ='"+newBalance+"'";
				connection.query(query,(err,result)=>{
					if(err) throw err;
					else{
						res.render('portfolio.ejs', { errorMsg: "",successMsg: "You have deposited Successfuly!"});
					}
				})
			}
		}
	})
})
app.post('/withdraw',function(req,res){
	let pass=req.body.withdrawPassword;
	let value=parseFloat(req.body.withdrawAmount);
	var sql = "SELECT * FROM users where email = '" + req.session.email + "'";
	connection.query(sql,(err,result)=>{
		if(err) throw err;
		else{
			let id = result[0].id;
			let password = result[0].hashedPassword;
			let oldBalance =result[0].balance;
			if(password!=pass){
				res.render('portfolio.ejs', {errorMsg: "Incorrect Password" ,successMsg: ""});
			}
			else if(value > oldBalance ){
				res.render('portfolio.ejs', { errorMsg : "Not Enough Funds",successMsg: ""});
			}
			else{
				let newBalance = oldBalance - value;
				var query ="UPDATE users SET balance ='"+newBalance+"'";
				connection.query(query,(err,result)=>{
					if(err) throw err;
					else{
						res.render('portfolio.ejs', { errorMsg : "",successMsg: "You have withdrawn succesfuly!"});
					}
				})
			}
		}
	})
})

app.get('/assets', function(req, res){
	var sql = "SELECT * FROM users where email = '" + req.session.email + "'";
	connection.query(sql, function(err, result){
		if(err) throw err;
		let id = result[0].id;
		let balance = result[0].balance;
		var query = "SELECT * FROM user_crypto INNER JOIN cryptos ON cryptos.id = user_crypto.crypto_id  WHERE user_id = '" + id + "' AND amount > 0";
		connection.query(query, function(err, result){
			if(err) throw err;
			// res.render('assets.ejs', {balance: balance, results : result, loggedin : true , firstName : req.session.firstName})
			var lastQuery = "SELECT * FROM crypto_transactions INNER JOIN cryptos ON cryptos.id = crypto_transactions.crypto_id WHERE user_id = '" + id + "'";
			connection.query(lastQuery, function(err, resu){
				res.render('assets.ejs', {history:resu ,balance: balance, results : result, loggedin : true , firstName : req.session.firstName})
			})
		})
	})
})
app.listen(3000);