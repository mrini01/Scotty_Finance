// script for communication with the database
import mysql from 'mysql2';
import dotenv from 'dotenv';

import fs from 'fs';
import readline from 'readline';

// quarters enum, not an enum bc javascript doesn't support them but you can treat it like one
// might move this to another file so that it can be used elsewhere
// Quarter
export const Quarter = {
    namesToValues: {
        Fall: 'fall',
        Winter: 'winter',
        Spring: 'spring',
        Summer: 'summer'
    },
    valuesToNames: {
        fall: 'Fall',
        winter: 'Winter',
        spring: 'Spring',
        summer: 'Summer'
    }
};

// ExpenseType
export const ExpenseType = {
    namesToValues: {
        unassigned: 0,
        tuition: 1,
        textbooks: 2,
        transportation: 3,
        loan_student: 4,
        loan_personal: 5,
        food: 6,
        expense_living: 7,
        expense_personal: 8
    },
    valuesToNames: {
        0: 'unassigned',
        1: 'tuition',
        2: 'textbooks',
        3: 'transportation',
        4: 'loan_student',
        5: 'loan_personal',
        6: 'food',
        7: 'expense_living',
        8: 'expense_personal'
    }
};

// IncomeType
export const IncomeType = {
    namesToValues: {
        unassigned: 0,
        income: 1,
        savings: 2,
        investments: 3
    },
    valuesToNames: {
        0: 'unassigned',
        1: 'income',
        2: 'savings',
        3: 'investments'
    }
};

let databaseExists = true;

var pool = undefined;

export async function createDBPool(host, user, password, database) {
    pool = mysql.createPool({
        host: host,
        user: user,
        password: password,
        database: database
    }).promise();

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

    return pool; // just in case someone AHEM AHEM AHEM the test suite AHEM wants to use the pool
}



// definitely sanitized function to run arbitrary sql queries 👍
export async function dbRunQuery(sql) {
    const result = await pool.query(sql);
    return result;
}

//  -------- user stuff, account stuff --------------
/**
 * get a list of all users
 * @returns list of all users, each element is a User object with fields username, pass, and id; undefined if there are no users
 */
export async function getUsers() {
    if (!databaseExists) return undefined
    const result = await pool.query("SELECT * FROM users");
    const rows = result[0];
    if (rows.length == 0) return undefined;
    return rows;
}

/**
 * get a specific user with that user's id
 * @param {number} userId 
 * @returns User object with fields username, pass, and id
 */
export async function getUser(userId) {
    if (!databaseExists) return undefined
    const [rows] = await pool.query(`
    SELECT * 
    FROM users
    WHERE id = ?
    `, [userId]);
    if (rows.length == 0) return undefined;
    return rows[0]; // query returns an array by default, so return the first element
    // return rows;
}

/**
 * get the User object for user with username username
 * @param {string} username 
 * @returns User object, with fields username, pass, and id
 */
export async function getUserWithUsername(username) {
    if (!databaseExists) return undefined
    const [rows] = await pool.query(`
    SELECT *
    FROM users
    WHERE username=?
    `, [username]);
    if (rows.length == 0) return undefined;
    return rows[0];
}

/**
 * check if the user with the given username and password exists in the database.
 * @param {string} username 
 * @param {string} password 
 * @returns the id of the User if it exists, or undefined if it does not exist
 */
