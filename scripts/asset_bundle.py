"""Inline our self-hosted font assets when emitting a standalone HTML file."""
import base64
import re


def inline_css(root, relative_path):
    css = (root / relative_path).read_text()
    if relative_path == 'geographic/bikeride.css':
        notices = '\n\n'.join((root / 'vendor' / 'fonts' / name).read_text().strip()
                              for name in ['LICENSE-Inter.txt', 'LICENSE-Sora.txt'])
        if '*/' in notices:
            raise ValueError('Font notice cannot be preserved inside a CSS comment')
        css = '/* Font copyright and license notices accompanying embedded fonts:\n' + notices + '\n*/\n' + css

    def font(match):
        path = root / 'vendor' / 'fonts' / match.group(1)
        encoded = base64.b64encode(path.read_bytes()).decode()
        return "url('data:font/ttf;base64," + encoded + "')"

    return re.sub(r"url\(['\"]?\.\./vendor/fonts/([a-z-]+\.ttf)['\"]?\)", font, css)
