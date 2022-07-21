document.addEventListener('DOMContentLoaded', () => {

    // Recuperation des elements du DOM
    const itemImg = document.getElementsByClassName('item__img')
    const itemTitle = document.getElementById('title')
    const itemPrice = document.getElementById('price')
    const itemDescription = document.getElementById('description')
    const itemColorSelection = document.getElementById('colors')

    // Recuperation de l'id produit dans l'Url
    const urlId = new URLSearchParams(window.location.search).get('id');
    
    const url = 'http://127.0.0.1:3000/api/products' + '/' + urlId;

    // Connection à l'API
    function fetchData() {
        fetch(url)
            .then(res => res.json())
            .then(data => renderItem(data))
            .catch((error) => {
                console.log(error);
            })
    }

    // Rendu visuel des produits 
    function renderItem(data) {

        // Creation des elements
        let img = `<img src="${data.imageUrl}" alt="${data.altText}">`
        itemImg[0].insertAdjacentHTML("afterbegin", img)

        // Ajout du texte 
        itemTitle.textContent = data.name
        itemPrice.textContent = data.price
        itemDescription.textContent = data.description

        // Creation et ajout des options couleur
        data.colors.forEach((color) => {
            let option = `<option value="${color}">${color}</option>`
            itemColorSelection.insertAdjacentHTML("beforeend", option)
        })
    }
    fetchData()

    // ******************************************
    // Recuperer les articles et les placer dans localStorage

    const itemQuantity = document.getElementById('quantity')
    const addToCartBtn = document.getElementById('addToCart')

    itemQuantity.value = 1

    let userColor = ""
    let userQuantity = 1

    // Ajout des ecoutes sur les elements
    itemColorSelection.addEventListener('change', colorChoice)
    itemQuantity.addEventListener('change', quantityChoice)
    addToCartBtn.addEventListener('click', addUserDataToLocalStorage)

    function colorChoice() {
        userColor = itemColorSelection.value
    }

    function quantityChoice() {
        userQuantity = Number(itemQuantity.value)
    }
    
    function addUserDataToLocalStorage() {
        let userItemKey

        if (userColor === "") {
            toastNotif('Vous devez selectionner une couleur', 'red')
            return
        } else if (userQuantity <= 0 || userQuantity > 100 || isNaN(userQuantity)) {
            toastNotif('Vous devez choisir une quantité comprise entre 1 et 100', 'red')
            return
        } else {
            userItemKey = urlId + "_" + userColor

            if (localStorage.getItem(userItemKey) === null) {

                localStorage.setItem(userItemKey, '[]')
                let userStorageData = JSON.parse(localStorage.getItem(userItemKey))
                userStorageData.push(urlId, userColor, userQuantity)
                localStorage.setItem(userItemKey, JSON.stringify(userStorageData))

            } else {
                let userStorageData = JSON.parse(localStorage.getItem(userItemKey))
                let oldUserQuantity = userStorageData[2]
                let newUserQuantity = oldUserQuantity + userQuantity
                if (newUserQuantity > 100) {
                    toastNotif('Vous ne pouvez pas commander plus de 100 articles du même modèle', 'red')
                    return
                }
                userStorageData.splice(2, 1, newUserQuantity)
                localStorage.setItem(userItemKey, JSON.stringify(userStorageData))
            }
        }
        toastNotif(itemTitle.textContent + ' ' +  userColor + ' ajouté au panier', 'green')
        console.log(localStorage)
    }

    function toastNotif(notif, color) {
        const toast = document.createElement('div')
        let toastStyle = {
            position: 'absolute',
            display : 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
            width: '100%',
            padding: '12px',
            backgroundColor: color,
            borderRadius: '8px',
        }
        Object.assign(toast.style, toastStyle)
        toast.textContent = notif 

        const removeBtn = document.createElement('button')
        removeBtn.style.width = '20%'
        removeBtn.style.padding = '5px'
        removeBtn.textContent = 'Ok'
        toast.appendChild(removeBtn)

        addToCartBtn.parentElement.style.position = 'relative'
        addToCartBtn.parentElement.appendChild(toast)
        removeBtn.onclick = () => addToCartBtn.parentElement.removeChild(toast)
    }
})