export async function userExists(username, password) {
    if (!databaseExists) return undefined
    const [rows] = await pool.query(`
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
export async function createUser(username, pass, email) {
    if (!databaseExists) return undefined
    const result = await pool.query(`
    INSERT INTO users (username, pass, email)
    VALUES (?, ?, ?)
    `, [username, pass, email]);

    console.log(`created user with username ${username}, password ${pass}, and email ${email}, and id ${result[0].insertId}`);

    return {
        id: result[0].insertId,
        username: username,
        pass: pass,
        email: email
    };
}

/**
 * remove the user in the database with the specified id. if it doesn't exist, nothing happens
 * @param {number} userId 
 * @returns struct with fields id, username, pass of the user which got deleted. if it doesn't exists, returns undefined.
 */
export async function removeUser(userId) {
    if (!databaseExists) return undefined
    const item = await pool.query(`
    SELECT *
    FROM users
    WHERE id = ?
    `, [userId]);
    if (item[0] == undefined) return undefined;
    const result = pool.query(`
    DELETE FROM users WHERE id=?
    `, [userId]);

    console.log(`removed user with username ${username} and password ${pass}, and id ${userId}`);

    return {
        id: userId,
        username: item[0].username,
        pass: item[0].pass
    };
}

// ------ budget stuff -------

/** 
 * get a budget by its id
 * @param {number} budgetId
 * @returns budget row, or undefined if it does not exist
 * */ 
export async function getBudget(budgetId) {
    if (!databaseExists) return undefined
    const [rows] = await pool.query(`
    SELECT *
    FROM budgets
    WHERE id=?
    `, [budgetId]);
    if (rows.length == 0) return undefined;
    return rows[0];
}

/**
 * get a budget by the userId that owns it and the quarter and year it is for
 * @param {number} userId 
 * @param {Quarters} quarter 
 * @param {number} year 
 * @returns budget row with the specified quarter and year, or undefined if it does not exist
 */
export async function getBudgetForUserId(userId, quarter, year) {
    if (!databaseExists) return undefined;
    const [rows] = await pool.query(`
    SELECT * 
    FROM budgets
    WHERE userId=? AND quarter=? AND year=?
    `, [userId, quarter, year]);
    if (rows.length == 0) return undefined;
    return rows[0];
}

/**
 * get a budget by the userId that owns it
 * @param {number} userId 
 * @returns budget array of row(s) that the user userId owns (NOTE: IF THE USER OWNS NO BUDGETS, RETURNS AN ARRAY OF LENGTH 0, *NOT* UNDEFINED)
 */
export async function getAllBudgetsForUserId(userId) {
    if (!databaseExists) return undefined;
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
    if (!databaseExists) return undefined
    const result = await pool.query(`
    INSERT INTO
    budgets (userId, quarter, year)
    VALUES (?, ?, ?)
    `, [userId, quarter, year]);

    console.log(`created budget with id ${result[0].insertId} and quarter ${quarter}`);

    return {
        id: result[0].insertId,
        quarter: quarter,
        year: year
    };
}

// -------- expense stuff, consider this part of budget stuff --------

/**
 * get a list of all Expenses for budget with id budgetId
 * @param {number} budgetId 
 * @returns array of Expenses. each element is a struct with fields id, amount, and type
 */
export async function getExpenses(budgetId) {
    if (!databaseExists) return undefined
    const [expenses] = await pool.query(`
    SELECT * 
    FROM expenses
    WHERE budgetId = ?
    `, [budgetId]);
    return expenses;
}

/**
 * get a specific Expense for budget with id budgetId and type
 * @param {number} budgetId 
 * @param {ExpenseType} type
 * @returns Specific Expense or null, struct with fields id, amount, and type
 */
export async function getExpenseByBudgetId(budgetId, type) {
    if (!databaseExists) return undefined
    const [expenses] = await pool.query(`
        SELECT *
        FROM expenses
        WHERE budgetId = ? AND type = ?
    `, [budgetId, type]);
   
    console.log(expenses);
    if(expenses.length == 0) return null;
    return expenses[0];

}

/**
 * create expense for the budget with budgetId, with amount amount and type type
 * @param {number} budgetId 
 * @param {number} amount 
 * @param {ExpenseType} type 
 * @returns the Expense that was created (object contiaining id, amount, and type)
 */
export async function createExpense(budgetId, amount, type) {
    if (!databaseExists) return undefined
    if(amount.length == 0) {
        amount = "-1";
    }
    const exists = await getExpenseByBudgetId(budgetId, type);

    if (exists) {
        // If the expense exists, update it
        if(amount<0) {amount = exists.amount; }
        await pool.query(`
        UPDATE expenses 
        SET amount = ?, type = ?
        WHERE id = ?
        `, [amount, type, exists.id]);

        console.log(`Updated expense with id ${exists.id}`);
        return {
            id: exists.id,
            amount: amount,
            type: type
        };
    } else {

        const expense = await pool.query(`
        INSERT
        INTO expenses (budgetId, amount, type)
        VALUES (?, ?, ?)
        `, [budgetId, amount, type]);

        console.log(`created expense with id ${expense[0].insertId}, amount ${amount}, and type ${type}`);

        return {
            id: expense[0].insertId,
            amount: amount,
            type: type
        };
    }
}

/**
 * get a list of all Incomes for budget with id budgetId
 * @param {number} budgetId id of the budget
 * @returns a list of all Incomes for that budget. each Income is an object with fields id, amount, and type
 */
export async function getIncomes(budgetId) {
    if (!databaseExists) return undefined
    const [incomes] = await pool.query(`
    SELECT *
    FROM incomes
    WHERE budgetId = ?
    `, [budgetId]);
    return incomes;
}

/**
 * get a specific Income for budget with id budgetId and type
 * @param {number} budgetId 
 * @param {ExpenseType} type
 * @returns Specific Income or null, struct with fields id, amount, and type
 */
export async function getIncomeByBudgetId(budgetId, type) {
    if (!databaseExists) return undefined
    const [incomes] = await pool.query(`
        SELECT *
        FROM incomes
        WHERE budgetId = ? AND type = ?
    `, [budgetId, type]);
   
    console.log(incomes);
    if(incomes.length == 0) return null;
    return incomes[0];
}

/**
 * create Income for budget with id budgetId, with amount amount and type type
 * @param {number} budgetId id of the budget this income is for
 * @param {number} amount money amount for the income
 * @param {IncomeType} type 0: 'unassigned', 1: 'grant', 2: 'loan', 3: 'wages', 4: 'family'
 * @returns object with id, amount, and type of the Income that was created
 */
export async function createIncome(budgetId, amount, type) {
    if (!databaseExists) return undefined
    if(amount.length == 0) {
        amount = "-1";
    }
    const existsIncome = await getIncomeByBudgetId(budgetId, type);

    if (existsIncome) {
        // If the expense exists, update it
        if(amount<0) {amount = existsIncome.amount; }
        await pool.query(`
        UPDATE incomes 
        SET amount = ?, type = ?
        WHERE id = ?
        `, [amount, type, existsIncome.id]);

        console.log(`Updated incomes with id ${existsIncome.id}`);
        return {
            id: existsIncome.id,
            amount: amount,
            type: type
        };
    } else {

        const income = await pool.query(`
        INSERT
        INTO incomes (budgetId, amount, type)
        VALUES (?, ?, ?)
        `, [budgetId, amount, type]);

        console.log(`created income with id ${income[0].insertId}, amount ${amount}, and type ${type}`);

        return {
            id: income[0].insertId,
            amount: amount,
            type: type
        };
    }
}


/**
 * get a specific Income for budget with id budgetId and type
 * @param {number} budgetId 
 * @param {ExpenseType} type
 * @returns Specific Savings or null, struct with fields id, amount, and type
 */
export async function getSavingsByBudgetId(budgetId) {
    if (!databaseExists) return undefined
    const [savings] = await pool.query(`
        SELECT *
        FROM savings
        WHERE budgetId = ?
    `, [budgetId]);
   
    console.log(savings);
    if(savings.length == 0) return null;
    return savings[0];
}


/**
 * create a Savings for budget
 * @param {number} budgetId id of the budget
 * @param {number} amount savings amount
 * @returns Savings object that contains the id of the savings that was inserted, and the amount
 */
export async function createSavings(budgetId, amount) {
    if (!databaseExists) return undefined;
    if(amount.length == 0) {
        amount = "-1";
    }
    const existsSavings = await getSavingsByBudgetId(budgetId);

    if (existsSavings) {
        if(amount<0) {amount = existsSavings.amount; }
        // If the expense exists, update it
        await pool.query(`
        UPDATE savings
        SET amount = ?
        WHERE id = ?
        `, [amount, existsSavings.id]);

        console.log(`Updated incomes with id ${existsSavings.id}`);
        return {
            id: existsSavings.id,
            amount: amount,
        };
    } else {

        const savings = await pool.query(`
        INSERT
        INTO savings (budgetId, amount)
        VALUES(?, ?)
        `, [budgetId, amount]);

        console.log(`created savings with id ${savings[0].insertId}, amount ${amount}`);

        return {
            id: savings[0].insertId,
            amount: amount
        };
    }
}

/**
 * update the savings amount to amount. (please only create one savings for each budget, and update it as the savings changes)
 * @param {number} budgetId id of the budget
 * @param {number} amount numerical amount to update to
 */
export async function updateSavings(budgetId, amount) {
    if (!databaseExists) return undefined
    const result = await pool.query(`
    SELECT
    FROM 
    `)
}

/**
 * create a Savings for budget
 * @param {number} budgetId id of the budget
 * @param {number} amount savings amount
 * @returns Savings object that contains the id of the savings that was inserted, and the amount
 */
export async function getSavings(budgetId) {
    if (!databaseExists) return undefined;
    const [savings] = await pool.query(`
    SELECT *
    FROM savings
    WHERE budgetid=?
    `, [budgetId]);

    console.log(savings);

    return savings[0];
}

// EXPENSE INCOME AND SAVINGS
// savings goal
// 

// const user = await getUsers();
// console.log(user);
