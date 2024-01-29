document.getElementById('email-input').addEventListener('focus', function () {
    document.getElementById('email-label').style.display = 'none';
});

document.getElementById('email-input').addEventListener('blur', function () {
    if (this.value === '') {
        document.getElementById('email-label').style.display = 'block';
    }
});