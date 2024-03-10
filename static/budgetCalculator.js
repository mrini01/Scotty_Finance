document.getElementById('budgetCalculator').addEventListener('submit', function(event) {

    // Collecting data
    var formData = {
        textbooks: document.getElementById('textbooks').value,
        transportation: document.getElementById('transportation').value,
        tuition: document.getElementById('tuition').value,
        savingsGoal: document.getElementById('savingsGoal').value,
    };

    console.log(formData); // For demonstration, showing the form data in console

    
});
