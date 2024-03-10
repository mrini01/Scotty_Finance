
import * as database from './database.js';

// Function to handle sign-in form submission
export async function handleSignIn(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Get the form values
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Call the signIn function from the database.js file
  const userId = await database.userExists(username, password);

  if (userId) {
    // User exists, you can redirect to the appropriate page or perform any other actions
    console.log('Sign-in successful:', userId);
    // Redirect or perform other actions
  } else {
    // User doesn't exist, display an error message
    console.log('Sign-in failed');
    // Display an error message
  }
}

// Add an event listener to the sign-in form
document.getElementById('sign-in-form').addEventListener('submit', handleSignIn);