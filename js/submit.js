const allergenDivs = document.querySelectorAll(".allergen")

allergenDivs.forEach(div => {
    div.querySelector("input").addEventListener("change",e=>{
        let thisElement = e.target;
        console.log(e.target)
        let thisAllergen = thisElement.id;
        let allergenImg = thisElement.parentElement.querySelector("img")

        if(thisElement.checked){
            allergenImg.src = "/img/P"+thisAllergen+".png"
        } else {
            allergenImg.src = "/img/"+thisAllergen+".png"
        }
    })
})