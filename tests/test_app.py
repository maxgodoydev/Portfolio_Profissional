import json
import threading
import time
import unittest
from http.client import HTTPConnection

import app


class PortfolioServerTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = app.ThreadingHTTPServer(("127.0.0.1", 0), app.PortfolioHandler)
        cls.port = cls.server.server_address[1]
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        time.sleep(0.1)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def request(self, path):
        conn = HTTPConnection("127.0.0.1", self.port, timeout=5)
        conn.request("GET", path)
        response = conn.getresponse()
        content = response.read()
        headers = dict(response.getheaders())
        conn.close()
        return response.status, headers, content

    def test_home(self):
        status, headers, content = self.request("/")
        self.assertEqual(status, 200)
        self.assertIn("text/html", headers.get("Content-Type", ""))
        self.assertIn(b"Max Godoy", content)

    def test_profile_json(self):
        status, headers, content = self.request("/data/profile.json")
        self.assertEqual(status, 200)
        self.assertIn("application/json", headers.get("Content-Type", ""))
        payload = json.loads(content)
        self.assertEqual(payload["name"], "Max Godoy")
        self.assertGreaterEqual(len(payload["projects"]), 5)

    def test_health(self):
        status, _, content = self.request("/health")
        self.assertEqual(status, 200)
        self.assertEqual(json.loads(content)["status"], "ok")

    def test_cv(self):
        status, headers, content = self.request("/curriculo-max-godoy.pdf")
        self.assertEqual(status, 200)
        self.assertIn("application/pdf", headers.get("Content-Type", ""))
        self.assertTrue(content.startswith(b"%PDF"))


if __name__ == "__main__":
    unittest.main()
