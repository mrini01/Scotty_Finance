// script for communication with the database
import mysql from 'mysql2'
import dotenv from 'dotenv'

// quarters enum, not an enum bc javascript doesn't support them but you can treat it like one
// might move this to another file so that it can be used elsewhere
export const Quarter = {
    Fall: 'fall',
    Winter: 'winter',
    Spring: 'spring'
}

export const ExpenseType = {
    0: 'unassigned',
	1: 'entertainment',
    2: 'tuition',
    3: 'food',
    4: 'textbooks',
    5: 'transportation'
}

export const EarningType = {
    0: 'unassigned',
    1: 'grant',
    2: 'loan',
    3: 'wages',
    4: 'family',
    5: 'savings'
}

// .env file import, using this so that database password and host ip address aren't in vcs
dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

//  -------- user stuff, account stuff --------------
export async function getUsers() {
    const result = await pool.query("SELECT * FROM users");
    const rows = result[0];
    return rows;
}

export async function getUser(userId) {
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE id = ?
    `, [userId]);
    return rows;
}

export async function getUserWithUsername(username) {
    const [rows] = await pool.query(`
    SELECT *
    FROM users
    WHERE username=?
    `, [username]);
    return rows;
}

export async function userExists(username, password) {
    const [rows] = await pool.query(`
    SELECT *
    FROM users
    WHERE username=? AND pass=?
    `, [username, password]);
    if (rows[0] == undefined) return undefined;
    return rows[0].id;
}

export async function createUser(username, pass) {
    const result = await pool.query(`
    INSERT INTO users (username, pass)
    VALUES (?, ?)
    `, [username, pass]);
    return {
        'id': result[0].insertId,
        'username': username,
        'pass': pass
    };
}

export async function removeUser(userId) {
    const item = await pool.query(`
    SELECT *
    FROM users
    WHERE id = ?
    `, [userId]);
    const result = await pool.query(`
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
export async function getBudget(budgetId) {
    
    const [rows] = await pool.query(`
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
export async function getBudgetForUserId(userId, quarter, year) {
    const [rows] = await pool.query(`
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
export async function getAllBudgetsForUserId(userId) {
    const [rows] = await pool.query(`
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
export async function createBudget(userId, quarter, year)  {
    const result = await pool.query(`
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

// const l = await createBudget(1, Quarters.Winter, '2024');
// console.log(l);

// -------- expense stuff, consider this part of budget stuff --------

// returns array of expenses, each expense is an array of id, budgetId, amount, type
// use getBudgetForUserId to get the budget for a user
export async function getExpenses(budgetId) {
    const expenses = await pool.query(`
    SELECT * 
    FROM expenses
    WHERE budgetId = ?
    `, [budgetId]);
    return expenses[0];
}

/**
 * 
 * @param {number} budgetId 
 * @param {number} amount 
 * @param {ExpenseType} type 
 * @returns 
 */
export async function createExpense(budgetId, amount, type) {
    const expense = await pool.query(`
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

export async function getEarnings(budgetId) {
    const earnings = await pool.query(`
    SELECT *
    FROM earnings
    WHERE budgetId = ?
    `, [budgetId]);
    return earnings[0];
}

/**
 * 
 * @param {number} budgetId 
 * @param {number} amount 
 * @param {EarningType} type 
 * @returns 
 */
export async function createEarning(budgetId, amount, type) {
    const earning = await pool.query(`
    INSERT
    INTO earnings (budgetId, amount, type)
    VALUES (?, ?, ?)
    `, [budgetId, amount, type]);
    return {
        'id': expense[0].insertId,
        'amount': amount,
        'type': type
    };
}