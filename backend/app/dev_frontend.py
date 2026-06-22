from __future__ import annotations

import os
import shutil
import subprocess
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path


class FrontendDevServer:
    def __init__(self, enabled: bool, open_browser: bool, url: str) -> None:
        self.enabled = enabled
        self.open_browser = open_browser
        self.url = url
        self.process: subprocess.Popen[bytes] | None = None

    def start(self) -> None:
        if not self.enabled:
            return

        if self._is_frontend_running():
            self._open_browser_when_ready()
            return

        frontend_dir = Path(__file__).resolve().parents[2] / "frontend"
        package_json = frontend_dir / "package.json"
        npm = shutil.which("npm.cmd") or shutil.which("npm")

        if not package_json.exists():
            print(f"Frontend folder was not found at {frontend_dir}.")
            return
        if npm is None:
            print("npm was not found. Install Node.js, then run the backend again.")
            return

        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if os.name == "nt" else 0
        self.process = subprocess.Popen(
            [npm, "run", "dev"],
            cwd=frontend_dir,
            creationflags=creationflags,
        )
        self._open_browser_when_ready()

    def stop(self) -> None:
        if self.process is None or self.process.poll() is not None:
            return

        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/PID", str(self.process.pid), "/T", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                check=False,
            )
            return

        self.process.terminate()
        try:
            self.process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            self.process.kill()

    def _open_browser_when_ready(self) -> None:
        if not self.open_browser:
            return

        thread = threading.Thread(target=self._wait_and_open_browser, daemon=True)
        thread.start()

    def _wait_and_open_browser(self) -> None:
        for _ in range(60):
            if self._is_frontend_running():
                webbrowser.open(self.url)
                return
            time.sleep(0.5)

        print(f"Frontend did not become ready at {self.url}.")

    def _is_frontend_running(self) -> bool:
        try:
            with urllib.request.urlopen(self.url, timeout=0.5):
                return True
        except (OSError, urllib.error.URLError):
            return False
