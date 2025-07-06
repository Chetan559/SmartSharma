from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/hello', methods=['GET'])
def hello():
    name = request.args.get('name', 'World')
    return jsonify(message=f'Hello, {name}!')

if __name__ == '__main__':
    app.run()