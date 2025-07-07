from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import json
import logging
from utils.gemini_wrapper import stream_project

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route("/test", methods=["GET"])
def test():
    return jsonify({"message": "API is working!"})

@app.route("/generate-stream", methods=["POST"])
def generate_stream():
    try:
        data = request.get_json(force=True)  # Ensures JSON parsing
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        prompt = data.get("prompt")
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        def generate():
            chunk_count = 0
            try:
                for chunk in stream_project(prompt):
                    if hasattr(chunk, "text") and chunk.text:
                        chunk_count += 1
                        response_data = {
                            "text": chunk.text,
                            "chunk_id": chunk_count,
                            "type": "content"
                        }
                        yield f"data: {json.dumps(response_data)}\n\n"

                yield f"data: {json.dumps({'type': 'complete', 'total_chunks': chunk_count})}\n\n"

            except Exception as e:
                logger.error(f"Streaming error: {str(e)}")
                error_data = {
                    "error": str(e),
                    "type": "error"
                }
                yield f"data: {json.dumps(error_data)}\n\n"

        return Response(generate(), content_type="text/event-stream")

    except Exception as e:
        logger.error(f"Stream endpoint error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# Handle preflight CORS for /generate-stream
@app.route("/generate-stream", methods=["OPTIONS"])
def handle_options():
    response = Response()
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response

if __name__ == "__main__":
    app.run(debug=True, threaded=True, port=5000)
