import * as database from './database.js';

// Function to handle sign-up form submission
export async function handleSignUp(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get the form values
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email').value;

  // Call the createUser function from the database.js file
  const user = await database.createUser(username, password, email);

  if (user) {
    // User created successfully, you can redirect to the appropriate page or perform any other actions
    console.log('Sign-up successful:', user);
    // Redirect or perform other actions
  } else {
    // Error creating user, display an error message
    console.log('Sign-up failed');
    // Display an error message
  }
}

// Add an event listener to the sign-up form
document.getElementById('sign-up-form').addEventListener('submit', handleSignUp);