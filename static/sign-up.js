// import * as database from './database.js';

// // Function to handle sign-up form submission
// export async function handleSignUp(event) {
//   event.preventDefault(); // Prevent the default form submission behavior

//   // Get the form values
//   const username = document.getElementById('username').value;
//   const password = document.getElementById('password').value;
//   const email = document.getElementById('email').value;

//   // Call the createUser function from the database.js file
//   const user = await database.createUser(username, password, email);

//   if (user) {
//     // User created successfully, you can redirect to the appropriate page or perform any other actions
//     console.log('Sign-up successful:', user);
//     // Redirect or perform other actions
//   } else {
//     // Error creating user, display an error message
//     console.log('Sign-up failed');
//     // Display an error message
//   }
// }

// // Add an event listener to the sign-up form
// document.getElementById('sign-up-form').addEventListener('submit', handleSignUp);

// Add an event listener to the sign-in form
const form = document.getElementById('sign-up-form');
form.addEventListener('submit', handleSignUp);

// Function to handle sign-in form submission
async function handleSignUp(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  const formData = new FormData(form);
  let formDataData = {};
  formData.forEach(function(value, key) {
    formDataData[key] = value;
  });
  formDataData['for'] = 'user-signin'; // indicate it's for budget input
  console.log(formDataData);

  fetch('/sign-up-call', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formDataData)
  }).then(async (response) => {
    console.log(response);
    if (response.ok) {
      // hugely bandaid solution because i really don't want to do this anymore
      // was trying to send the file through a bunch of redirects, and it wasn't working, however setting the url here works for some reason :)
      // i'm very normal about this no strong feelings whatsoever
      alert('Account created! Redirecting to profile page.');
      location.replace(response.url);
    }
    else {
      alert('Uh oh! Server error! Whoopsy!');
      location.reload();
    }
  });
}