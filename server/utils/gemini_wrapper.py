import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-pro")

def stream_project(prompt):
    return model.generate_content_stream(
        prompt,
        generation_config={
            "temperature": 0.7,
            "top_p": 1,
            "top_k": 32,
            "max_output_tokens": 2048
        }
    )
