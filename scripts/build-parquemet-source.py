#!/usr/bin/env python3
"""Render the retained Parquemet PDF, never download or replace its edition.

Dependencies used for the checked-in render: PyMuPDF 1.26.6 / MuPDF 1.26.11,
Pillow 12.3.0. Run with --pdf PATH on first use, then without arguments.
"""
import argparse
import hashlib
import json
from pathlib import Path

import fitz
from PIL import Image, __version__ as pillow_version, features


ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / 'sources/parquemet-mapa-oficial.pdf'
IMAGE_PATH = ROOT / 'sources/parquemet-mapa-oficial.jpg'
METADATA_PATH = ROOT / 'data/parquemet/official-document.json'
EXPECTED_SHA256 = 'e7606172479a0fd585f7f3dcb4187556a202778cd647b31f44aaefcf9bd03cf8'
EXPECTED_BYTES = 765376
SOURCE_URL = 'https://mapas.parquemet.cl/doc/MapaParque.pdf'
RETRIEVED_AT = '2026-10-20T15:01:06.256455+00:00'
# Inspected in the native full-page render: before the lower legend and
# before the right-hand distance table. This is a display frame, not a crop
# applied to either retained asset.
MAP_AREA = {'x': 0, 'y': 0, 'width': 5705, 'height': 2130}


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--pdf', type=Path, default=PDF_PATH, help='Retained original PDF; its exact hash is required.')
    args = parser.parse_args()
    source = args.pdf.read_bytes()
    if len(source) != EXPECTED_BYTES or sha256(source) != EXPECTED_SHA256:
        raise SystemExit('Refusing a different PDF edition: byte count or SHA-256 does not match the retained source.')

    with fitz.open(stream=source, filetype='pdf') as pdf:
        if len(pdf) != 1:
            raise SystemExit('Expected one page in the retained document.')
        page = pdf[0]
        if page.rotation != 0:
            raise SystemExit('Unexpected page rotation; review the coordinate transform before rendering.')
        fitz.TOOLS.set_aa_level(8)
        pixmap = page.get_pixmap(matrix=fitz.Matrix(1, 1), colorspace=fitz.csRGB, alpha=False)
        image = Image.frombytes('RGB', (pixmap.width, pixmap.height), pixmap.samples)
        PDF_PATH.parent.mkdir(parents=True, exist_ok=True)
        if not PDF_PATH.exists() or PDF_PATH.read_bytes() != source:
            PDF_PATH.write_bytes(source)
        image.save(IMAGE_PATH, 'JPEG', quality=95, subsampling=0, optimize=True, progressive=True, dpi=(72, 72))
        image_bytes = IMAGE_PATH.read_bytes()
        metadata = {
            'schemaVersion': 1,
            'id': 'parquemet-official-map',
            'title': 'Recorre y descubre Parquemet',
            'documentType': 'schematic-panorama',
            'coordinateSystem': 'document-pixels',
            'pdf': {
                'path': PDF_PATH.relative_to(ROOT).as_posix(),
                'url': SOURCE_URL,
                'resolvedUrl': SOURCE_URL,
                'retrievedAt': RETRIEVED_AT,
                'bytes': len(source),
                'sha256': EXPECTED_SHA256,
                'mimeType': 'application/pdf',
                'pageCount': len(pdf),
                'metadata': pdf.metadata,
                'editionLabel': None,
                'publicationDate': None,
                'editionNote': 'El documento no muestra una fecha de edición. Sus metadatos internos registran creación en 2022 y modificación en 2023; esas fechas no acreditan vigencia operativa.',
            },
            'page': {
                'number': 1,
                'widthPt': page.rect.width,
                'heightPt': page.rect.height,
                'units': 'PDF points (1/72 inch)',
                'pdfUserSpaceOrigin': 'bottom-left',
                'pageCoordinateOrigin': 'top-left',
                'mediaBoxPt': list(page.mediabox),
                'cropBoxPt': list(page.cropbox),
                'rotationDeg': page.rotation,
            },
            'image': {
                'path': IMAGE_PATH.relative_to(ROOT).as_posix(),
                'width': pixmap.width,
                'height': pixmap.height,
                'bytes': len(image_bytes),
                'sha256': sha256(image_bytes),
                'mimeType': 'image/jpeg',
                'coordinateSystem': 'document-pixels',
                'origin': 'top-left',
                'fullPage': True,
                'render': {
                    'engine': 'PyMuPDF',
                    'pyMuPdfVersion': fitz.VersionBind,
                    'muPdfVersion': fitz.VersionFitz,
                    'pillowVersion': pillow_version,
                    'libjpegVersion': features.version_codec('jpg'),
                    'dpi': 72,
                    'scale': 1,
                    'antialiasingLevel': 8,
                    'jpegQuality': 95,
                    'jpegSubsampling': '4:4:4',
                    'progressive': True,
                    'crop': None,
                    'generativeProcessing': False,
                    'roundingNote': 'El raster cubre el rectángulo fraccionario de la página con límites enteros: 6690 × 2835 píxeles; no se estira la página para ajustar esas dimensiones.',
                },
            },
            'transforms': {
                'matrixConvention': '[a,b,c,d,e,f]: x2=a*x1+c*y1+e; y2=b*x1+d*y1+f',
                'pdfUserSpaceToImagePixels': list(page.transformation_matrix),
                'pageTopLeftPointsToImagePixels': [1, 0, 0, 1, 0, 0],
                'imagePixelsToGps': None,
            },
            'initialView': MAP_AREA,
            'recommendedMapCrop': {
                **MAP_AREA,
                'units': 'document-pixels',
                'purpose': 'Vista previa del mapa principal, antes de la simbología inferior y de la tabla de distancias lateral. El archivo completo conserva ambos paneles.',
            },
            'georeferencing': {
                'status': 'not-georeferenced',
                'crs': None,
                'transform': None,
                'useForNavigation': False,
                'useForGroundDistances': False,
                'inspectedPageKeys': {key: pdf.xref_get_key(page.xref, key)[1] for key in ('VP', 'Measure', 'LGIDict')},
                'reason': 'Panorama esquemático con relieve dibujado. No contiene controles aceptados ni una transformación validada para superponerlo en el mapa GPS.',
            },
        }
    METADATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    METADATA_PATH.write_text(json.dumps(metadata, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'pdf': metadata['pdf']['path'], 'image': metadata['image'], 'metadata': METADATA_PATH.relative_to(ROOT).as_posix()}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
