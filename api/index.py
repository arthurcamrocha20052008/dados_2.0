import sys
from pathlib import Path

# Adiciona a pasta backend ao path para que a Vercel execute o FastAPI diretamente
BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fast import app  # noqa: E402, F401
