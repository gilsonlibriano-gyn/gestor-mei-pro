
from flask import Flask, send_from_directory, Response
import os

app = Flask(__name__, static_folder='.')

# Mapeamento de tipos MIME para garantir que o navegador entenda os arquivos
MIME_TYPES = {
    '.tsx': 'application/javascript',
    '.ts': 'application/javascript',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    # Obtém a extensão do arquivo
    _, ext = os.path.splitext(path)
    
    # Busca o arquivo no diretório atual
    try:
        response = send_from_directory('.', path)
        # Força o tipo MIME se estiver no nosso mapeamento
        if ext in MIME_TYPES:
            response.headers['Content-Type'] = MIME_TYPES[ext]
        return response
    except:
        # Se o arquivo não existir, retorna o index.html (comportamento SPA)
        return send_from_directory('.', 'index.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
