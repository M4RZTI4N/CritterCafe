// var diff_select = document.getElementById("diff_select")
// var diff_img = document.getElementById("diff_img")

// console.log(diff_img.getBoundingClientRect())

// diff_select.onchange = (e)=>{
//     let img_string = `img/diffuculty${e.target.value}.png`

//     diff_img.src = img_string
//     diff_img.alt = `difficulty${int(e.target.value)+1}`
// }


var click_img = document.getElementById("click_img")

click_img.onclick = (e)=>{
    console.log(`click location: ${e.clientX}, ${e.clientY}`)
    
    let i = Math.ceil((e.clientX-click_img.getBoundingClientRect().left)/(click_img.getBoundingClientRect().width/5))

    console.log(`img clicked: ${i}`)
    let img_string = `img/diffuculty${i}.png`

    click_img.src = img_string
    click_img.alt = `difficulty${i}`

    document.getElementById("rating_indicator").innerText = i   
}

