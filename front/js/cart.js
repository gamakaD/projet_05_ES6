document.addEventListener('DOMContentLoaded', () => {

    const url = 'http://127.0.0.1:3000/api/products';

    // Recuparation des elements du localStorage
    let userCartItems = []

    function localStorageToArray(arr) {
        for (let i = 0; i < localStorage.length; i++) {
            arr.push(JSON.parse(localStorage.getItem(localStorage.key(i))))
        }
    }

    localStorageToArray(userCartItems)

    // Connection a l'API
    function fetchData() {
        fetch(url)
            .then(res => res.json())
            .then(data => renderCart(data))
            .catch((error) => {
                console.log(error);
            })
    }

    // Rendu et modification du panier
    function renderCart(data) {

        const sectionCartItems = document.getElementById('cart__items')

        userCartItems.forEach(element => {
            data.forEach(item => {
                if (element[0] === item._id) {

                    // Creation des elements
                    let article =
                        `<article class="cart__item" data-id="${element[0]}" data-color="${element[1]}">
                        <div class="cart__item__img">
                            <img src="${item.imageUrl}" alt="${item.altText}">
                        </div>
                        <div class="cart__item__content">
                            <div class="cart__item__content__description">
                                <h2>${item.name}</h2>
                                <p>${element[1]}</p>
                                <p>${item.price} €</p>
                            </div>
                            <div class="cart__item__content__settings">
                                <div class="cart__item__content__settings__quantity">
                                    <p>Qté : ${element[2]}</p>
                                    <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${element[2]}">
                                </div>
                                <div class="cart__item__content__settings__delete">
                                    <p class="deleteItem">Supprimer</p>
                                </div>
                            </div>
                        </div>
                    </article>`

                    // // Injection des elements dans le DOM
                    sectionCartItems.insertAdjacentHTML("afterbegin", article)
                }
            })
        })

        // Ajout de l'ecoute pour les changement de quantités
        const itemQuantity = document.getElementsByClassName('itemQuantity')
        for (let i = 0; i < itemQuantity.length; i++) {
            itemQuantity[i].addEventListener('change', quantityChanged)
        }

        // Ajout de l'ecoute pour la suppression d'articles
        const itemDelete = document.getElementsByClassName('deleteItem')
        for (let i = 0; i < itemDelete.length; i++) {
            itemDelete[i].addEventListener('click', itemRemoved)
        }

        // Recuperation de ligne de l'item et creation de la clé localStorage associée
        function getParentAndKey(child) {
            let parent = child.closest('article')
            let key = parent.dataset.id + '_' + parent.dataset.color
            return [parent, key]
        }

        // Modification quantité d'un article
        function quantityChanged(event) {
            let input = event.target
            let textQuantity = input.parentElement.children[0]
            let userStorageData = JSON.parse(localStorage.getItem(getParentAndKey(input)[1]))
            if (isNaN(input.value) || input.value <= 0 || input.value > 100) {
                input.value = 1
            }
            textQuantity.textContent = 'Qté ' + ': ' + input.value
            userStorageData.splice(2, 1, Number(input.value))
            localStorage.setItem(getParentAndKey(input)[1], JSON.stringify(userStorageData))
            updateCart()
            console.log(localStorage)
        }

        // Suppression d'un article
        function itemRemoved(event) {
            let input = event.target
            getParentAndKey(input)[0].remove()
            updateCart()
            localStorage.removeItem(getParentAndKey(input)[1])
            console.log(localStorage)
        }

        // Affichage et mis à jour du panier
        function updateCart() {
            const cartRows = document.getElementsByClassName('cart__item')
            const totalPrice = document.getElementById('totalPrice')
            const totalQuantity = document.getElementById('totalQuantity')
            let total = 0
            let quantity = 0
            for (let i = 0; i < cartRows.length; i++) {
                let cartRow = cartRows[i]
                let itemPrice = cartRow.getElementsByClassName('cart__item__content__description')[0].children[2]
                let quantityItem = Number(cartRow.getElementsByClassName('itemQuantity')[0].value)
                let price = Number(itemPrice.innerText.replace('€', ''))
                total = total + (price * quantityItem)
                quantity = quantity + quantityItem
            }
            totalPrice.textContent = total
            totalQuantity.textContent = quantity
        }
        updateCart()
    }
    fetchData()

    // *************************************** //
    // Validation des saisies du formulaires   //
    // *************************************** //

    // Objet contact à renvoyer à la base de données
    const userOrderObj = { 'contact': {} }

    // Recuperation des id des produits du localeStorage
    function productIdToArray(arr) {
        let arrTemp = []
        localStorageToArray(arrTemp)
        arrTemp.forEach(element => {
            arr.push(element[0])
        })
    }

    // Ecoute sur la validation du formulaire
    const form = document.getElementsByClassName('cart__order__form')[0]
    form.addEventListener('submit', orderValidation)

    // Envoie des elements après validation 
    function orderValidation(e) {
        e.preventDefault()

        const productsOrdered = []
        productIdToArray(productsOrdered)
        userOrderObj.products = productsOrdered

        if (productsOrdered.length == 0) {
            alert('le panier est vide')
        } else if (checkInputs()) {
            sendOrderData()
        }
    }

    // Test avec une expression reguliere
    function regTest(input, regEx) {
        return regEx.test(input)
    }

    // Test et validation des champs de formulaire
    function checkInputs() {
        const firstNameValue = document.getElementById('firstName').value.trim()
        const lastNameValue = document.getElementById('lastName').value.trim()
        const addressValue = document.getElementById('address').value.trim()
        const cityValue = document.getElementById('city').value.trim()
        const emailValue = document.getElementById('email').value.trim()

        const firstNameErrorMsg = document.getElementById('firstNameErrorMsg')
        const lastNameErrorMsg = document.getElementById('lastNameErrorMsg')
        const addressErrorMsg = document.getElementById('addressErrorMsg')
        const cityErrorMsg = document.getElementById('cityErrorMsg')
        const emailErrorMsg = document.getElementById('emailErrorMsg')
        const errorMsgs = [firstNameErrorMsg, lastNameErrorMsg, addressErrorMsg, cityErrorMsg, emailErrorMsg]
        errorMsgs.forEach(element => {
            element.style.color = 'red'
            element.textContent = ""
        })

        let nameReg = /^[a-z ,.'-]+$/i;
        let addressReg = /[!@$%^&*(),?":{}|<>]/;
        let emailReg = /[A-z0-9._-]+[@]{1}[a-zA-Z0-9._-]+[.]{1}[a-zA-Z]{2,10}/;

        if (!regTest(firstNameValue, nameReg)) {
            firstNameErrorMsg.textContent = "Veuillez entrer un prenom correct"
            return false
        }
        else {
            userOrderObj.contact['firstName'] = firstNameValue
        }

        if (!regTest(lastNameValue, nameReg)) {
            lastNameErrorMsg.textContent = "Veuillez entrer un nom correct"
            return false
        }
        else {
            userOrderObj.contact['lastName'] = lastNameValue
        }

        if (regTest(addressValue, addressReg)) {
            addressErrorMsg.textContent = "Veuillez entrer une adresse correcte"
            return false
        }
        else {
            userOrderObj.contact['address'] = addressValue
        }

        if (!regTest(cityValue, nameReg)) {
            cityErrorMsg.textContent = "Veuillez entrer une ville correcte"
            return false
        }
        else {
            userOrderObj.contact['city'] = cityValue
        }

        if (!regTest(emailValue, emailReg)) {
            emailErrorMsg.textContent = "Veuillez entrer un email correct"
            return false
        }
        else {
            userOrderObj.contact['email'] = emailValue
        }
        return true
    }

    // Envoie des données de la commande vers l'API
    function sendOrderData() {
        fetch('http://127.0.0.1:3000/api/products/order', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userOrderObj)
        })
            .then(res => res.json())
            .then((res) => window.location.href = "/front/html/confirmation.html?orderId=" + res.orderId)
            .catch(err => console.error(err))
    }
})


