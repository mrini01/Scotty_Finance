// express stuff, don't worry about this file yet
// we might not even use this for the prototype
import * as database from './database.js';
import express from 'express';
import dotenv from 'dotenv';

// .env file import, using this so that database password and host ip address aren't in vcs
dotenv.config();

// create database pool, for this session
await database.createDBPool(process.env.MYSQL_HOST, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, process.env.MYSQL_DATABASE);

import { getExpenses, getIncomes, getAllBudgetsForUserId, Quarter, ExpenseType, IncomeType, getSavings } from './database.js';

import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()

const port = 8080;

app.use(express.static("static"));
app.use(express.json());

var isLoggedIn = false;
var loggedInUser = undefined;


app.post('/budget', async (req, res) => {
  console.log('in budget post route');
  // check what the request is for
  switch (req.body['for']) {

    case 'data-input':
      await databaseDataInput(req.body);
      res.redirect('/index');
      // TODO redirect to graphs page
      break;

    case 'user-login':
      const userId = await database.userExists(req.body.username, req.body.password);
      if (userId) {
        isLoggedIn = true;
        loggedInUser = req.body.username;
        const user = await database.getUser(userId);
        var data = {
          successful: true,
          userId: userId,
          username: user.username,
          email: user.email
        }
        res.json(data);
      }
      else {
        var data = {
          successful: false,
          userId: undefined
        }
        res.json(data);
      }
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

app.get('/index', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'static/index.html'));
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Used this to send json file of expenseData
app.get('/budget', async (req, res) => {
  console.log('Inside budget report route');
      // FIXME remove when user getting functions are implemented
      let user = await  database.getUserWithUsername("woah");
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
    }
  }
}