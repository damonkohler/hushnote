/*
Copyright (c) 2008 Francesco Sullo, Passpack Srl (www.passpack.com)
Copyright (c) 2009 Damon Kohler (www.damonkohler.com)

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
$.fn.hint = function () {
  return this.each(function () {
    var elem = $(this);
    elem.val(elem.attr("title"));
    elem.addClass("hint");
    elem.blur(function () {
      if (elem.val() == "") {
        elem.val(elem.attr("title"));
        elem.addClass("hint");
      }
    });
    elem.focus(function () {
      if (elem.hasClass("hint")) {
        elem.val("");
        elem.removeClass("hint");
      }
      elem.select();
    });
  });
}

$.fn.onEnter = function (func) {
  return this.each(function () {
    var elem = $(this);
    elem.keydown(function (event) {
      if (event.which == 13) {
        try {
          func();
        } finally {
          event.preventDefault();
        }
      }
    });
  });
}

hushnote = new Passpack.static({

  start: function () {
    $("#intro").show();
    $("#oplop_help").show();
    $("#hushnote_help").hide();
    $("#oplop_wrapper").html("").append(
      Q("DIV", {},
        Q("P", {},
          Q("INPUT", {id: "oplop_password", title: "oplop master password"})
          .hint()
          .onEnter(function () {
            var field = $("#oplop_password");
            if (hushnote.oplop_password == undefined) {
              hushnote.oplop_password = field.val();
              field.attr("title", "oplop label");
              field.val("").focus().select();
            } else {
              field.val(oplop(hushnote.oplop_password, field.val()));
              field.focus().select();
            }
          }),
          Q("SPAN", {},
            Q("A", {href: "http://oplop.googlecode.com/"}, "What's this?")
          ).css({margin: "1em"})
        )
      )
    );
    $("#hushnote_wrapper").html("").append(
      Q("DIV", {},
        Q("P", {},
          Q("INPUT", {id: "password", title: "hushnote password"})
          .hint()
          .onEnter(function () { hushnote.fetch(); }),
          Q("SPAN", {id: "status"})
        )
      )
    );
  },

  fetch: function () {
    this.password = $("#password").val();
    this.key = Passpack.utils.hashx(this.password, 0, 1);
    $.ajax({
        url: "/fetch", type: "POST",
        data: {key: this.key}, complete: this.load});
  },

  load: function (response) {
    if (response && response.responseText) {
      var decoded = Passpack.JSON.parse(response.responseText);
      if (decoded.ok && decoded.key == hushnote.key) {
        hushnote.showNote(decoded.note);
        $("#status").html("").append(
          Q("A", {href: decoded.url}, decoded.message));
      } else if (decoded.key != hushnote.key) {
        hushnote.showNote("-");
        $("#status").html("").append(
          Q("A", {href: decoded.url}, decoded.message));
        hushnote.willReset = true;
        hushnote.flash("Password Changed");
      }
      else {
        $("#status").html("").append(
          Q("A", {href: decoded.url}, decoded.message));
      }
    } else {
      $("#status").text("Server Error");
    }
  },

  save: function () {
    if (hushnote.willReset &&
        prompt(
            "You are about to overwrite an existing hushnote! " +
            "Are you sure you want to reset your password and content?\n\n" +
            "Type \"yes\" to confirm.") != "yes") {
      location.reload();
      return;
    } else {
      hushnote.willReset = false;
    }
    $.ajax({
        url: "/save",
        type: "POST",
        data: {
            note: Passpack.encode("AES", $("#note").val(), hushnote.password),
            key: hushnote.key},
        complete: hushnote.saved
      });
  },

  saved: function (response) {
    if (response && response.responseText) {
      var decoded = Passpack.JSON.parse(response.responseText);
      if (decoded.ok) {
        hushnote.flash("Saved");
      } else {
        hushnote.flash(decoded.message);
      }
    } else {
      hushnote.flash("Server Error");
    }
  },

  showNote: function (note) {
    $("#intro").hide();
    $("#hushnote_help").show();
    if (note != "-") {
      note = Passpack.decode("AES", note, hushnote.password);
    } else {
      note = "";
    }
    $("#hushnote_wrapper").html("").append(
      Q("P", {},
        Q("TEXTAREA", {id: "note"}, note)
          .keypress(function () {
            clearTimeout(hushnote.autosaveTimer);
            hushnote.autosaveTimer = setTimeout("hushnote.save()", 1000);
          })
          .css({
            height: ($(window).height()-250)+"px",
            width: ($(window).width()-150)+"px"
          }),
        Q("BR"),
        Q("DIV", {id: "status"})
      )
    );
  },

  flash: function (message) {
    console.log(message);
    $("#status").append(
      Q("SPAN", {id: "message", 'class': "red"}, message)
    );
    $("#message").fadeOut(2000, function () { $("#message").remove() });
  }

});

$(document).ready(function () {
  hushnote.start();
});


