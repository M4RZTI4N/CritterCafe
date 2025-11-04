function validateLogin(){
    let canPass = true;
    let errormsg = ""
    if(document.getElementById("username").value == "" || document.getElementById("password").value == "" || document.getElementById("confirm").value == "" ){canPass = false; errormsg = "Make sure each field is filled"}
    if(document.getElementById("password").value != document.getElementById("confirm").value){canPass = false; errormsg = "Passwords don't match"}

    return canPass
}