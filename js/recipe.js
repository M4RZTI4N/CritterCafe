const vote_like = document.getElementById("like");
const vote_dislike = document.getElementById("dislike")
const fav = document.getElementById("favorite")
const url = (document.getElementById("username").innerText + "-" + document.getElementById("title").innerText).slice(4).replace(/\s/g, "").trim();
console.log("url: ", url)


vote_like.addEventListener("click", () => {
    if (vote_like.classList.contains("active")) { //going from like -> neutral
        fetch("../api/novote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        })
        
        vote_like.src = "/img/cat_like_inactive.png"
        vote_dislike.src = "/img/cat_dislike_inactive.png"
        vote_like.classList.remove("active")

    } else { // going from neutral/dislike -> like
        fetch("../api/upvote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        })

        vote_like.src = "/img/cat_like.png"
        vote_dislike.src = "/img/cat_dislike_inactive.png"
        vote_like.classList.add("active")
    }
})

vote_dislike.addEventListener("click", () => {
    if (vote_dislike.classList.contains("active")) { //going from dislike -> neutral
        fetch("../api/novote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        })
        
        vote_like.src = "/img/cat_like_inactive.png"
        vote_dislike.src = "/img/cat_dislike_inactive.png"
        vote_dislike.classList.remove("active")

    } else { // going from neutral/like -> dislike
        fetch("../api/downvote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        })

        vote_like.src = "/img/cat_like_inactive.png"
        vote_dislike.src = "/img/cat_dislike.png"
        vote_dislike.classList.add("active")
    }
})

fav.addEventListener("click", () => {
    if (fav.classList.contains("active")) { //unfavorite
        fetch("../api/removeFav", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        })
        
        fav.src = "/img/fav_inactive.png"
        fav.classList.remove("active")

    } else { // going from neutral/like -> dislike
        fetch("../api/addFav", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "url": url
            })
        })

        fav.src = "/img/fav.png"
        fav.classList.add("active")
    }
})