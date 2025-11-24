const deleteButton = document.getElementById("deleteRecipe");

deleteButton.addEventListener("click",()=>{
    let q = confirm("are you sure you wanna delete the recipie? this cannot be undone")
    if(q){
        fetch("../api/delete",{
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({uri: document.getElementById("uri").value})
        }).then(()=>{
            location.replace("../")
        })
    }
})