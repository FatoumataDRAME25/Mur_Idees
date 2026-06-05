const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Suggestion de la categorie par l'IA
export async function suggegerCategorie() {

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

