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
$.fn.tooltip = function (content) {
  return this.each(function () {
    $(this).qtip({
      content: content,
      position: {
        corner: {
          target: "center",
          tooltip: "bottomLeft"
        }
      },
      style: {
        name: "cream",
        border: {width: 2, radius: 4},
        tip: "bottomLeft"
      },
      show: {ready: true}
    });
    $(this).unbind("mousemove.qtip");
    $(this).unbind("mouseout.qtip");
    $(this).unbind("mouseover.qtip");
  });
}

$.fn.hint = function (content) {
  return this.each(function () {
    var label = $(this);
    var input = $("#" + label.attr("for"));
    input.tooltip(content);
    input.blur(function () {
      if (input.val() == "") {
        label.show();
        input.qtip("show");
      }
    });
    input.focus(function () {
      label.hide();
      input.qtip("hide");
      input.select();
    });
    input.keydown(function (event) {
      if (event.which != 9) {
        label.hide();
        input.qtip("hide");
      }
    });
    label.click(function () { input.focus(); });
  });
}

hushnote = new Passpack.static({

  start: function () {
    $("#oplop_form").submit(function () {
      try {
        var password_input = $("#oplop_password");
        var password_label = $("#oplop_password_label");
        if (hushnote.oplop_password == undefined) {
          password_input.qtip("api").updateContent(
              "Type your Oplop master password again to confirm.");
          password_input.qtip("show");
          hushnote.oplop_password = password_input.val();
          password_input.val("");
        } else if (hushnote.oplop_password != password_input.val()) {
           password_input.qtip("api").updateContent(
              "Your entries did not match. Please, try again.");
           password_input.qtip("show");
           password_input.val("");
           hushnote.oplop_password = undefined;
        } else {
          var label_input = $.INPUT({id: "oplop_label"});
          var label_label = $.LABEL(
              {id: "oplop_label_label", 'for': "oplop_label"}, "oplop label");
          password_input.replaceWith(label_input);
          password_label.replaceWith(label_label);
          label_input.focus();
          label_label.hint(
              "Type in an Oplop label here, then press enter.");
          $(this).unbind("submit");
          $(this).submit(function () {
            try {
              var label_input = $("#oplop_label");
              var generated_password = oplop(label_input.val(),
                                             hushnote.oplop_password);
              label_input.val(generated_password);
              label_input.focus().select();
            } finally {
              return false;
            }
          });
        }
      } finally {
        return false;
      }
    });
    $("#hushnote_form").submit(function () {
      try {
        hushnote.fetch();
      } finally {
        return false;
      }
    });
  },

  fetch: function () {
    this.hushnote_password = $("#hushnote_password").val();
    this.key = Passpack.utils.hashx(this.hushnote_password, 0, 1);
    $.ajax({
        url: "/fetch", type: "POST",
        data: {key: this.key}, complete: this.load});
  },

  load: function (response) {
    if (response && response.responseText) {
      var decoded = Passpack.JSON.parse(response.responseText);
      if (!decoded.ok) {
        $("#status").html("").append(
          $.A({href: decoded.url}, decoded.message));
      } else if (decoded.key == hushnote.key) {
        hushnote.showNote(decoded.note);
        $("#status").html("").append(
          $.A({href: decoded.url}, decoded.message));
      } else if (decoded.key != hushnote.key) {
        hushnote.showNote("-");
        $("#status").html("").append(
          $.A({href: decoded.url}, decoded.message));
        hushnote.willReset = true;
        hushnote.flash("Password Changed");
      }
    } else {
      $("#status").text("Server Error");
    }
  },

  showNote: function (note) {
    $("#hushnote_help").show();
    if (note != "-") {
      note = Passpack.decode("AES", note, hushnote.hushnote_password);
    } else {
      note = "";
    }

    var autosave =
    $("#hushnote_wrapper").html("").append(
      $.FORM({action: ""},
        $.TEXTAREA({id: "note"}, note)
          .keydown(function () {
             clearTimeout(hushnote.autosaveTimer);
             hushnote.autosaveTimer = setTimeout("hushnote.save()", 1000);
          })
          .css({
            height: ($(window).height()-300)+"px",
            width: ($(window).width()-75)+"px"
          }),
        $.BR(),
        $.DIV({id: "status"})
      )
    );
  },

  save: function () {
    var warning = "Your password has changed. If you continue, you will lose " +
        "any existing hushnote content.\n\nType \"yes\" to confirm.";
    if (hushnote.willReset && prompt(warning) != "yes") {
      location.reload();
      return;
    } else {
      hushnote.willReset = false;
    }
    $.ajax({
        url: "/save",
        type: "POST",
        data: {
            note: Passpack.encode("AES", $("#note").val(),
                                  hushnote.hushnote_password),
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

  flash: function (message) {
    var showMessage = function () {
      var when = new Date();
      var dateStamp =
          (when.getMonth() + 1) + '/' + when.getDate() + '/' + when.getFullYear();
      var timeStamp = when.toLocaleTimeString();
      $("#status").append($.SPAN({id: "message"},
                          message + " " + dateStamp + " " + timeStamp));
    }
    if ($("#message").length !== 0) {
      $("#message").fadeOut(1000, function () {
        $("#message").remove();
        showMessage();
      });
    } else {
      showMessage();
    }
  }

});

$(document).ready(function () {
  hushnote.start();
  $("#oplop_password").focus();
  $("#oplop_password_label").hint(
      "Type in your Oplop master password here, then press enter.");
  $("#hushnote_password_label").hint(
      "Type in your hushnote password here, then press enter.");
});


