from flask import Flask, request, jsonify
from core.optimizer import generate_optimization

app = Flask(__name__)
@app.route('/optimize', methods=['POST'])
def optimize():
    data = request.json
    resultado = generate_optimization(data)
    return jsonify(resultado)

if __name__ == '__main__':
    app.run(port=5002, debug=True)
