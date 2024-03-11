export const Quarter = {
    Fall: 'fall',
    Winter: 'winter',
    Spring: 'spring',
    Summer: 'summer'
}

export const ExpenseType = {
    unassigned: 0,
	tuition: 1,
    textbooks: 2,
    transportation: 3,
    loan_student: 4,
    loan_personal: 5,
    food: 6,
    expense_living: 7,
    expense_personal: 8
}

export const IncomeType = {
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
    data['for'] = 'data-input'; // indicate it's for budget input
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
                location.replace(response.url); // loads url returned in the response
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