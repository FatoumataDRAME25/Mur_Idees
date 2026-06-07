

export function afficherErreur(element,message) {
    const small = element.nextElementSibling
    if(small){
        small.textContent = message
    }

    element.classList.add('is-invalid')
    element.classList.remove('is-valid')    
}


export function afficherSuccess(element) {
    const small = element.nextElementSibling
    if(small){
        small.textContent = ""
    }

    element.classList.add('is-valid')
    element.classList.remove('is-invalid')
}


export function validerTitre(inputtitre) {
    const titre = inputtitre.value.trim()
    if(titre === "") {
        afficherErreur(inputtitre, "Ce champ est obligatoire")
        return false
    }

    else if(titre.length < 3) {
        afficherErreur(inputtitre, "Ce champ doit contenir au minimun 3 caractères")
        return false
    }

    else if(!titre.match(/^[A-Za-z]/)) {
        afficherErreur(inputtitre, "Le titre doit obligatoirement commencé par une lettre")
        return false
    }

    else {
        afficherSuccess(inputtitre)
        return true
    }

}


export function validerDescription(input) {
    const description = input.value.trim()
    if(description === "") {
        afficherErreur(input, "Ce champ est obligatoire")
        return false
    }

    else if(description.length < 10) {
        afficherErreur(input, "Ce champ doit contenir au minimun 25 caractères")
        return false
    }

    else if(!description.match(/^[A-Za-zÀ-ÿ]/)) {
        afficherErreur(input, "Le titre doit obligatoirement commencé par une lettre")
        return false
    }

    else if(description.lenght > 300) {
        afficherErreur(input, "Ce champ doit contenir au maximun 600 caractères")
        return false
    }

    else {
        afficherSuccess(input)
        return true
    }

}