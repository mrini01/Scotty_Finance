const Quarter = {
    Fall: 'fall',
    Winter: 'winter',
    Spring: 'spring',
    Summer: 'summer'
}

const ExpenseType = {
    unassigned: 0,
	tuition: 1,
    transportation: 2,
    loan_student: 3,
    loan_personal: 4,
    food: 5,
    expense_living: 6,
    expense_personal: 7
}

const IncomeType = {
    unassigned: 0,
    income: 1,
    savings: 2,
    investments: 3
}


const formElem = document.querySelector('#mainCalc');

async function sendData() {
    // construct formdata
    const formData = new FormData(formElem);
    let data = {};
    formData.forEach(function(value, key) {
        data[key] = value;
    });
    data['quarter'] = 'fall';
    console.log(data);
    console.log(formData);

    try {
        fetch("/budget", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            // send object of formData instance as request body
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                // return response.json();
                return data;
            }
            throw new Error('Network response was not ok.');
        })
        .then(data => {
            console.log('Success: ', JSON.stringify(data));
            alert('Budget data submitted successfully!');
        })
        .catch((error) => {
            console.error('Error:', error);
            console.log(data);
            alert('There was a problem with your submission: ' + error.message);
        });
    } catch (e) {
        console.error(e);
    }
}

// take over form submission
formElem.addEventListener("submit", (event) => {
    event.preventDefault();
    console.log('submitted .. ');
    sendData();
})

// listener for the submit is a post request to /budget that is defined in app.js

// adds a listener for the submit button event
// document.addEventListener('submit', (e) => {
//     e.preventDefault(); // Prevent the default form submission

//     // Determine the quarter based on the URL or another mechanism
//     const quarter = determineQuarter();

//     // Extract form data
//     const formData = new FormData(formElem);
//     let data = {};
//     formData.forEach(function(value, key) {
//         data[key] = value;
//     });
//     // data['quarter'] = quarter; // Add quarter information

//     // go through each input field in the form and send them to the database!
    

//     // // Submit data to your server
//     // submitBudgetData(data);
//     console.log(formData);
//     alert('woh');
// });


function determineQuarter() {
    // Example implementation 
    const path = window.location.pathname;
    if(path.includes('fall')) return Quarter.Fall;
    if(path.includes('winter')) return Quarter.Winter;
    if(path.includes('spring')) return Quarter.Spring;
    if(path.includes('summer')) return Quarter.Summer;
    return 'Unknown'; 
}

async function submitBudgetData(data) {
    // fetch('/api/budget', { // The endpoint URL where the server should handle budget data ??
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(data),
    // })
    // .then(response => {
    //     if (response.ok) {
    //         return response.json();
    //     }
    //     throw new Error('Network response was not ok.');
    // })
    // .then(data => {
    //     console.log('Success:', data);
    //     alert('Budget data submitted successfully');
    // })
    // .catch((error) => {
    //     console.error('Error:', error);
    //     alert('There was a problem with your submission: ' + error.message);
    // });




    // terrible terrible terrible terrible
    // send json data to /budget for some reason..
    

    // FIXME replace '1' with the id of the current user, and '2023' with something else idk
    let user = await database.createUser('woah', 'noway');

    let budget = await database.getBudgetForUserId(user.id, determineQuarter(), '2023');

    if (!budget) {
        budget = await database.createBudget(user.id, determineQuarter(), '2023');
    }

    for (var i in data) {
        switch (data.key) {
            // expenses
            case 'tuition':
                // we're just scrapping the return value for these functions which isn't really a problem?
                database.createExpense(budget.id, data.value, database.ExpenseType[1]);
                break;
            case 'textbooks':
                database.createExpense(budget.id, data.value, database.ExpenseType[2]);
                break;
            case 'transportation':
                database.createExpense(budget.id, data.value, database.ExpenseType[3]);
                break;
            case 'loan-student':
                database.createExpense(budget.id, data.value, database.ExpenseType[4]);
                break;
            case 'loan-personal':
                database.createExpense(budget.id, data.value, database.ExpenseType[5]);
                break;
            case 'food':
                database.createExpense(budget.id, data.value, database.ExpenseType[6]);
                break;
            case 'expense-living':
                database.createExpense(budget.id, data.value, database.ExpenseType[7]);
                break;
            case 'expense-personal':
                database.createExpense(budget.id, data.value, database.ExpenseType[8]);
                break;
            
            // incomes
            case 'income':
                database.createIncome(budget.id, data.value, database.IncomeType[1]);
                break;
            case 'savings':
                database.createIncome(budget.id, data.value, database.IncomeType[2]);
                break;
            case 'investments':
                database.createIncome(budget.id, data.value, database.IncomeType[3]);
                break;
            
            // savingsGoal
            case 'savingsGoal':
                database.createSavings(budget.id, data.value);
                break;
        }
    }
}
