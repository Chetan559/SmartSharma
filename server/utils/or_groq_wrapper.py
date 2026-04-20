import os
import json
import logging
import time
from typing import Iterable, List, Dict
from openai import OpenAI
from dotenv import load_dotenv

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# --------------------------------------------------------------------------- #
# Configuration & Clients
# --------------------------------------------------------------------------- #

# Groq: Ultra-fast for lightweight classification
groq_client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

# OpenRouter: For full context-aware code generation
openrouter_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Models
GROQ_MODEL = "llama-3.1-8b-instant"         # Sub-second classification

# Verified FREE models from live OpenRouter API query (2026-04-20).
# Priority order: try each in sequence if the previous fails.
OR_MODELS = [
    "openai/gpt-oss-120b:free",              # 128k context, GPT-class
    "qwen/qwen3-coder:free",                 # coding-focused, large
    "nvidia/nemotron-3-super-120b-a12b:free",# 128k context, powerful
    "google/gemma-4-31b-it:free",            # strong reasoning
    "meta-llama/llama-3.3-70b-instruct:free",# 128k context, reliable
    "nousresearch/hermes-3-llama-3.1-405b:free",  # huge model
    "arcee-ai/trinity-large-preview:free",   # 128k context
    "openrouter/free",                       # auto-routes to any free model
]

# --------------------------------------------------------------------------- #
# Retry helper
# --------------------------------------------------------------------------- #

def _with_retry(fn, max_retries: int = 3, base_delay: float = 1.5):
    """
    Calls fn() with exponential backoff on transient errors.
    Raises the last exception if all retries are exhausted.
    """
    last_exc = None
    for attempt in range(max_retries):
        try:
            return fn()
        except Exception as exc:
            last_exc = exc
            wait = base_delay * (2 ** attempt)
            logger.warning(f"Attempt {attempt + 1} failed: {exc}. Retrying in {wait:.1f}s...")
            time.sleep(wait)
    raise last_exc


# --------------------------------------------------------------------------- #
# Model fallback helper for OpenRouter
# --------------------------------------------------------------------------- #

def _or_chat_create(messages: List[Dict[str, str]], stream: bool = False, max_tokens: int = 16384):
    """
    Attempts each OR_MODEL in sequence until one succeeds.
    Returns the raw OpenRouter response (or generator if stream=True).
    """
    last_exc = None
    for model in OR_MODELS:
        try:
            logger.info(f"Trying OpenRouter model: {model}")
            response = openrouter_client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=max_tokens,
                stream=stream,
                extra_headers={
                    "HTTP-Referer": "http://localhost:5000",
                    "X-Title": "SmartSharma AI",
                }
            )
            return response
        except Exception as exc:
            logger.warning(f"Model {model} failed: {exc}")
            last_exc = exc
            time.sleep(1.0)   # brief pause before trying next model

    raise last_exc


# --------------------------------------------------------------------------- #
# Public API  (same signatures as the old gemini_wrapper – drop-in compatible)
# --------------------------------------------------------------------------- #

def quick_classify(prompt: str) -> str:
    """
    Uses Groq (llama-3.1-8b-instant) for sub-second classification.
    Returns 'react' or 'node'.
    """
    def _call():
        response = groq_client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict classifier. "
                        "Respond with exactly ONE word — either 'node' or 'react' — "
                        "and nothing else."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=10,
        )
        return response.choices[0].message.content.strip().lower()

    try:
        logger.info(f"Classifying prompt with Groq ({GROQ_MODEL})...")
        kind = _with_retry(_call)
        if "react" in kind:
            return "react"
        if "node" in kind:
            return "node"
        return "react"   # safe default
    except Exception as exc:
        logger.error(f"[quick_classify] All retries failed: {exc}")
        return "react"


def stream_project(prompt: str) -> Iterable:
    """
    Streams a full project generation response from OpenRouter.
    Injects the system context so the model behaves like the Bolt assistant.
    Yields objects with a .text attribute (Gemini-compatible interface).
    """
    messages = [
        {
            "role": "user",
            "content": prompt,
        }
    ]

    try:
        logger.info("Streaming project via OpenRouter...")
        response = _with_retry(
            lambda: _or_chat_create(messages, stream=True, max_tokens=16384),
            max_retries=2,
        )

        for chunk in response:
            # Guard against empty/None delta content
            if not chunk.choices:
                continue
            content = chunk.choices[0].delta.content
            if content:
                # Wrap in a thin object to mimic Gemini's chunk.text interface
                yield type("Chunk", (), {"text": content})()

    except Exception as exc:
        logger.error(f"[stream_project] Fatal error: {exc}")
        raise


def chat(messages: List[Dict[str, str]], system_prompt: str) -> str:
    """
    Non-streaming chat that maintains full message history.
    The system_prompt is sent as the first system message, followed by the
    complete conversation history — exactly matching the Gemini wrapper's
    behaviour.
    """
    # Build the OpenAI-style message list with the system prompt prepended
    formatted: List[Dict[str, str]] = [{"role": "system", "content": system_prompt}]
    formatted.extend(messages)

    try:
        logger.info("Sending chat request to OpenRouter...")
        response = _with_retry(
            lambda: _or_chat_create(formatted, stream=False, max_tokens=16384),
        )
        return response.choices[0].message.content

    except Exception as exc:
        logger.error(f"[chat] All retries failed: {exc}")
        return "I'm sorry, I encountered an error processing that request."


# --------------------------------------------------------------------------- #
# Simple local smoke-test
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    test_prompt = "Create a simple dashboard in React with Tailwind"
    print(f"Classification: {quick_classify(test_prompt)}")
    print("\n--- Chat response ---")
    print(chat([{"role": "user", "content": test_prompt}], "You are a helpful assistant."))