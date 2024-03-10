// Add an event listener to the sign-in form
const form = document.getElementById('sign-in-form');
form.addEventListener('submit', handleSignIn);

// Function to handle sign-in form submission
function handleSignIn(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // should be global variables for the user who is signed in
  var user; 
  var email;

  const formData = new FormData(form);
  let formDataData = {};
  formData.forEach(function(value, key) {
    formDataData[key] = value;
  });
  formDataData['for'] = 'user-login'; // indicate it's for budget input
  console.log(formDataData);

  var responseData = undefined;

  fetch('/budget', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formDataData)
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      responseData = data;
      if (responseData.successful) {
        user = responseData.username;
        email = responseData.email;
        // redirect to home page, but signed in this time
        // probably want to pass the username and email to the redirected page somehow, 
        // also the sign in status (like we're going to the home page but we're signed in)
        console.log('sign in successful!');
      }
      else {
        alert('Sign in failed, try again');
        location.reload();
      }
    });

  

  // if (userId) {
  //   // User exists, you can redirect to the appropriate page or perform any other actions
  //   console.log('Sign-in successful:', userId);
  //   // Redirect or perform other actions
  // } else {
  //   // User doesn't exist, display an error message
  //   console.log('Sign-in failed');
  //   // Display an error message
  // }
}

