(function() {

if (window.md5 === undefined) {
    throw new Error("md5 module is missing");
}


function latin1_to_utf8(text) {
    var converted = new Array();

    for (var x=0; x < text.length; x+=1) {
        var code_point = text.charCodeAt(x);

        if (code_point < 128) {
            converted.push(String.fromCharCode(code_point));
        }
        else {
            var first = 0xc0 | code_point >> 6;
            var second = 0x80 | code_point & 0x3f;

            converted.push(String.fromCharCode(first, second));
        }
    }

    return converted.join("");
}

function oplop(label, password) {
    var length = 8;
    var utf8_password = latin1_to_utf8(password);
    var utf8_label = latin1_to_utf8(label);

    var created_password = md5.urlsafe_base64(utf8_password + utf8_label);

    var digit_regex = /\d+/;
    var digit_pos = created_password.search(digit_regex);

    if (digit_pos < 0) {  // No digit found.
        created_password = '1' + created_password;
    }
    else if (digit_pos >= length) {  // Digit outside of final password.
        var digit = created_password.match(digit_regex);
        created_password = digit + created_password;
    }

    return created_password.substring(0, length);
}


window.oplop = oplop;

})();
