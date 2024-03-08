// test script, creates a brand spankin new database on the mysql server installed on this machine
import * as database from './../database.js';
import mysql from 'mysql2';
import dotenv from 'dotenv';
// import jest from 'jest';

// const database = require('../database.js');
// const mysql = require('mysql2');
// const dotenv = require('dotenv');

dotenv.config();

var pool = await database.createDBPool(process.env.MYSQL_HOST, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, process.env.MYSQL_TEST_DATABASE);



// called before every test case to create the tables and insert the test data (i know it looks messy but i couldn't figure out how to execute sql files)
async function setupDatabase() {
    // await pool.query('use scotty_test_finance');
    // create fresh tables
    await pool.query('create table users (id integer PRIMARY KEY AUTO_INCREMENT NOT NULL, email VARCHAR(255), username VARCHAR(50), pass VARCHAR(50))');
    await pool.query("CREATE TABLE budgets (id integer PRIMARY KEY AUTO_INCREMENT NOT NULL, userId integer, `quarter` ENUM('fall', 'winter', 'spring', 'summer'), `year` integer, constraint fk_userId foreign key (userId) references users (id))");
    await pool.query('create table expense_type (id integer primary key, `type` varchar(20) not null unique)');
    await pool.query("insert into expense_type (id, type) values (0, 'unassigned'), (1, 'tuition'), (2, 'textbooks'), (3, 'transportation'), (4, 'loan_student'), (5, 'loan_personal'), (6, 'food'), (7, 'expense_living'), (8, 'expense_personal')");
    await pool.query("CREATE TABLE expenses (id integer PRIMARY KEY AUTO_INCREMENT NOT NULL, budgetId integer, amount integer, `type` integer not null default 0, constraint fk_expense_type foreign key (`type`) references expense_type (id), constraint fk_budgetId_1 foreign key (budgetId) references budgets (id))");
    await pool.query("create table income_type (id integer primary key, `type` varchar(20))");
    await pool.query("insert into income_type (id, type) values (0, 'unassigned'), (1, 'income'), (2, 'savings'), (3, 'investments');");
    await pool.query("CREATE TABLE incomes (id integer PRIMARY KEY AUTO_INCREMENT NOT NULL, budgetId integer, amount integer, `type` integer not null default 0, constraint fk_income_type foreign key (`type`) references income_type (id), constraint fk_budgetId_2 foreign key (budgetId) references budgets (id))");
    await pool.query("create table savings (id integer PRIMARY KEY AUTO_INCREMENT NOT NULL, budgetId integer, amount integer, constraint fk_budgetId_3 foreign key (budgetId) references budgets (id))");

    // insert test data
    await pool.query(userTestData);
    await pool.query(budgetTestData);
    await pool.query(expensesTestData);
    await pool.query(incomesTestData);
    await pool.query(savingsTestData);
}

// called right after every test case to remove all the test data
async function clearDatabase() {
    // drop tables
    // await pool.query('use scotty_test_finance');
    // console.log(await pool.query('use scotty_test_finance'));
    await pool.query('set FOREIGN_KEY_CHECKS = 0');
    await pool.query('drop table if exists users, budgets, expense_type, expenses, income_type, incomes, savings');
    await pool.query('set FOREIGN_KEY_CHECKS = 1');
}


// test data set queries
const userTestData = "INSERT INTO users (username, pass, email) " + 
                     "VALUES ('TestUser1', 'user1password', 'testuser1@testwebsite.com'), " +
                     "('TestUser2', 'user2password', 'testuser2@othertestwebsite.com'), " + 
                     "('TestUser3', 'user3password', 'testuser3@what.com');";

const budgetTestData = "INSERT INTO budgets (userId, quarter, year) " +
                       "VALUES ('1', 'fall', '2023'), " +
	                   "('2', 'winter', '2024'), " +
                       "('3', 'spring', '2024');";

const expensesTestData = "INSERT INTO expenses (budgetId, amount, type) " +
                         "VALUES ('1', '300', 2), " +
                         "('2', '50', 3), " +
                         "('2', '12', 1), " +
                         "('3', '500', 5);";

const incomesTestData = "INSERT INTO incomes (budgetId, amount, type) " +
                        "VALUES ('1', '500', 1), " +
                        "('1', '400', 3), " +
                        "('2', '50', 1), " +
                        "('3', '300', 3);";

const savingsTestData = "INSERT INTO savings (budgetId, amount) " +
                        "VALUES ('1', '1000'), " +
                        "('2', '500'), " +
                        "('3', '750');";

beforeAll(async () => {
    // await pool.query('use scotty_test_finance');
});

