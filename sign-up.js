const form = document.getElementById('signup-form');

form.addEventListener('submit', (e) => 
{
    e.preventDefault();
    
    // Get form values
    const name = form.name.value;
    const email = form.email.value; 
    const password = form.password.value;  

    // Send form data to backend
    signUpUser(name, email, password); 
});

function signUpUser(name, email, password) 
{
  // Send AJAX request to backend to sign up user
}