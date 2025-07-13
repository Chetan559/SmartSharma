import os
import google.generativeai as genai
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")

# ---------- Shared safety / gen‑config ---------- #
SAFETY_SETTINGS = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

GEN_CFG = dict(temperature=0.7, top_p=0.95, top_k=32, max_output_tokens=5000)

# ---------- Streaming helper (already used by /generate-stream) ---------- #
def stream_project(prompt: str):
    response = model.generate_content(
        prompt,
        generation_config=GEN_CFG,
        safety_settings=SAFETY_SETTINGS,
        stream=True,
    )
    for chunk in response:
        if getattr(chunk, "text", None):
            yield chunk


# ---------- NEW helpers -------------------------------------------------- #
def quick_classify(prompt: str):
    """
    Returns either 'react' or 'node' based on the prompt content.
    """
    classification_prompt = (
        "Return either node or react based on what do you think this project should be. "
        "Only return a single word either 'node' or 'react'. Do not return anything extra.\n\n"
        f"{prompt}"
    )

    try:
        response = model.generate_content(
            classification_prompt,
            generation_config={
                "temperature": 0.2,
                "max_output_tokens": 20,
            },
            safety_settings=SAFETY_SETTINGS
        )

        return response.text.strip().lower()

    except Exception as e:
        logger.error(f"[quick_classify] Error: {e}")
        raise



def chat(messages, system_prompt):
    """
    Calls Gemini chat with full prompt including system behavior instructions.
    Gemini does not support system_instruction keyword.
    So we prepend system_prompt manually.
    """
    try:
        # Convert messages into prompt parts
        user_prompts = "\n".join([m["content"] for m in messages if m["role"] == "user"])

        full_prompt = f"{system_prompt.strip()}\n\n{user_prompts.strip()}"

        generation_config = {
            "temperature": 0.7,
            "top_p": 0.95,
            "top_k": 32,
            "max_output_tokens": 5000,
        }

        response = model.generate_content(
            full_prompt,
            generation_config=generation_config,
            safety_settings=SAFETY_SETTINGS,
        )

        return response.text

    except Exception as e:
        logger.error(f"[chat] Error: {e}")
        raise

# ---------- Old helpers (for reference, not used in new app) ------------- #


# import os
# import google.generativeai as genai
# from dotenv import load_dotenv
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# # Load environment variables
# load_dotenv()

# # Configure Gemini API
# api_key = os.getenv("GOOGLE_API_KEY")
# if not api_key:
#     raise ValueError("GOOGLE_API_KEY environment variable is not set")

# genai.configure(api_key=api_key)

# # Initialize model
# model = genai.GenerativeModel("gemini-2.0-flash")

# # Common safety settings (BLOCK_NONE = allow all content)
# safety_settings = [
#     {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
#     {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
#     {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
#     {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
# ]


# def stream_project(prompt, **kwargs):
#     """
#     Stream content from Gemini API (stream=True)

#     Args:
#         prompt (str): The input prompt
#         **kwargs: Optional generation config overrides

#     Yields:
#         Chunks of text (one at a time)
#     """
#     default_config = {
#         "temperature": 0.7,
#         "top_p": 0.95,
#         "top_k": 32,
#         "max_output_tokens": 10000,
#     }

#     generation_config = {**default_config, **kwargs}

#     try:
#         logger.info(f"Streaming with config: {generation_config}")

#         response = model.generate_content(
#             prompt,
#             generation_config=generation_config,
#             safety_settings=safety_settings,
#             stream=True,
#         )

#         for chunk in response:
#             if hasattr(chunk, "text") and chunk.text:
#                 yield chunk
#             elif hasattr(chunk, "parts"):
#                 for part in chunk.parts:
#                     if hasattr(part, "text") and part.text:
#                         # print(f"Yielding part: {part.text}")
#                         yield type("ChunkWrapper", (), {"text": part.text})()

#     except Exception as e:
#         logger.error(f"[stream_project] Error: {e}")
#         raise


# def generate_complete_response(prompt, **kwargs):
#     """
#     Generate a full, non-streaming Gemini response.

#     Args:
#         prompt (str): The input prompt
#         **kwargs: Optional generation config overrides

#     Returns:
#         str: The full generated output
#     """
#     default_config = {
#         "temperature": 0.7,
#         "top_p": 0.95,
#         "top_k": 32,
#         "max_output_tokens": 10000,
#     }

#     generation_config = {**default_config, **kwargs}

#     try:
#         logger.info(f"Generating full response with config: {generation_config}")

#         response = model.generate_content(
#             prompt,
#             generation_config=generation_config,
#             safety_settings=safety_settings,
#         )

#         return response.text

#     except Exception as e:
#         logger.error(f"[generate_complete_response] Error: {e}")
#         raise
