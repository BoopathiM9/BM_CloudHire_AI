"""
Local API Gateway Bridge for AI Resume Matcher
Bridges Frontend HTTP requests (port 5000) directly to our two AWS Lambda handlers:
- Lambda 1: ResumeProcessingLambda (/jobs, /resumes, /candidates)
- Lambda 2: CandidateRankingLambda (/ranking, /assignments)
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.parse
import os
import sys

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from lambdas.resume_processing.handler import lambda_handler as resume_processing_handler
from lambdas.candidate_ranking.handler import lambda_handler as candidate_ranking_handler

PORT = 5000

class ApiGatewayBridgeHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        self._dispatch("GET")

    def do_POST(self):
        self._dispatch("POST")

    def do_PUT(self):
        self._dispatch("PUT")

    def do_DELETE(self):
        self._dispatch("DELETE")

    def _dispatch(self, method: str):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = dict(urllib.parse.parse_qsl(parsed_url.query))

        # Read request body if present
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length) if content_length > 0 else b""
        body_str = body_bytes.decode("utf-8") if body_bytes else None

        # Build Lambda proxy event
        event = {
            "httpMethod": method,
            "path": path,
            "rawPath": path,
            "queryStringParameters": query_params if query_params else None,
            "headers": dict(self.headers),
            "body": body_str
        }

        # If visiting root URL directly in browser, show helpful link to frontend
        if method == "GET" and (path == "/" or path == ""):
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.end_headers()
            html_content = """<!DOCTYPE html>
<html>
<head>
  <title>BM CloudHire AI — Backend API Gateway</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b1329; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 14px; padding: 2.5rem; max-width: 500px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.4); }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; color: #ffffff; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
    .badge { display: inline-block; background: #065f46; color: #a7f3d0; font-weight: 700; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 9999px; margin-bottom: 1rem; }
    .btn { display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 0.95rem; padding: 0.75rem 1.5rem; border-radius: 8px; transition: background 0.2s; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">● Backend Services Connected</div>
    <h1>BM CloudHire AI — API Gateway</h1>
    <p>This port (<strong>5000</strong>) is the serverless API Gateway bridge. The web platform interface is running on port <strong>5173</strong>.</p>
    <a href="http://127.0.0.1:5173" class="btn">Open Web Application (Port 5173) &rarr;</a>
  </div>
</body>
</html>"""
            self.wfile.write(html_content.encode("utf-8"))
            return

        # Route to appropriate Lambda function
        try:
            if path.startswith("/ranking") or path.startswith("/assignments"):
                response = candidate_ranking_handler(event, None)
            else:
                response = resume_processing_handler(event, None)

            status_code = response.get("statusCode", 200)
            headers = response.get("headers", {})
            body = response.get("body", "{}")

            self.send_response(status_code)
            self._send_cors_headers()
            for k, v in headers.items():
                if k.lower() != "access-control-allow-origin":
                    self.send_header(k, v)
            self.end_headers()
            self.wfile.write(body.encode("utf-8"))

        except Exception as e:
            self.send_response(500)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            err_payload = json.dumps({"error": f"API Gateway Bridge Error: {str(e)}"})
            self.wfile.write(err_payload.encode("utf-8"))

def run_server(port=PORT):
    server_address = ("127.0.0.1", port)
    httpd = HTTPServer(server_address, ApiGatewayBridgeHandler)
    print(f"\n=======================================================")
    print(f"API Gateway Bridge running on http://127.0.0.1:{port}")
    print(f"Routing to ResumeProcessingLambda & CandidateRankingLambda")
    print(f"Connected to DynamoDB table 'ResumeMatcherTable' and S3 bucket")
    print(f"=======================================================\n")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()
