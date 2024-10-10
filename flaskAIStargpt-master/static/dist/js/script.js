function cloneAnswerBlock() {
    const answerBlock = document.querySelector("#gpt-output");
    const template = document.querySelector('#answerBlock');
    const clone = template.cloneNode(true);
    clone.id = "";
    answerBlock.appendChild(clone);
    clone.classList.remove("hidden")
    return clone.querySelector(".message");
}

function addToLog(message) {
    const answerBlock = cloneAnswerBlock();
    answerBlock.innerText = message;
    return answerBlock;
}

function getChatHistory() {
    const messagesBlocks = document.querySelectorAll(".message:not(#chat-template .message)");
    return Array.from(messagesBlocks).map(block=> block.innerHTML)

    }

async function fetchPromptResponse() {
    const response = await fetch("/prompt", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({messages: getChatHistory()}),
    });

    return response.body.getReader();
}

async function readResponseChunks(reader, answerBlock) {
    const decoder = new TextDecoder();
    const converter = new showdown.Converter();
    let chunks = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            chunks += decoder.decode(value, { stream: true });
            answerBlock.innerHTML = converter.makeHtml(chunks);
        }
    } catch (error) {
        console.error("Erreur lors de la lecture des données :", error);
    } finally{
        spinnerIcon.classList.add("hidden");
        sendIcon.classList.remove("hidden");

    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#prompt-form");
    const spinnerIcon = document.querySelector("#spinner-icon");
    const sendIcon = document.querySelector("#send-icon");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Ici j'affiche le spinner et cache l'icône d'envoi
        spinnerIcon.classList.remove("hidden");
        sendIcon.classList.add("hidden");

        // Ici je récupére la valeur du prompt
        const prompt = form.elements['prompt'].value;  // Assurez-vous d'utiliser le bon nom d'input
        form.elements['prompt'].value = "";
        addToLog(prompt);

        try {
            // Je simule une requête asynchrone (remplacez ceci par votre logique d'API)
              // Remplace ceci par votre fonction d'envoi
            const answerBlock = addToLog("GPT est en train de réfléchir!");
            const reader = await fetchPromptResponse();
            await readResponseChunks(reader, answerBlock);


            // Ici, vous pouvez traiter la réponse, par exemple mettre à jour l'interface utilisateur
        } catch (error) {
        // Quand je change console.error par console.log ça marche mai j n'arrive pas à afficher la structure du projet.
            console.log("Erreur lors de l'envoi du prompt :", error);
        } finally {
            // Masquer le spinner et afficher l'icône d'envoi
            spinnerIcon.classList.add("hidden");
            sendIcon.classList.remove("hidden");
            hljs.highlightAll();
        }
    });
});



