"""Inline our self-hosted font assets when emitting a standalone HTML file."""
import base64
import re


def inline_css(root, relative_path):
    css = (root / relative_path).read_text()

    def font(match):
        path = root / 'vendor' / 'fonts' / match.group(1)
        encoded = base64.b64encode(path.read_bytes()).decode()
        return "url('data:font/ttf;base64," + encoded + "')"

    return re.sub(r"url\(['\"]?\.\./vendor/fonts/([a-z-]+\.ttf)['\"]?\)", font, css)
