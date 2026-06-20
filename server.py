import http.server
import socketserver
import json
import os
from urllib.parse import urlparse

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class MyHttpRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        parsed_path = urlparse(self.path)
        if parsed_path.path == '/api/check-safety':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                req_type = data.get('type', 'sms')
                content = data.get('content', '').lower()

                is_safe = True
                reason = "This appears safe based on our initial heuristic scan. No suspicious patterns detected."
                score = 98

                if req_type == 'sms':
                    suspicious_keywords = ['win', 'prize', 'urgent', 'click here', 'http://', 'https://', 'login', 'account suspended', 'verify']
                    for keyword in suspicious_keywords:
                        if keyword in content:
                            is_safe = False
                            reason = f"Suspicious pattern detected: The message contains '{keyword}', which is commonly used in phishing or scam campaigns."
                            score = 15
                            break
                elif req_type == 'app':
                    suspicious_keywords = ['free', 'hack', 'crack', 'mod', 'unlimited', 'premium unlocked']
                    for keyword in suspicious_keywords:
                        if keyword in content:
                            is_safe = False
                            reason = f"Suspicious app naming pattern: '{keyword}' is often associated with malware or pirated applications."
                            score = 25
                            break

                response = {
                    "is_safe": is_safe,
                    "score": score,
                    "reason": reason
                }

                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

Handler = MyHttpRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
