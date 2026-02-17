
from flask import Flask, send_from_directory
import webbrowser
from threading import Timer
import os

app = Flask(__name__)

# Rota para servir o arquivo principal
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# Rota para servir arquivos estáticos (JS, JSON, manifest, etc)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

def open_browser():
    webbrowser.open_new("http://127.0.0.1:5000")

if __name__ == '__main__':
    print("========================================")
    print("      GESTOR MEI PRO v4.0 - SISTEMA     ")
    print("========================================")
    print("Iniciando servidor local Python...")
    print("Acesso: http://127.0.0.1:5000")
    
    # Abre o navegador automaticamente após 1.5 segundos
    Timer(1.5, open_browser).start()
    
    # Roda o Flask
    app.run(host='127.0.0.1', port=5000, debug=False)
