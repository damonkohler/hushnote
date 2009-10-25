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
hushnote = new Passpack.static({

  start: function () {
    $("#intro").show();
    $("#oplop").html("").append(
      Q("DIV", {},
        Q("P", {},
          Q("FORM", {},
            Q("INPUT", {
                id: "oplop_password", value: "Oplop password", 'class': "hint"})
            .blur(function () {
              var ok = $("#oplop_ok");
              var field = $("#oplop_password");
              if (field.val() == "" && ok.val() == "Save") {
                field.val("Oplop password").addClass("hint");
              } else if (field.val() == "" && ok.val() == "Generate") {
                field.val("Oplop label").addClass("hint");
              }
            })
            .focus(function () {
              var field = $("#oplop_password");
              if (field.hasClass("hint")) {
                field.val("").removeClass("hint");
              }
              field.select();
            }),
            Q("INPUT",
              {id: "oplop_ok", type: "submit", 'class': "button", value: "Save"})
          ).submit(function(event) {
            try {
              var ok = $("#oplop_ok");
              var field = $("#oplop_password");
              if (ok.val() == "Save") {
                hushnote.oplop_password = field.val();
                ok.val("Generate");
                field.val("").focus().select();
              } else if (ok.val() == "Generate") {
                field.val(oplop(hushnote.oplop_password, field.val()));
                field.focus().select();
              }
            } finally {
              event.preventDefault();
            }
          }),
          Q("DIV", {}, Q("A", {href: "http://oplop.googlecode.com/"}, "What's this?"))
        )
      )
    );
    $("#wrapper").html("").append(
      Q("DIV", {},
        Q("P", {},
          Q("FORM", {},
            Q("INPUT", {id: "password", value: "hushnote password", 'class': "hint"})
            .blur(function () {
              var field = $("#password");
              if (field.val() == "") {
                field.val("hushnote password").addClass("hint");
              }
            })
            .focus(function () {
              var field = $("#password");
              if (field.hasClass("hint")) {
                field.val("").removeClass("hint");
              }
            }),
            Q("INPUT",
              {id: "ok", type: "submit", 'class': "button", value: "Load"})
          ).submit(function(event) {
            try {
              hushnote.fetch();
            } finally {
              event.preventDefault();
            }
          }),
          Q("SPAN", {id: "status"}),
          Q("BR"),
          Q("DIV", {id: "error"})
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
        $("#logout").html("").append(
          Q("A", {href: decoded.url}, decoded.message));
      } else if (decoded.key != hushnote.key) {
        hushnote.showNote("-");
        hushnote.flash("Password Changed");
        hushnote.willReset = true;
        $("#logout").html("").append(
          Q("A", {href: decoded.url}, decoded.message));
      }
      else {
        $("#error").html("").append(
          Q("A", {href: decoded.url}, decoded.message));
      }
    } else {
      $("#error").text("Server Error");
    }
  },

  save: function () {
    if (hushnote.willReset && !confirm("Reset password and content?")) {
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
    if (note != "-") {
      note = Passpack.decode("AES", note, hushnote.password);
    } else {
      note = "";
    }
    $("#wrapper").html("").append(
      Q("TEXTAREA", {id: "note"}, note)
        .keypress(function () {
          clearTimeout(hushnote.autosaveTimer);
          hushnote.autosaveTimer = setTimeout("hushnote.save()", 2000);
        })
        .css({
          height: ($(window).height()-250)+"px",
          width: ($(window).width()-150)+"px"
        }),
      Q("BR"),
      Q("INPUT", {id: "ok", type: "button", 'class': "button", value: "Save"})
        .click(function () {
          hushnote.save();
        }),
      Q("SPAN", {id: "status"}),
      Q("DIV", {id: "logout"})
    );
  },

  flash: function (message) {
    $("#status").append(
      Q("SPAN", {id: "message", 'class': "red"}, message)
    );
    $("#message").fadeOut(2000, function(){$("#message").remove()});
  }

});

$(document).ready(function () {
  hushnote.start();
});


