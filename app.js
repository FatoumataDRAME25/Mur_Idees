
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

const form = document.getElementById('formulaire');
const idee = document.getElementById('count-idee');
const titreInput = document.getElementById('titre');
const categorieInput = document.getElementById('categorie');
const descriptionInput = document.getElementById('description');
const recherche = document.getElementById('input-recherche');
const filtrecategorie = document.getElementById('filtrer-categorie');
const conteneuridee = document.getElementById('conteneur-idee');

let listeidees =[];
let modifierId


form.addEventListener('submit', (e) =>{
    e.preventDefault()
    const titre = titreInput.value;
    const categorie = categorieInput.value;
    const description = descriptionInput.value;
    //document.getElementById('btn-submit').textContent = "Soumettre l'idée";

    if(titre==="" || categorie==="" || description===""){
        alert("Tous les champs sont obligatoires")
    }

    //Modification de l'idee
    if (modifierId) {
        listeidees = listeidees.map(idee => {
            if (idee.id === modifierId) {
                return {...idee, titre, categorie, description}
            }
            return idee;
        });
        modifierId = null
    }

    // ajout d'idee
    else{
        const idees = {
            'id': Date.now(),
            titre,
            categorie,
            description,
            date: new Date().toLocaleString('fr-fr')
        }
        listeidees.push(idees)
        
    }
    console.log(listeidees);
    sauvegarderidees();
    afficheridees()
    affichernombreidees()
    form.reset()
})
// Declenchement des evenements





function sauvegarderidees(){
    localStorage.setItem('listeidees', JSON.stringify(listeidees))
}

function chargeridees() {
    const donnees = localStorage.getItem('listeidees')
    if(donnees){
        listeidees= JSON.parse(donnees)
    }
    afficheridees()
    affichernombreidees()
}

window.addEventListener('DOMContentLoaded',
    chargeridees
)

// afficher la couleur de la categorie et bordure 
function stylecategorie(categorie) {
    switch (categorie) {

        case "Pédagogie":
            return {
                border: "border-primary",
                badge: "bg-primary text-white"
            };

        case "Événement":
            return {
                border: "border-info",
                badge: "bg-info text-white"
            };

        case "Vie de campus":
            return {
                border: "border-success",
                badge: "bg-success text-white"
            };

        case "Amélioration technique":
            return {
                border: "border-warning",
                badge: "bg-warning text-white"
            };

        default:
            return {
                border: "border-secondary",
                badge: "bg-secondary text-white"
            };
    }
}


function afficheridees(donne = listeidees) {

    let compteur = donne.length;
    if(compteur === 0) {
        conteneuridee.innerHTML = `
            <p>Aucune idee n'a ete soumise</p>
        `
        return;
    }
    conteneuridee.innerHTML = "";

    donne.forEach(idee => {
        const style = stylecategorie(idee.categorie)

        conteneuridee.innerHTML += `
            
                <div class="col-md-6">
                    <div class="bg-white border rounded-4 shadow-sm p-4 ${style.border}">
                        <div class="mb-3 d-flex justify-content-between">
                            <strong class="${style.badge} p-2 rounded-5">${idee.categorie}</strong>
                            <small>${idee.date}</small>
                        </div>

                        <h2 class="mb-3">${idee.titre}</h2>
                        <p>${idee.description}</p>

                        <div class="mt-5 d-flex justify-content-between">
                            <button onclick="supprimer(${idee.id})"class="border border-danger rounded-3 bg-white py-1 px-2">Supprimer</button>

                            <button onclick="recupererdonneesmodifier(${idee.id})"class="border border-primary rounded-3 bg-white py-1 px-3">Modifier</button>
                        </div>
                    </div>
                </div>

        `
    });
   
}


function affichernombreidees() {
    const total = listeidees.length;
    idee.textContent = `${total} ${total >1 ? "Idées": "Idée"}`;
}


function recupererdonneesmodifier(id) {
    const donnee = listeidees.find(donnee => donnee.id===id)
    titreInput.value = donnee.titre;
    categorieInput.value = donnee.categorie;
    descriptionInput.value = donnee.description;

    modifierId = id
    document.getElementById('btn-submit').textContent = "Modifier l'idee"
}

function supprimer(id){
    const confirmer = confirm("Etes-vous sur de supprimer cette idee ?")

    if(!confirmer) {
        return;
    }
    listeidees = listeidees.filter(idee => idee.id !==id)

    sauvegarderidees();
    afficheridees();
    affichernombreidees();
}


const ideefiltrer = () => {
    const valeurRechercher = recherche.value.toLowerCase();
    const filtreCategorie = filtrecategorie.value;
    console.log(filtreCategorie);
    

    // filtrage 
    const filtres = listeidees.filter(idee => {
        const rechercheCombines = idee.titre.toLowerCase().includes(valeurRechercher) || idee.description.toLowerCase().includes(valeurRechercher);

        const filtreParCategorie = filtreCategorie === "Toutes" || idee.categorie === filtreCategorie;

        //  les deux combinees
        return rechercheCombines && filtreParCategorie
    });
    afficheridees(filtres);
    affichernombreidees();
}

recherche.addEventListener('input', ideefiltrer);
filtrecategorie.addEventListener('change', ideefiltrer);


// Suggestion de la categorie par l'IA
async function suggegerCategorie() {

    const titre = document.getElementById("titre").value;
    const description = document.getElementById("description").value;

    const prompt = `
        Tu es un classificateur d'idées.

        Catégories :

        - Pédagogie
        - Événement
        - Vie de campus
        - Amélioration technique

        Réponds uniquement avec une catégorie.

        Titre : ${titre}

        Description : ${description}
    `;

    const reponse = await fetch("https://openrouter.ai/api/v1/chat/completions", 
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "model": "nvidia/nemotron-3-super-120b-a12b:free",
                "messages" :[
                    {
                        "role": "user",
                        "content": prompt
                    }
                    
                ]
            })
        }
    );

    

    const data = await reponse.json();
    console.log(data);
    
    if(data.error) {
        console.error("Erreur OpenRouter: ", data.error.message);
        return
        
    }
    const categorie = data.choices[0].message.content;

    console.log("Catégorie suggérée :",categorie);

    document.getElementById("categorie").value = categorie;
    
    
}


document
    .getElementById("description")
    .addEventListener("blur", suggegerCategorie);


window.recupererdonneesmodifier = recupererdonneesmodifier
window.supprimer = supprimer