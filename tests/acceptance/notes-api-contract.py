#!/usr/bin/env python3
"""Exercise the actual loopback notes server with a synthetic Notion client."""
from __future__ import annotations

import http.client
import importlib
import json
import os
import sys
import threading
import uuid
from pathlib import Path
from urllib.parse import urlencode

ROOT = Path(__file__).resolve().parents[2]
SERVER_ROOT = ROOT / "server"
if str(SERVER_ROOT) not in sys.path:
    sys.path.insert(0, str(SERVER_ROOT))

notes_server = importlib.import_module("notes_server")
notion_service = importlib.import_module("notion_service")

SOURCE_ID = str(uuid.uuid4())


class FakeNotion:
    def __init__(self) -> None:
        self.calls: list[dict[str, object]] = []

    def request(self, method, path, body=None):
        self.calls.append({"method": method, "path": path, "body": body})
        if method == "GET" and path == "/data_sources/" + SOURCE_ID:
            return {
                "properties": {
                    "Name": {"type": "title", "title": {}},
                    "Category": {
                        "type": "select",
                        "select": {
                            "options": [
                                {"name": "Synthetic"},
                                {"name": "Other"},
                            ]
                        },
                    },
                }
            }
        if method == "POST" and path == "/data_sources/" + SOURCE_ID + "/query":
            return {"results": [], "has_more": False}
        raise notion_service.NotesError("unexpected synthetic Notion call")


def one_request(
    port: int,
    method: str,
    path: str,
    *,
    body: bytes | None = None,
    headers: dict[str, str] | None = None,
) -> tuple[int, dict[str, str], object]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    selected = dict(headers or {})
    try:
        connection.request(method, path, body=body, headers=selected)
        response = connection.getresponse()
        raw = response.read(2 * 1024 * 1024)
        response_headers = {key.casefold(): value for key, value in response.getheaders()}
        try:
            parsed = json.loads(raw.decode("utf-8"))
        except (UnicodeError, ValueError):
            parsed = raw.decode("utf-8", errors="replace")
        return response.status, response_headers, parsed
    finally:
        connection.close()


