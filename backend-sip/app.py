from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/', methods=['POST'])
@app.route('/api/calculate', methods=['POST'])
@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json(force=True)
    if not data:
        return jsonify({'error': 'Invalid payload'}), 400

    investment = float(data.get('investment', 0))
    rate = float(data.get('rate', 0)) / 100 / 12
    months = int(data.get('years', 0)) * 12

    if rate == 0 or months == 0:
        invested = investment * months
        return jsonify({'invested': round(invested, 2), 'returns': 0, 'total': round(invested, 2)})

    fv = investment * (((1 + rate) ** months - 1) / rate) * (1 + rate)
    invested = investment * months
    returns = fv - invested
    return jsonify({'invested': round(invested, 2), 'returns': round(returns, 2), 'total': round(fv, 2)})

@app.route('/health', methods=['GET'])
def health():
    return 'OK', 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
