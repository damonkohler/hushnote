#!/usr/bin/python

"""Prints a list of SHA256 hashes for hushnote's client-side source.

The purpose of this script is to help users who are concerned that hushnote's
source could change after they audit it. For example:

1) Audit hushnote's source.
2) Save the output of this script to a local file (such as ~/hushnote_hashes)
3) In a crontab, compare the output of this script to your saved output.

./site_verify.py | diff ~/hushnote_content_hash - &> /dev/null || \
  echo hushnote has new content

Assuming your crontab sends stdout to your email, this will alert you to any
hushnote changes.
"""

__author__ = "Damon Kohler <damonkohler@gmail.com>"

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
