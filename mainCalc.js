document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mainCalc');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission

        // Determine the quarter based on the URL or another mechanism
        const quarter = determineQuarter();

        // Extract form data
        const formData = new FormData(form);
        const data = {};
        formData.forEach(function(value, key) {
            data[key] = value;
        });
        data['quarter'] = quarter; // Add quarter information

        // Submit data to your server
        submitBudgetData(data);
    });
});

function determineQuarter() {
    // Example implementation 
    const path = window.location.pathname;
    if(path.includes('fall')) return 'Fall';
    if(path.includes('winter')) return 'Winter';
    if(path.includes('spring')) return 'Spring';
    if(path.includes('summer')) return 'Summer';
    return 'Unknown'; 
}

function submitBudgetData(data) {
    fetch('/api/budget', { // The endpoint URL where the server should handle budget data ??
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(data => {
        console.log('Success:', data);
        alert('Budget data submitted successfully');
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was a problem with your submission: ' + error.message);
    });
}