def main() -> int:
    artifact = Path(
        os.environ.get(
            "LADS_ARTIFACT_DIR",
            ROOT / ".lads-artifacts" / ("notes-api-" + str(uuid.uuid4())),
        )
    ).resolve()
    artifact.mkdir(parents=True, exist_ok=True)
    checks: list[dict[str, str]] = []
    fake = FakeNotion()
    service = notion_service.NotesService(
        env={
            "NOTION_TOKEN": "synthetic-not-a-real-token",
            "NOTION_DATA_SOURCE_ID": SOURCE_ID,
            "LOCALAPPDATA": str(artifact / "localappdata"),
        },
        client=fake,
        ledger_path=artifact / "operations.sqlite3",
    )
    server = notes_server.Server(("127.0.0.1", 0), service)
    thread = threading.Thread(target=server.serve_forever, name="notes-api-contract", daemon=True)
    thread.start()
    port = server.server_address[1]
    host = f"127.0.0.1:{port}"
    origin = f"http://{host}"
    try:
        status, headers, payload = one_request(
            port,
            "GET",
            "/api/notes/status",
            headers={"Host": host, "Origin": origin},
        )
        session = payload.get("session") if isinstance(payload, dict) else None
        checks.append(
            {
                "id": "notes-api-status",
                "status": (
                    "PASS"
                    if status == 200
                    and headers.get("x-lifeos-notes-bridge") == "local-v1"
                    and payload.get("configured") is True
                    and payload.get("connected") is False
                    and isinstance(session, str)
                    and len(session) >= 20
                    else "FAIL"
                ),
                "evidence": f"status={status} bridge={headers.get('x-lifeos-notes-bridge')} configured={payload.get('configured') if isinstance(payload, dict) else None}",
            }
        )
        connect_body = b"{}"
        connect_headers = {
            "Host": host,
            "Origin": origin,
            "Content-Type": "application/json",
            "X-LifeOS-Request": str(session),
        }
        status, _headers, payload = one_request(
            port,
            "POST",
            "/api/notes/connect",
            body=connect_body,
            headers=connect_headers,
        )
        checks.append(
            {
                "id": "notes-api-connect",
                "status": (
                    "PASS"
                    if status == 200
                    and payload.get("connected") is True
                    and payload.get("categories") == ["Synthetic", "Other"]
                    and fake.calls
                    and fake.calls[0]["path"] == "/data_sources/" + SOURCE_ID
                    else "FAIL"
                ),
                "evidence": f"status={status} connected={payload.get('connected') if isinstance(payload, dict) else None} calls={len(fake.calls)}",
            }
        )
        status, _headers, payload = one_request(
            port,
            "GET",
            "/api/notes/list?" + urlencode({"cursor": "x" * 201}),
            headers={"Host": host, "Origin": origin},
        )
        checks.append(
            {
                "id": "notes-api-invalid-parameters",
                "status": "PASS" if status == 400 and payload.get("code") == "invalid" else "FAIL",
                "evidence": f"oversized cursor status={status}",
            }
        )
        status, _headers, payload = one_request(
            port,
            "POST",
            "/api/notes/connect",
            body=b"{",
            headers={**connect_headers, "Content-Length": "1"},
        )
        checks.append(
            {
                "id": "notes-api-invalid-body",
                "status": "PASS" if status == 400 and payload.get("code") == "invalid" else "FAIL",
                "evidence": f"malformed JSON status={status}",
            }
        )
        status, _headers, payload = one_request(
            port,
            "HEAD",
            "/api/notes/status",
            headers={"Host": host, "Origin": origin},
        )
        checks.append(
            {
                "id": "notes-api-method-boundary",
                "status": "PASS" if status == 405 else "FAIL",
                "evidence": f"HEAD status={status}",
            }
        )
        status, _headers, payload = one_request(
            port,
            "GET",
            "/api/notes/status",
            headers={"Host": host, "Origin": "https://untrusted.invalid"},
        )
        checks.append(
            {
                "id": "notes-api-origin-boundary",
                "status": "PASS" if status == 403 and payload.get("code") == "origin" else "FAIL",
                "evidence": f"cross-origin status={status}",
            }
        )
        status, _headers, payload = one_request(
            port,
            "POST",
            "/api/notes/connect",
            body=b"{}",
            headers={**connect_headers, "X-LifeOS-Request": "wrong"},
        )
        checks.append(
            {
                "id": "notes-api-local-session-boundary",
                "status": "PASS" if status == 403 and payload.get("code") == "session" else "FAIL",
                "evidence": f"missing local write session status={status}",
            }
        )
        checks.append(
            {
                "id": "notes-product-authentication",
                "status": "NOT_IMPLEMENTED",
                "evidence": "The loopback bridge has local-origin/CSRF checks but no product account authentication.",
            }
        )
        passed = all(
            item["status"] in {"PASS", "NOT_IMPLEMENTED"}
            for item in checks
        ) and all(
            item["status"] == "PASS"
            for item in checks
            if item["id"] != "notes-product-authentication"
        )
        output = {
            "checks": checks,
            "status": "PASS" if passed else "FAIL",
            "synthetic_only": True,
            "remote_request": False,
        }
    except Exception as exc:
        output = {
            "checks": checks
            + [
                {
                    "id": "notes-api-contract",
                    "status": "FAIL",
                    "evidence": type(exc).__name__ + ": " + str(exc)[:500],
                }
            ],
            "status": "FAIL",
            "synthetic_only": True,
            "remote_request": False,
        }
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=10)
    if output["status"] == "PASS" and all(item["status"] in {"PASS", "NOT_IMPLEMENTED"} for item in checks):
        output.setdefault("checks", []).append(
            {
                "id": "notes-api-contract",
                "status": "PASS",
                "evidence": "Actual notes_server routes passed with injected FakeNotion and a private synthetic ledger.",
            }
        )
    print(json.dumps(output, ensure_ascii=True, sort_keys=True))
    return 0 if output["status"] == "PASS" else 1


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    raise SystemExit(main())
