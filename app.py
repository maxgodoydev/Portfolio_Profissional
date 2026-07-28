from __future__ import annotations

import json
import mimetypes
import os
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent

class PortfolioHandler(SimpleHTTPRequestHandler):
    server_version = "MaxPortfolio/2.0"

    def log_message(self, format: str, *args: object) -> None:
        print(f"[{self.log_date_time_string()}] {format % args}")

    def _send_bytes(self, body: bytes, content_type: str, status: HTTPStatus = HTTPStatus.OK) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "public, max-age=300")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path: Path) -> None:
        if not path.exists() or not path.is_file():
            self.send_error(HTTPStatus.NOT_FOUND, "Arquivo não encontrado")
            return
        content_type = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        self._send_bytes(path.read_bytes(), content_type)

    def do_GET(self) -> None:  # noqa: N802
        path = unquote(urlparse(self.path).path)
        if path in {"/", "/index.html"}:
            self._send_file(ROOT / "index.html")
            return
        if path == "/health":
            self._send_bytes(json.dumps({"status": "ok"}).encode(), "application/json; charset=utf-8")
            return
        candidate = (ROOT / path.lstrip("/")).resolve()
        try:
            candidate.relative_to(ROOT.resolve())
        except ValueError:
            self.send_error(HTTPStatus.FORBIDDEN, "Caminho inválido")
            return
        self._send_file(candidate)

def run() -> None:
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    server = ThreadingHTTPServer((host, port), PortfolioHandler)
    print(f"Portfólio disponível em http://{host}:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor encerrado.")
    finally:
        server.server_close()

if __name__ == "__main__":
    run()
