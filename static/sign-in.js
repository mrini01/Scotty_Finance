// Get the form element
const form = document.querySelector('form');

// Add submit event listener 
form.addEventListener('submit', (e) => 
{
  // Prevent default submission
  e.preventDefault();
  
  // Get form data
  const email = form.email.value; 
  const password = form.password.value;

  // Validate input
  if(email == '' || password == '') 
  {
    alert('Please fill in all fields');
    return;
  }

  // Send login request (using fetch here as example)
  

});