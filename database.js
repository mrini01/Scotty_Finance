// script for communication with the database
import mysql from 'mysql2'
import dotenv from 'dotenv'

// quarters enum, not an enum bc javascript doesn't support them but you can treat it like one
// might move this to another file so that it can be used elsewhere
export const Quarter = {
    Fall: 'fall',
    Winter: 'winter',
    Spring: 'spring',
    Summer: 'summer'
}

export const ExpenseType = {
    0: 'unassigned',
	1: 'entertainment',
    2: 'tuition',
    3: 'food',
    4: 'textbooks',
    5: 'transportation'
}

export const IncomeType = {
    0: 'unassigned',
    1: 'grant',
    2: 'loan',
    3: 'wages',
    4: 'family'
}

// .env file import, using this so that database password and host ip address aren't in vcs
dotenv.config();

let databaseExists = true;

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// check if database exists on localhost, if databaseExists is false, EVERY FUNCTION CALL IN THIS FILE WILL RETURN UNDEFINED
pool.getConnection((err,connection)=> {
    if(err) {
        console.log("AAAAHHHHH");
        databaseExists = false;
    }
    if (connection) {
        console.log("database connected successfully!!");
        connection.release();
    }
    });

//  -------- user stuff, account stuff --------------
/**
 * get a list of all users
 * @returns list of all users, each element is a User object with fields username, pass, and id
 */
export function getUsers() {
    if (!databaseExists) return undefined
    const result = pool.query("SELECT * FROM users");
    const rows = result[0];
    return rows;
}

/**
 * get a specific user with that user's id
 * @param {number} userId 
 * @returns User object with fields username, pass, and id
 */
export function getUser(userId) {
    if (!databaseExists) return undefined
    const [rows] = pool.query(`
    SELECT * 
    FROM users
    WHERE id = ?
    `, [userId]);
    return rows;
}

/**
 * get the User object for user with username username
 * @param {string} username 
 * @returns User object, with fields username, pass, and id
 */
export function getUserWithUsername(username) {
    if (!databaseExists) return undefined
    const [rows] = pool.query(`
    SELECT *
    FROM users
    WHERE username=?
    `, [username]);
    return rows;
}

/**
 * check if the user with the given username and password exists in the database.
 * @param {string} username 
 * @param {string} password 
 * @returns the id of the User if it exists, or undefined if it does not exist
 */
export function userExists(username, password) {
    if (!databaseExists) return undefined
    const [rows] = pool.query(`
    SELECT *
    FROM users
    WHERE username=? AND pass=?
    `, [username, password]);
    if (rows[0] == undefined) return undefined;
    return rows[0].id;
}

/**
 * create a new user in the database
 * @param {string} username 
 * @param {string} pass 
 * @returns struct with fields id, username, and pass
 */
export function createUser(username, pass) {
    if (!databaseExists) return undefined
    const result = pool.query(`
    INSERT INTO users (username, pass)
    VALUES (?, ?)
    `, [username, pass]);
    return {
        'id': result[0].insertId,
        'username': username,
        'pass': pass
    };
}

/**
 * remove the user in the database with the specified id. if it doesn't exist, nothing happens
 * @param {number} userId 
 * @returns struct with fields id, username, pass of the user which got deleted. if it doesn't exists, returns undefined.
 */
export function removeUser(userId) {
    if (!databaseExists) return undefined
    const item = pool.query(`
    SELECT *
    FROM users
    WHERE id = ?
    `, [userId]);
    if (item[0] == undefined) return undefined;
    const result = pool.query(`
    DELETE FROM users WHERE id=?
    `, [userId]);
    return {
        'id': userId,
        'username': item[0].username,
        'pass': item[0].pass
    };
}

// ------ budget stuff -------

/** 
 * get a budget by its id
 * @param {number} budgetId
 * @returns budget row, or undefined if it does not exist
 * */ 
export function getBudget(budgetId) {
    if (!databaseExists) return undefined
    const [rows] = pool.query(`
    SELECT *
    FROM budgets
    WHERE id=?
    `, [budgetId]);
    return rows;
}

/**
 * get a budget by the userId that owns it and the quarter and year it is for
 * @param {number} userId 
 * @param {Quarters} quarter 
 * @param {number} year 
 * @returns budget row with the specified quarter and year, or undefined if it does not exist
 */
