import './database.js'
import express from 'express'

import { getExpenses, getIncomes, getAllBudgetsForUserId, Quarter, ExpenseType, IncomeType, getSavings } from './database.js';
const app = express()

import path from 'path'
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static("static"))

// Used this to send html file to display
app.get('/budget-report.html', async (req, res) => {
  try {
      res.sendFile(path.join(__dirname, 'static/budget-report.html'));
      
  } catch (error) {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  }
});


// Used this to send json file of expenseData
app.get('/budget', async (req, res) => {
  console.log('Inside budget report route');
      const user = 2; // manually defined
      const budget = await getAllBudgetsForUserId(user);
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
          const categoryExpense = ExpenseType[expense.type] || 'Unknown'; // Map type to ExpenseType object
          budgetData.push({ quarter: item.quarter, year: item.year, category: categoryExpense, amount : expense.amount });
        }
        const incomeData = await getIncomes(item.id);
        for (const income of incomeData) {
          const categoryIncome = IncomeType[income.type] || 'Unknown'; // Map type to ExpenseType object
          budgetData.push({ quarter: item.quarter, year: item.year, category: categoryIncome, amount : income.amount });
        }
        const savingData = await getSavings(item.id);
        for (const saving of savingData) {
          const categorySaving = "Saving";
          budgetData.push({ quarter: item.quarter, year: item.year, category: categorySaving, amount : saving.amount });
        }
    } 
      res.json(budgetData);
});

const port = 8080
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})