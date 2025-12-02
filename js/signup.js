function validateLogin(){
    let canPass = true;
    let errormsg = ""
    if(document.getElementById("username").value == "" || document.getElementById("password").value == "" || document.getElementById("confirm").value == "" ){canPass = false; errormsg = "Make sure each field is filled"}
    if(document.getElementById("password").value != document.getElementById("confirm").value){canPass = false; errormsg = "Passwords don't match"}

    if(canPass){
        document.getElementById("errormsg").style.display = "none"
    } else {
        document.getElementById("errormsg").style.display = "block"
        document.getElementById("errormsg").innerText = errormsg
    }
    return canPass
}
