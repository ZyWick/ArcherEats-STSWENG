const dropDownItem = document.querySelectorAll(".dropdown-item");
const storeProducts = document.querySelectorAll(".col-lg-3");

for (i = 0; i < dropDownItem.length; i++) {
    dropDownItem[i].addEventListener("click", (e) => {
        e.preventDefault()

        const filter = e.target.dataset.filter;
        
        storeProducts.forEach((product) => {
            if (filter == "any") {
                product.style.display = "block"
            } else {
                if (product.classList.contains(filter)) {
                    product.style.display = "block"
                } else {
                    product.style.display = "none"
                }
            }
        })

    })
}