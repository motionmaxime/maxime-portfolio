"""Check metadata, structured data and sitemap consistency: python3 tests/check_seo.py."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.maximepommier.fr/'
DESCRIPTION = 'Explain less. Convert more. Premium motion design that clarifies complex SaaS & AI products.'

class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.canonicals = []
    def handle_starttag(self, tag, attributes):
        a = dict(attributes)
        if tag == 'meta':
            key = a.get('name') or a.get('property')
            if key:
                assert key not in self.meta, f'Duplicate metadata: {key}'
                self.meta[key] = a.get('content', '')
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonicals.append(a['href'])

urls, titles, descriptions = set(), set(), set()
for page in sorted(ROOT.glob('*.html')):
    source = page.read_text()
    head = Head()
    head.feed(source.split('</head>', 1)[0])
    url = BASE + ('' if page.name == 'index.html' else page.name)
    assert head.canonicals == [url], page.name
    assert head.meta['og:url'] == url, page.name
    assert 'noindex' not in head.meta['robots'], page.name
    assert '<html lang="en">' in source, page.name
    assert '19-year-old' not in source, page.name
    assert not re.search(r'hreflang="fr"', source), page.name
    for key in ['og:image', 'twitter:image']:
        target = urlsplit(head.meta[key])
        assert target.netloc == 'www.maximepommier.fr'
        asset = unquote(target.path).lstrip('/')
        assert (ROOT / asset).is_file(), (page.name, asset)
        assert asset in [str(p.relative_to(ROOT)) for p in ROOT.rglob('*') if p.is_file()], asset
    assert head.meta['description'] == head.meta['og:description'] == head.meta['twitter:description']
    title = head.meta['og:title']
    assert title not in titles and head.meta['description'] not in descriptions, page.name
    titles.add(title)
    descriptions.add(head.meta['description'])
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', source, re.S)
    assert len(blocks) == 1, page.name
    graph = json.loads(blocks[0])['@graph']
    ids = {node['@id'] for node in graph}
    assert len(ids) == len(graph), page.name
    for node in graph:
        for value in node.values():
            if isinstance(value, dict) and '@id' in value:
                assert value['@id'] in ids, (page.name, value)
    assert graph[0]['description'] == DESCRIPTION
    if page.name == 'index.html':
        assert head.meta['description'] == DESCRIPTION
    urls.add(url)

root = ET.parse(ROOT / 'sitemap.xml').getroot()
locations = [el.text for el in root.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(locations) == len(set(locations))
assert set(locations) == urls
assert 'Sitemap: ' + BASE + 'sitemap.xml' in (ROOT / 'robots.txt').read_text()
print(f'PASS: {len(urls)} pages; unique metadata, existing social images, linked schemas and matching sitemap.')
