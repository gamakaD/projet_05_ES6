document.addEventListener('DOMContentLoaded', () => {

    const items = document.getElementById('items');
    const url = 'http://127.0.0.1:3000/api/products';

    // Connection à l'API
    function fetchData() {
        fetch(url)
            .then(res => res.json())
            .then(data => renderItems(data))
            .catch((error) => {
                console.log(error);
            })
    }

    // Rendu des elements dans le DOM
    function renderItems(data) {
        data.forEach((item) => {

            const itemLink =
                `<a href="./product.html?id=${item._id}">
                    <article>
                        <img src="${item.imageUrl}" alt="${item.altTxt}">
                        <h3 class="productName">${item.name}</h3>
                        <p class="productDescription">${item.description}</p>
                    </article>
                </a>`

            items.insertAdjacentHTML("afterbegin", itemLink)
        })
    }
    fetchData()
})




