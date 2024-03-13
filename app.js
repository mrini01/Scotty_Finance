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

import { getExpenses, getIncomes, getAllBudgetsForUserId, Quarter, ExpenseType, IncomeType, getSavings } from './database.js';

import path from 'path'
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
    cookie: { secure: false, expires:5*60*1000 }
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

app.post('/budget', sessionChecker, async (req, res) => {
  console.log('in budget post route');
  // check what the request is for
  switch (req.body['for']) {

    case 'data-input':
      // check if budget exists for this quarter, if it DOES then return an error message
      var budget = await database.getBudgetForUserId(req.session.userId, req.body['quarter'], '2024');
      if (budget) {
        console.log('budget already exists, returning from post early');
        console.log('todo return error message :)');
        // res.redirect('/profile');
        // return;
      } else {
        console.log('budget does not exist, creating it');
        budget = await database.createBudget(req.session.userId, req.body['quarter'], '2024');
      }

      
      await databaseDataInput(req.session.userId, req.body, budget);
      //res.sendStatus(200);
      res.redirect('/budget-report'); // TODO REPLACE THIS WITH REDIRECT TO '/budget-report'
      break;
  }
});

// Used this to send html file to display
app.get('/budget-report.html', async (req, res) => {
  try {
      res.sendFile(path.join(__dirname, 'static/budget-report.html'));
      
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');

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

app.post('/sign-up-call', async function (req, res, next) {
  const user = await database.createUser(req.body.username, req.body.password, req.body.email);
  req.session.userId = user.id;
  console.log('new user created!');

  res.redirect('/profile');
  console.log('thats it???');
});

// app.get('/', sessionChecker, (req, res, next) => {
//   res.sendFile(path.join(__dirname, 'src/index.html'));
// });

app.get('/profile', sessionChecker, function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send fall.html');
  // res.body.goto = 'fall.html';
  res.sendFile('fall.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err) throw (err);
  }); // <--- this doesn't work :)
});

app.get('/profile/fall', sessionChecker, function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send fall.html');
  // res.body.goto = 'fall.html';
  res.sendFile('fall.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err) throw (err);
  }); // <--- this doesn't work :)
});

app.get('/profile/winter', sessionChecker, function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send winter.html');
  // res.body.goto = 'winter.html';
  res.sendFile('winter.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err) throw (err);
  }); // <--- this doesn't work :)
});

app.get('/profile/spring', sessionChecker, function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send spring.html');
  // res.body.goto = 'spring.html';
  res.sendFile('spring.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err) throw (err);
  }); // <--- this doesn't work :)
});

app.get('/profile/summer', sessionChecker, function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send summer.html');
  // res.body.goto = 'summer.html';
  res.sendFile('summer.html', {root: fileDirectory}, (err) => {
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

app.get('/sign-up', function(req, res, next) {
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  console.log('trying to send sign-up.html');
  res.sendFile('sign-up.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err) throw (err);
  });
});

app.get('/log-out', function(req, res, next) {
  if (req.session.userId) {
    req.session.destroy();
    // res.send("<script>alert('successfully logged out!'); window.location.href = '/'; </script>");
    res.redirect('/');
  }
  else {
    res.redirect('/sign-in');
  }
})

app.get('/budget-report', sessionChecker, function(req, res, next) {
  console.log("In budget-report for app.js")
  const fileDirectory = path.resolve(__dirname, '.', 'static/');
  res.sendFile('budget-report.html', {root: fileDirectory}, (err) => {
    res.end();
    if (err){ console.log("budget-report throwing an error\n"); throw (err);}
  });
});

// run every route through the session checker unless it's signin/signup
app.get('/', sessionChecker, function(req, res, next) {
  // woag
});


// Used this to send json file of expenseData
app.get('/budget-data', sessionChecker, async (req, res) => {
  console.log('Inside budget report route');
      // FIXME remove when user getting functions are implemented
      let user = await  database.getUser(req.session.userId);
      console.log(user);
      console.log(user.id);

      const budget = await getAllBudgetsForUserId(user.id);
      const fall = [];
      const winter = [];
      const spring = [];
      const summer = [];
      const quarters = [fall, winter, spring, summer];
      const budgetData = [];
      for (const item of budget) {
        const { quarter, year } = item;
        const expenseData = await getExpenses(item.id);
        for (const expense of expenseData) {
          console.log(ExpenseType.valuesToNames[expense.type]);
          const categoryExpense = ExpenseType.valuesToNames[expense.type] || 'Unknown'; // Map type to ExpenseType object
          budgetData.push({ quarter: item.quarter, year: item.year, category: categoryExpense, amount : expense.amount });
        }
        const incomeData = await getIncomes(item.id);
        for (const income of incomeData) {
          const categoryIncome = IncomeType.valuesToNames[income.type] || 'Unknown'; // Map type to ExpenseType object
          budgetData.push({ quarter: item.quarter, year: item.year, category: categoryIncome, amount : income.amount });
        }
        const savingData = await getSavings(item.id);
        if (savingData) {
          const categorySaving = "Saving";
          budgetData.push({ quarter: item.quarter, year: item.year, category: categorySaving, amount : savingData.amount });
        }
    } 
    console.log(budget);
    console.log(budgetData);
      res.json(budgetData);
});

app.listen(port, () => {
  console.log('Scotty Finance is now LIVE at the lovely url http://localhost:8080/ !');
});

async function databaseDataInput(userId, data, budget) {
  // time for innefficient, poorly designed, bad coding practice code mwahahaha

  console.log('in databaseDataInput');

  for (var i in data) {
    console.log('iteration ' + i + ' of databaseDataInput');
    console.log(typeof i + " " + data[i]);
    // if(data[i].length == 0) {
    //   return;
    // }
    switch (i) {
      // expenses
      case 'tuition':
        // we're just scrapping the return value for these functions which isn't really a problem
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.tuition);
        break;
      case 'textbooks':
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.textbooks);
        break;
      case 'transportation':
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.transportation);
        break;
      case 'loan-student':
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.loan_student);
        break;
      case 'loan-personal':
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.loan_personal);
        break;
      case 'food':
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.food);
        break;
      case 'expense-living':
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.expense_living);
        break;
      case 'expense-personal':
        database.createExpense(budget.id, data[i], database.ExpenseType.namesToValues.expense_personal);
        break;
      
      // incomes
      case 'income':
        database.createIncome(budget.id, data[i], database.IncomeType.namesToValues.income);
        break;
      case 'savings':
        database.createIncome(budget.id, data[i], database.IncomeType.namesToValues.savings);
        break;
      case 'investments':
        database.createIncome(budget.id, data[i], database.IncomeType.namesToValues.investments);
        break;
      
      // savingsGoal
      case 'savingsGoal':
        database.createSavings(budget.id, data[i]);
        break;
      
      default:
        console.log('in default case, that shouldnt happen');
    }
  }
}