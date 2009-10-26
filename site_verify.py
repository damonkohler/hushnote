#!/usr/bin/python

from BeautifulSoup import BeautifulSoup
from hashlib import sha256
import urllib2

HUSHNOTE_URL = 'http://hushnote.appspot.com/'


def get_source(url):
  return urllib2.urlopen(url).read()


def print_hash(url, source):
  print url, sha256(source).hexdigest()


top_html = get_source(HUSHNOTE_URL)
print_hash(HUSHNOTE_URL, top_html)

soup = BeautifulSoup(top_html)
script_urls = [str(s['src']) for s in soup.findAll('script')]

for script_url in script_urls:
  url = HUSHNOTE_URL + script_url
  print_hash(url, get_source(url))