// jest callback, this is called before each test case
beforeEach(async () => {
    await setupDatabase();
});

afterEach(async () => {
    await clearDatabase();
});

// jest callback, called after each test case
// afterEach(() => {
//     clearDatabase();
// })

// --- BEGIN TEST CASES ---
// test('getUsers() is correct', async () => {
//     const data = await database.getUsers();
//     expect(data).toBe([]);
// });

// just testing one user for now, i love saving time
test('getUser(userId = 1) is correct', async () => {
    const data = await database.getUser(1);
    console.log(data);
    expect(data.id).toBe(1);
    expect(data.username).toBe('TestUser1');
    expect(data.pass).toBe('user1password');
    expect(data.email).toBe('testuser1@testwebsite.com');
});

test('getUser() errors correctly', async () => {
    const data = await database.getUser(99);
    expect(data).toBe(undefined);
});

test('getUserWithUsername() is correct', async () => {
    const data = await database.getUserWithUsername('TestUser3');
    expect(data.username).toBe('TestUser3');
    expect(data.pass).toBe('user3password');
    expect(data.email).toBe('testuser3@what.com');
});

test('userExists() is correct', async () => {
    const data = await database.userExists('TestUser2', 'user2password'); // this returns the user's id
    const user = await database.getUserWithUsername('TestUser2');
    expect(data).toBe(user.id);
});

test('createUser(), followed by getUser() is correct', async () => {
    const insertion = await database.createUser('userFromTestHarness', 'passwordFromTestHarness', 'what@hotmail.com');
    expect(insertion.id).toBe(4);

    const result = await database.getUser(4);
    expect(result.id).toBe(4);
    expect(result.username).toBe('userFromTestHarness');
    expect(result.pass).toBe('passwordFromTestHarness');
    expect(result.email).toBe('what@hotmail.com');
});

test('getBudget(userId = 1) is correct', async () => {
    const data = await database.getBudget(1);
    expect(data.quarter).toBe('fall');
    expect(data.year).toBe(2023);
});

test('createBudget() followed by getBudget() is correct', async () => {
    let quarter = database.Quarter.Winter;
    let year = 2025;
    const insertion = await database.createBudget(1, quarter, year);
    let id = insertion.id;
    expect(id).toBe(4); // might not need to toString these
    expect(insertion.quarter).toBe(quarter);
    expect(insertion.year).toBe(year);

    const result = await database.getBudget(id); // idk if it will automatically convert the type of arg 1 to a number :)
    expect(result.id).toBe(4);
    expect(result.userId).toBe(1);
    expect(result.quarter).toBe(quarter);
    expect(result.year).toBe(year);
});

test('getBudgetForUserId(userId = 2) is correct', async () => {
    const data = await database.getBudgetForUserId(2, database.Quarter.Winter, 2024);
    expect(data.id).toBe(2); // budget id
    expect(data.userId).toBe(2);
    expect(data.quarter).toBe(database.Quarter.Winter);
    expect(data.year).toBe(2024);
});

test('getExpenses(budgetId = 1) is correct', async () => {
    const data = await database.getExpenses(1);
    const expense = data[0];
    expect(expense.id).toBe(1); // expense id
    expect(expense.budgetId).toBe(1); // budget id
    expect(expense.amount).toBe(300); // amount
    expect(expense.type).toBe(database.ExpenseType.textbooks);
});

test('createExpense(budgetId = 1, amount = 1000, type = tuition)', async () => {
    const insertion = await database.createExpense(1, 1000, database.ExpenseType.tuition);
    expect(insertion.id).toBe(5);
    expect(insertion.amount).toBe(1000);
    expect(insertion.type).toBe(database.ExpenseType.tuition);

    const result = await database.getExpenses(1); // returns array
    // ^^^ returns list of expenses for budget with the id passed in, second element is the one we just inserted!
    expect(result[1].id).toBe(5);
    expect(result[1].amount).toBe(1000);
    expect(result[1].type).toBe(database.ExpenseType.tuition);
});

test('getIncomes(budgetId = 3) is correct', async () => {
    const data = await database.getIncomes(3);
    const income = data[0]; // returns a list of incomes
    expect(income.id).toBe(4);
    expect(income.budgetId).toBe(3);
    expect(income.amount).toBe(300);
    expect(income.type).toBe(database.IncomeType.investments);
});

test('getSavings(budgetId = 2) is correct', async () => {
    const data = await database.getSavings(2);
    expect(data.id).toBe(2); // insertId
    expect(data.budgetId).toBe(2);
    expect(data.amount).toBe(500);
});