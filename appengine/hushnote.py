import os

from google.appengine.api import users
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext.webapp.util import login_required


class Note(db.Model):
  user = db.UserProperty()
  content = db.BlobProperty()
  hushkey = db.StringProperty(multiline=True)
  date = db.DateTimeProperty(auto_now=True)


class Main(webapp.RequestHandler):

  def get(self):
    path = os.path.join(os.path.dirname(__file__), 'index.html')
    self.response.out.write(template.render(path, {}))


class Fetch(webapp.RequestHandler):

  def post(self):
    user = users.get_current_user()
    if not user:
      url = users.create_login_url('/')
      self.response.out.write(
          '{"ok":0,"message":"Login Required","url":"%s"}' % url)
    else:
      note = db.GqlQuery(
          "SELECT * FROM Note WHERE user = :1 ORDER BY date DESC", user).get()
      url = users.create_logout_url('/')
      if note is None:
        self.response.out.write(
            '{"ok":1,"key":"-","note":"-","message":"Logout","url":"%s"}' % url)
      else:
        self.response.out.write(
            '{"ok":1,"key":"%s","note":"%s","message":"Logout","url":"%s"}'
            % (note.hushkey, note.content, url))


class Save(webapp.RequestHandler):

  def post(self):
    user = users.get_current_user()
    if not user:
      url = users.create_login_url('/')
      self.response.out.write(
          '{"ok":0,"message":"Login Required","url":"%s"}' % url)
    else:
      note = Note.get_or_insert(key_name=user.user_id())
      note.user = user
      note.content = self.request.get('note')
      note.hushkey = self.request.get('key')
      note.put()
      self.response.out.write('{"ok":1,"message":"Saved"}')


application = webapp.WSGIApplication([
    ('/', Main),
    ('/fetch', Fetch),
    ('/save', Save),
    ], debug=True)


def main():
  run_wsgi_app(application)


if __name__ == "__main__":
  main()
