// express stuff, don't worry about this file yet
// we might not even use this for the prototype

import * as database from './database.js';
import express from 'express';
import dotenv from 'dotenv';
import {v4 as uuid} from 'uuid';
import session from 'express-session';

// .env file import, using this so that database password and host ip address aren't in vcs
dotenv.config();
const app = express();

// create database pool, for this session
var pool = await database.createDBPool(process.env.MYSQL_HOST, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, process.env.MYSQL_DATABASE);

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const port = 8080;

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.json());
// app.set('view engine', 'html');
// const router = express.Router();

// app.set('trust proxy', 1) // trust first proxy
app.use(session(
  { name:'SessionCookie',
    genid: function(req) {
        console.log('session id created!');
      return uuid();}, 
    secret: process.env.SECRET, // not saved in vcs :)
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, expires:60000 }
  }));

var sessionChecker = (req, res, next) => {    
  console.log(`Session Checker: ${req.session.id}`);
  console.log('session: ' + req.session);
  if (req.session.userId) { 
      console.log('Found User Session');
      next();
  } else {
      console.log('No User Session Found');
      res.redirect('/sign-in');
  }
};

// router.get('/profile', sessionChecker, async function(req, res, next) {
//   res.redirect('/profile');
// });

app.post('/budget', async (req, res) => {
  console.log('in budget post route');
  // check what the request is for
  switch (req.body['for']) {

    case 'data-input':
      await databaseDataInput(req.body);
      res.redirect('/index');
      // TODO redirect to graphs page
      break;      
  }
});

app.post('/verify-login', async (req, res) => {
  const userId = await database.userExists(req.body.username, req.body.password);
  if (userId) {
    const user = await database.getUser(userId);
    
    req.session.userId = userId;
    console.log(req.session.userId);

    var data = {
      successful: true,
    }
    // res.json(data);
    console.log('login verified, redirecting to profile (fall.html)');
    res.redirect('/profile');
  }
  else {
    // var data = {
    //   successful: false,
    // }
    console.log('session invalid, redirecting to sign-in page');
    // res.sendFile('src/sign-in.html', {root: __dirname});
    return res.sendStatus(401);
  }
});

// app.get('/', sessionChecker, (req, res, next) => {
//   res.sendFile(path.join(__dirname, 'src/index.html'));
// });

app.get('/profile', function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send fall.html');
  // res.body.goto = 'fall.html';
  res.sendFile('fall.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err) throw (err);
  }); // <--- this doesn't work :)
});

app.get('/sign-in', function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send sign-in.html');
  res.sendFile('sign-in.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err) throw (err);
  }); // <--- this doesn't work :)
});

// run every route through the session checker unless it's login
app.get('/', sessionChecker, function(req, res, next) {

});

app.listen(port, () => {
  console.log('Scotty Finance is now LIVE at the lovely url http://localhost:8080/ !');
});

async function databaseDataInput(data) {
  // time for innefficient, poorly designed, bad coding practice code mwahahaha

  // FIXME remove when user getting functions are implemented
  let user = await database.createUser('woah', 'noway', 'beepboop@gmail.com');

  // verify if budget exists already for this quarter/user
  let budget = await database.getBudgetForUserId(user.id, 'fall', '2023');

  if (!budget) {
    budget = await database.createBudget(user.id, 'fall', '2023');
    console.log('created new budget');
  }

  for (var i in data) {
    switch (i) {
      // expenses
      case 'tuition':
        // we're just scrapping the return value for these functions which isn't really a problem
        database.createExpense(budget.id, data[i], database.ExpenseType.tuition);
        break;
      case 'textbooks':
        database.createExpense(budget.id, data[i], database.ExpenseType.textbooks);
        break;
      case 'transportation':
        database.createExpense(budget.id, data[i], database.ExpenseType.transportation);
        break;
      case 'loan-student':
        database.createExpense(budget.id, data[i], database.ExpenseType.loan_student);
        break;
      case 'loan-personal':
        database.createExpense(budget.id, data[i], database.ExpenseType.loan_personal);
        break;
      case 'food':
        database.createExpense(budget.id, data[i], database.ExpenseType.food);
        break;
      case 'expense-living':
        database.createExpense(budget.id, data[i], database.ExpenseType.expense_living);
        break;
      case 'expense-personal':
        database.createExpense(budget.id, data[i], database.ExpenseType.expense_personal);
        break;
      
      // incomes
      case 'income':
        database.createIncome(budget.id, data[i], database.IncomeType.income);
        break;
      case 'savings':
        database.createIncome(budget.id, data[i], database.IncomeType.savings);
        break;
      case 'investments':
        database.createIncome(budget.id, data[i], database.IncomeType.investments);
        break;
      
      // savingsGoal
      case 'savingsGoal':
        database.createSavings(budget.id, data[i]);
        break;
    }
  }
}