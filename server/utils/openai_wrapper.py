import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def stream_openai_response(prompt):
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        temperature=0.7,
        messages=[
            {"role": "system", "content": "You're a helpful assistant that generates code projects from user instructions."},
            {"role": "user", "content": prompt}
        ],
        stream=True
    )
    return response