export function getBudgetForUserId(userId, quarter, year) {
    if (!databaseExists) return undefined
    const [rows] = pool.query(`
    SELECT * 
    FROM budgets
    WHERE userId=? AND quarter=? AND year=?
    `, [userId, quarter, year]);
    return rows;
}

/**
 * get a budget by the userId that owns it
 * @param {number} userId 
 * @returns budget row(s) that the user userId owns
 */
export function getAllBudgetsForUserId(userId) {
    if (!databaseExists) return undefined
    const [rows] = pool.query(`
    SELECT *
    FROM budgets
    WHERE userId=?
    `, [userId]);
    return rows;
}

/**
 * create a budget for user userId, with quarter quarter and year year
 * @param {number} userId 
 * @param {Quarters} quarter 
 * @param {number} year 
 * @returns array of budget id, quarter, year
 */
export function createBudget(userId, quarter, year)  {
    if (!databaseExists) return undefined
    const result = pool.query(`
    INSERT INTO
    budgets (userId, quarter, year)
    VALUES (?, ?, ?)
    `, [userId, quarter, year]);
    return {
        'id': result[0].insertId,
        'quarter': quarter,
        'year': year
    };
}

// -------- expense stuff, consider this part of budget stuff --------

/**
 * get a list of all Expenses for budget with id budgetId
 * @param {number} budgetId 
 * @returns list of Expenses. each element is a struct with fields id, amount, and type
 */
export function getExpenses(budgetId) {
    if (!databaseExists) return undefined
    const expenses = pool.query(`
    SELECT * 
    FROM expenses
    WHERE budgetId = ?
    `, [budgetId]);
    return expenses[0];
}

/**
 * create expense for the budget with budgetId, with amount amount and type type
 * @param {number} budgetId 
 * @param {number} amount 
 * @param {ExpenseType} type 
 * @returns the Expense that was created (struct contiaining id, amount, and type)
 */
export function createExpense(budgetId, amount, type) {
    if (!databaseExists) return undefined
    const expense = pool.query(`
    INSERT
    INTO expenses (budgetId, amount, type)
    VALUES (?, ?, ?)
    `, [budgetId, amount, type]);
    return {
        'id': expense[0].insertId,
        'amount': amount,
        'type': type
    };
}

/**
 * get a list of all Incomes for budget with id budgetId
 * @param {number} budgetId id of the budget
 * @returns a list of all Incomes for that budget. each Income is a struct with fields id, amount, and type
 */
export function getIncomes(budgetId) {
    if (!databaseExists) return undefined
    const incomes = pool.query(`
    SELECT *
    FROM incomes
    WHERE budgetId = ?
    `, [budgetId]);
    return incomes[0];
}

/**
 * create Income for budget with id budgetId, with amount amount and type type
 * @param {number} budgetId id of the budget this income is for
 * @param {number} amount money amount for the income
 * @param {IncomeType} type 0: 'unassigned', 1: 'grant', 2: 'loan', 3: 'wages', 4: 'family'
 * @returns struct with id, amount, and type of the Income that was created
 */
export function createIncome(budgetId, amount, type) {
    if (!databaseExists) return undefined
    const income = pool.query(`
    INSERT
    INTO incomes (budgetId, amount, type)
    VALUES (?, ?, ?)
    `, [budgetId, amount, type]);
    return {
        'id': income[0].insertId,
        'amount': amount,
        'type': type
    };
}

/**
 * create a Savings for budget
 * @param {number} budgetId id of the budget
 * @param {number} amount savings amount
 * @returns Savings object that contains the id of the savings that was inserted, and the amount
 */
export function createSavings(budgetId, amount) {
    if (!databaseExists) return undefined
    const savings = pool.query(`
    INSERT
    INTO savings (budgetId, amount)
    VALUES(?, ?)
    `, [budgetId, amount])
    return {
        'id': savings[0].insertId,
        'amount': amount
    }
}

/**
 * update the savings amount to amount. (please only create one savings for each budget, and update it as the savings changes)
 * @param {number} budgetId id of the budget
 * @param {number} amount numerical amount to update to
 */
export function updateSavings(budgetId, amount) {
    if (!databaseExists) return undefined
    const result = pool.query(`
    SELECT
    FROM 
    `)
}

// EXPENSE INCOME AND SAVINGS
// savings goal
// 

