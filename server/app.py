from flask import Flask, request, Response
from flask_cors import CORS
from utils.gemini_wrapper import stream_project

app = Flask(__name__)
CORS(app)

@app.route("/generate-stream", methods=["POST"])
def generate_stream():
    data = request.json
    prompt = data.get("prompt")

    if not prompt:
        return {"error": "Prompt is required"}, 400

    def generate():
        try:
            for chunk in stream_project(prompt):
                if chunk.text:
                    yield f"data: {chunk.text}\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return Response(generate(), content_type="text/event-stream")

if __name__ == "__main__":
    app.run(debug=True, threaded=True)
