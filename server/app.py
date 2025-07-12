from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json, logging

from constants import WORK_DIR
from prompts import BASE_PROMPT, get_system_prompt
from default.node import base_prompt as node_base_prompt
from default.react import base_prompt as react_base_prompt
from utils.gemini_wrapper import quick_classify, chat, stream_project

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
app.config["JSON_SORT_KEYS"] = False  # keep order

# --------------------------------------------------------------------------- #
@app.get("/test")
def test():
    return jsonify(message="API is working!")

# --------------------------------------------------------------------------- #
@app.post("/template")
def template():
    data = request.get_json(force=True)
    prompt: str = data.get("prompt", "")

    kind = quick_classify(prompt)
    logger.info("Template classify -> %s", kind)

    if kind == "react":
        return jsonify(
            prompts=[
                BASE_PROMPT,
                (
                    "Here is an artifact that contains all files of the project visible "
                    "to you.\nConsider the contents of ALL files in the project.\n\n"
                    f"{react_base_prompt}\n\n"
                    "Here is a list of files that exist on the file system but are not "
                    "being shown to you:\n\n  - .gitignore\n  - package-lock.json\n"
                ),
            ],
            uiPrompts=[react_base_prompt],
        )

    if kind == "node":
        return jsonify(
            prompts=[
                (
                    "Here is an artifact that contains all files of the project visible "
                    "to you.\nConsider the contents of ALL files in the project.\n\n"
                    f"{node_base_prompt}\n\n"
                    "Here is a list of files that exist on the file system but are not "
                    "being shown to you:\n\n  - .gitignore\n  - package-lock.json\n"
                )
            ],
            uiPrompts=[node_base_prompt],
        )

    return jsonify(message="Unable to classify prompt"), 403

# --------------------------------------------------------------------------- #
@app.post("/chat")
def chat_endpoint():
    data = request.get_json(force=True)
    messages = data.get("messages", [])
    reply = chat(messages, get_system_prompt(WORK_DIR))
    return jsonify(response=reply)

# --------------------------------------------------------------------------- #
# (Existing streamed generation endpoint retained)
@app.post("/generate-stream")
def generate_stream():
    data = request.get_json(force=True)
    prompt = data.get("prompt", "")

    def gen():
        chunk_id = 0
        try:
            for chunk in stream_project(prompt):
                chunk_id += 1
                payload = {"text": chunk.text, "chunk_id": chunk_id, "type": "content"}
                yield f"data: {json.dumps(payload)}\n\n"
            yield f"data: {json.dumps({'type': 'complete', 'total_chunks': chunk_id})}\n\n"
        except Exception as exc:
            logger.exception("Streaming error")
            yield f"data: {json.dumps({'error': str(exc), 'type': 'error'})}\n\n"

    return Response(gen(), content_type="text/event-stream")

# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    app.run(debug=True, threaded=True, port=5000)
