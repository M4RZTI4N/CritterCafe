const vote_like = document.getElementById("like");
const vote_dislike = document.getElementById("dislike")
const url = document.getElementById("username").innerText+"-"+document.getElementById("title").innerText
console.log("url: ", url)

vote_like.addEventListener("click",()=>{
    fetch("../api/upvote",{
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        }).then(()=>{
            location.replace("../")
        })
})
vote_dislike.addEventListener("click",()=>{
    fetch("../api/downvote",{
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        }).then(()=>{
            location.replace("../")
        })
})