import os
import openai
from typing import Generator
from dotenv import load_dotenv
from flask import Flask, render_template, request, Response

load_dotenv()

openai.api_key = os.getenv("ICIVOTREAPI_KEY")


app = Flask(__name__)

@app.route("/")
def home():
    return render_template("index.html")

@app.route('/prompt', methods=['POST'])
def prompt():
    messages = request.json['messages']
    conversation = build_conversation_dict(messages=messages)
    
    event_stream(conversation)
    return Response(event_stream(conversation), mimetype='text/event-stream')

def build_conversation_dict(messages: list) -> list[dict]:
    return [
        {"role": "user" if i % 2 == 0 else "assistant", "content": message}
        for i, message in enumerate(messages)
    ]


def event_stream(conversation: list[dict]) -> Generator[str, None, None]:
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=conversation,
        stream=True
    )
    
    for line in response:
        # Je vérifie si 'choices' et 'delta' existent dans la ligne
        if 'choices' in line and line['choices']:
            text = line['choices'][0].get('delta', {}).get('content', '')  # Utilisez .get pour éviter une KeyError
            if text:  # Si le texte n'est pas vide
                yield text







if __name__ == "__main__":
    app.run(debug=True, host='127.0.0.1', port=5000)

conversation = build_conversation_dict(messages=["Bonjour,Comment ça va?", "test"])
