import './database.js'
import express from 'express'

import { getExpenses, getIncomes, getAllBudgetsForUserId } from './database.js';
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
      
      const budget = await getAllBudgetsForUserId(2);
      const expenseData = await getExpenses(budget[0].id);
      const incomeData = await getIncomes(budget[0].id);
      
      res.json(expenseData);
});

const port = 8080
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})