/*

Passpack Host-Proof Hosting 1.0 - Rome, 22 june 2008
Copyright (c) 2008 Passpack Srl (www.passpack.com)
Dual licensed under the open source MIT license and LGPL license,
except where otherwise specified in the following.


Passpack Host-Proof Hosting includes pre-existent libraries, modified for the scope of this library:
 

UTF-8 data encode / decode
Base64 encode / decode
copyright http://www.webtoolkit.info/


AES/Rijndael algorithm for 128/192/256-bit keys
JavaScript implementation: Chris Veness, Movable Type Ltd: www.movable-type.co.uk
http://www.movable-type.co.uk/scripts/AES.html
Distributed under a LGPL license

'Block' Tiny Encryption Algorithm xxtea
(c) 2002-2006 Chris Veness <scripts@movable-type.co.uk>
JavaScript implementation: Chris Veness, Movable Type Ltd: www.movable-type.co.uk
http://www.movable-type.co.uk/scripts/TEAblock.html
Distributed under a LGPL license

json2.js, 2008-01-17
Distributed as Public Domain by Douglas Crockford
http://www.JSON.org/js.html

A JavaScript implementation of the Secure Hash Algorithm, SHA-256
Version 0.3 Copyright Angel Marin 2003-2004 - http://anmar.eu.org/
Distributed under the BSD License


*/

Passpack = new (function(){
		this.extend = function () {
			var a = arguments[0] || {};
			if (typeof a == 'object') for (var j in a) this[j] = a[j];
		};
		this.extend(arguments[0]);
	})({

	name: 'Passpack',
	version: 1.01,
	date: '2008-06-20',
	
	static: function(){
		this.extend = function () {
			var a = arguments[0] || {};
			if (typeof a == 'object') for (var j in a) this[j] = a[j];
		};
		this.extend(arguments[0]);
		if (typeof this._init === 'function') this._init();
	}

});



/****************************** crypt **************************/




Passpack.extend({

	crypt: new Passpack.static(),
	utils: new Passpack.static(),
	_init: function () {}
	
});




Passpack.crypt.UTF8 = {


/**
*
*  UTF-8 data encode / decode
*  http://www.webtoolkit.info/
*
**/

    // public method for url encoding
    encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // public method for url decoding
    decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

};



Passpack.crypt.Base64 = {

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/

	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",	

	// public method for encoding
	encode : function (input,noPlus) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0, keyStr = this._keyStr;
		if (noPlus) keyStr = keyStr.replace(/\+/,"!");

		input = Passpack.crypt.UTF8.encode(input);

		while (i < input.length) {

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			var 
			output = output +
			keyStr.charAt(enc1) + keyStr.charAt(enc2) +
			keyStr.charAt(enc3) + keyStr.charAt(enc4);

		}

		return output;
	},

	// public method for decoding
	decode : function (input,noPlus) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0, keyStr = this._keyStr;
		if (noPlus) keyStr = keyStr.replace(/\+/,"!");

		input = noPlus ? input.replace(/[^A-Za-z0-9\!\/\=]/g, "") : input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) {

			enc1 = keyStr.indexOf(input.charAt(i++));
			enc2 = keyStr.indexOf(input.charAt(i++));
			enc3 = keyStr.indexOf(input.charAt(i++));
			enc4 = keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		output = Passpack.crypt.UTF8.decode(output);

		return output;

	}

};



Passpack.crypt.AES = {

// AES/Rijndael algorithm for 128/192/256-bit keys
// JavaScript implementation: Chris Veness, Movable Type Ltd: www.movable-type.co.uk
// http://www.movable-type.co.uk/scripts/AES.html
// You are welcome to re-use these scripts [without any warranty express or implied]
// provided you retain my copyright notice and when possible a link to my website (under a LGPL license).
// If you have any queries or find any problems, please contact Chris Veness.



	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	
	/*
	 * AES Cipher function: encrypt 'input' with Rijndael algorithm
	 *
	 *   takes   byte-array 'input' (16 bytes)
	 *           2D byte-array key schedule 'w' (Nr+1 x Nb bytes)
	 *
	 *   applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage
	 *
	 *   returns byte-array encrypted value (16 bytes)
	 */
	Cipher: function (input, w) {    // main Cipher function [รยง5.1]
	  var Nb = 4;               // block size (in words): no of columns in state (fixed at 4 for AES)
	  var Nr = w.length/Nb - 1; // no of rounds: 10/12/14 for 128/192/256-bit keys
	
	  var state = [[],[],[],[]];  // initialise 4xNb byte-array 'state' with input [ง3.4]
	  for (var i=0; i<4*Nb; i++) state[i%4][Math.floor(i/4)] = input[i];
	
	  state = this.AddRoundKey(state, w, 0, Nb);
	
	  for (var round=1; round<Nr; round++) {
		state = this.SubBytes(state, Nb);
		state = this.ShiftRows(state, Nb);
		state = this.MixColumns(state, Nb);
		state = this.AddRoundKey(state, w, round, Nb);
	  }
	
	  state = this.SubBytes(state, Nb);
	  state = this.ShiftRows(state, Nb);
	  state = this.AddRoundKey(state, w, Nr, Nb);
	
	  var output = new Array(4*Nb);  // convert state to 1-d array before returning [ง3.4]
	  for (var i=0; i<4*Nb; i++) output[i] = state[i%4][Math.floor(i/4)];
	  return output;
	},
	
	
	SubBytes: function (s, Nb) {    // apply SBox to state S [ง5.1.1]
	  for (var r=0; r<4; r++) {
		for (var c=0; c<Nb; c++) s[r][c] = this.Sbox[s[r][c]];
	  }
	  return s;
	},
	
	
	ShiftRows: function (s, Nb) {    // shift row r of state S left by r bytes [ง5.1.2]
	  var t = new Array(4);
	  for (var r=1; r<4; r++) {
		for (var c=0; c<4; c++) t[c] = s[r][(c+r)%Nb];  // shift into temp copy
		for (var c=0; c<4; c++) s[r][c] = t[c];         // and copy back
	  }          // note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
	  return s;  // see fp.gladman.plus.com/cryptography_technology/rijndael/aes.spec.311.pdf 
	},
	
	
	MixColumns: function (s, Nb) {   // combine bytes of each col of state S [ง5.1.3]
	  for (var c=0; c<4; c++) {
		var a = new Array(4);  // 'a' is a copy of the current column from 's'
		var b = new Array(4);  // 'b' is a*{02} in GF(2^8)
		for (var i=0; i<4; i++) {
		  a[i] = s[i][c];
		  b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;
		}
		// a[n] ^ b[n] is a*{03} in GF(2^8)
		s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; // 2*a0 + 3*a1 + a2 + a3
		s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; // a0 * 2*a1 + 3*a2 + a3
		s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; // a0 + a1 + 2*a2 + 3*a3
		s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; // 3*a0 + a1 + a2 + 2*a3
	  }
	  return s;
	},
	
	
	AddRoundKey: function (state, w, rnd, Nb) {  // xor Round Key into state S [ง5.1.4]
	  for (var r=0; r<4; r++) {
		for (var c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
	  }
	  return state;
	},
	
	
	KeyExpansion: function (key) {  // generate Key Schedule (byte-array Nr+1 x Nb) from Key [ง5.2]
	  var Nb = 4;            // block size (in words): no of columns in state (fixed at 4 for AES)
	  var Nk = key.length/4;  // key length (in words): 4/6/8 for 128/192/256-bit keys
	  var Nr = Nk + 6;       // no of rounds: 10/12/14 for 128/192/256-bit keys
	
	  var w = new Array(Nb*(Nr+1));
	  var temp = new Array(4);
	
	  for (var i=0; i<Nk; i++) {
		var r = [key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]];
		w[i] = r;
	  }
	
	  for (var i=Nk; i<(Nb*(Nr+1)); i++) {
		w[i] = new Array(4);
		for (var t=0; t<4; t++) temp[t] = w[i-1][t];
		if (i % Nk == 0) {
		  temp = this.SubWord(this.RotWord(temp));
		  for (var t=0; t<4; t++) temp[t] ^= this.Rcon[i/Nk][t];
		} else if (Nk > 6 && i%Nk == 4) {
		  temp = this.SubWord(temp);
		}
		for (var t=0; t<4; t++) w[i][t] = w[i-Nk][t] ^ temp[t];
	  }
	
	  return w;
	},
	
	SubWord: function (w) {    // apply SBox to 4-byte word w
	  for (var i=0; i<4; i++) w[i] = this.Sbox[w[i]];
	  return w;
	},
	
	RotWord: function (w) {    // rotate 4-byte word w left by one byte
	  w[4] = w[0];
	  for (var i=0; i<4; i++) w[i] = w[i+1];
	  return w;
	},
	
	
	// Sbox is pre-computed multiplicative inverse in GF(2^8) used in SubBytes and KeyExpansion [ง5.1.1]
	Sbox:  [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
				 0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
				 0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
				 0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
				 0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
				 0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
				 0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
				 0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
				 0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
				 0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
				 0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
				 0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
				 0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
				 0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
				 0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
				 0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16],
	
	// Rcon is Round Constant used for the Key Expansion [1st col is 2^(r-1) in GF(2^8)] [ง5.2]
	Rcon: [ [0x00, 0x00, 0x00, 0x00],
				 [0x01, 0x00, 0x00, 0x00],
				 [0x02, 0x00, 0x00, 0x00],
				 [0x04, 0x00, 0x00, 0x00],
				 [0x08, 0x00, 0x00, 0x00],
				 [0x10, 0x00, 0x00, 0x00],
				 [0x20, 0x00, 0x00, 0x00],
				 [0x40, 0x00, 0x00, 0x00],
				 [0x80, 0x00, 0x00, 0x00],
				 [0x1b, 0x00, 0x00, 0x00],
				 [0x36, 0x00, 0x00, 0x00] ],
	
	
	SetKey: function (password,nBits) {
		if (password.constructor == Array && password.length == nBits/8) key = password;
		else {
		  var nBytes = nBits/8;  // no bytes in key
		  var pwBytes = new Array(nBytes);
		  for (var i=0; i<nBytes; i++) pwBytes[i] = password.charCodeAt(i) & 0xff;
		  var key = this.Cipher(pwBytes, this.KeyExpansion(pwBytes));
		  key = key.concat(key.slice(0, nBytes-16));  // key is now 16/24/32 bytes long
		}
		return key;
	},
	
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	
	/* 
	 * Use AES to encrypt 'plaintext' with 'password' using 'nBits' key, in 'Counter' mode of operation
	 *                           - see http://csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf
	 *   for each block
	 *   - outputblock = cipher(counter, key)
	 *   - cipherblock = plaintext xor outputblock
	 */
	AESEncryptCtr: function (plaintext, password, nBits) {
	  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
		
	  var key = this.SetKey(password,nBits);
	
	  // initialise counter block (NIST SP800-38A งB.2): millisecond time-stamp for nonce in 1st 8 bytes,
	  // block counter in 2nd 8 bytes
	  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
	  var counterBlock = new Array(blockSize);  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
	  var nonce = (new Date()).getTime();  // milliseconds since 1-Jan-1970
	
	  // encode nonce in two stages to cater for JavaScript 32-bit limit on bitwise ops
	  for (var i=0; i<4; i++) counterBlock[i] = (nonce >>> i*8) & 0xff;
	  for (var i=0; i<4; i++) counterBlock[i+4] = (nonce/0x100000000 >>> i*8) & 0xff; 
	
	  // generate key schedule - an expansion of the key into distinct Key Rounds for each round
	  var keySchedule = this.KeyExpansion(key);
	
	  var blockCount = Math.ceil(plaintext.length/blockSize);
	  var ciphertext = new Array(blockCount);  // ciphertext as array of strings
	  
	  for (var b=0; b<blockCount; b++) {
		// set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
		// again done in two stages for 32-bit ops
		for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
		for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8);
	
		var cipherCntr = this.Cipher(counterBlock, keySchedule);  // -- encrypt counter block --
		
		// calculate length of final block:
		var blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
	
		var ct = '';
		for (var i=0; i<blockLength; i++) {  // -- xor plaintext with ciphered counter byte-by-byte --
		  var plaintextByte = plaintext.charCodeAt(b*blockSize+i);
		  var cipherByte = plaintextByte ^ cipherCntr[i];
		  ct += String.fromCharCode(cipherByte);
		}
		// ct is now ciphertext for this block
	
		ciphertext[b] = this.escCtrlChars(ct);  // escape troublesome characters in ciphertext
	  }
	
	  // convert the nonce to a string to go on the front of the ciphertext
	  var ctrTxt = '';
	  for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);
	  ctrTxt = this.escCtrlChars(ctrTxt);
	
	  // use '-' to separate blocks, use Array.join to concatenate arrays of strings for efficiency
	  return ctrTxt + '-' + ciphertext.join('-');
	},
	
	
	
	
	/* 
	 * Use AES to decrypt 'ciphertext' with 'password' using 'nBits' key, in Counter mode of operation
	 *
	 *   for each block
	 *   - outputblock = cipher(counter, key)
	 *   - cipherblock = plaintext xor outputblock
	 */
	 
	 AESDecryptCtr: function (ciphertext, password, nBits) {
	  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
	
	  var key = this.SetKey(password,nBits);

	  var keySchedule = this.KeyExpansion(key);
	  ciphertext = ciphertext.split('-');  // split ciphertext into array of block-length strings 
	
	  // recover nonce from 1st element of ciphertext
	  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
	  var counterBlock = new Array(blockSize);
	  var ctrTxt = this.unescCtrlChars(ciphertext[0]);
	  for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);
	
	  var plaintext = new Array(ciphertext.length-1);
	
	  for (var b=1; b<ciphertext.length; b++) {
		// set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
		for (var c=0; c<4; c++) counterBlock[15-c] = ((b-1) >>> c*8) & 0xff;
		for (var c=0; c<4; c++) counterBlock[15-c-4] = ((b/0x100000000-1) >>> c*8) & 0xff;
	
		var cipherCntr = this.Cipher(counterBlock, keySchedule);  // encrypt counter block
	
		ciphertext[b] = this.unescCtrlChars(ciphertext[b]);
	
		var pt = '';
		for (var i=0; i<ciphertext[b].length; i++) {
		  // -- xor plaintext with ciphered counter byte-by-byte --
		  var ciphertextByte = ciphertext[b].charCodeAt(i);
		  var plaintextByte = ciphertextByte ^ cipherCntr[i];
		  pt += String.fromCharCode(plaintextByte);
		}
		// pt is now plaintext for this block
	
		plaintext[b-1] = pt;  // b-1 'cos no initial nonce block in plaintext
	  }
	
	  return plaintext.join('');
	},
	
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	
	escCtrlChars: function (str) {  // escape control chars which might cause problems handling ciphertext
	  return str.replace(/[\0\t\n\v\f\r\xa0!-]/g, function(c) { return '!' + c.charCodeAt(0) + '!'; });
	},  // \xa0 to cater for bug in Firefox; include '-' to leave it free for use as a block marker
	
	unescCtrlChars: function (str) {  // unescape potentially problematic control characters
	  return str.replace(/!\d\d?\d?!/g, function(c) { return String.fromCharCode(c.slice(1,-1)); });
	}
	
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

};




//
// 'Block' Tiny Encryption Algorithm xxtea
// (c) 2002-2006 Chris Veness <scripts@movable-type.co.uk>
//
// Algorithm: David Wheeler & Roger Needham, Cambridge University Computer Lab
//            http://www.cl.cam.ac.uk/ftp/papers/djw-rmn/djw-rmn-tea.html (1994)
//            http://www.cl.cam.ac.uk/ftp/users/djw3/xtea.ps (1997)
//            http://www.cl.cam.ac.uk/ftp/users/djw3/xxtea.ps (1998)
//
// JavaScript implementation: Chris Veness, Movable Type Ltd: www.movable-type.co.uk
// http://www.movable-type.co.uk/scripts/TEAblock.html
//
// You are welcome to re-use these scripts [without any warranty express or implied] provided 
// you retain my copyright notice and when possible a link to my website (under LGPL license).
// If you have any queries or find any problems, please contact Chris Veness.
//
//
//



Passpack.crypt.xxTEA = {

	teaencrypt: function (plaintext, key) {
		if (plaintext.length == 0) return('');
		var v = this.strToLongs(escape(plaintext).replace(/%20/g,' '));
		if (v.length <= 1) v[1] = 0;
		var k = this.strToLongs(key.slice(0,16)),
			n = v.length,
			z = v[n-1],
			y = v[0],
			delta = 0x9E3779B9,
			mx,
			e,
			q = Math.floor(6 + 52/n),
			sum = 0;
		while (q-- > 0) {
			sum += delta;
			e = sum>>>2 & 3;
			for (var p = 0; p < n; p++) {
				y = v[(p+1) % n];
				mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
				z = v[p] += mx;
			}
		}
 		return this.escCtrlCh(this.longsToStr(v));
	},

	teadecrypt: function (ciphertext, key) {
		if (ciphertext.length == 0) return('');
		var k = this.strToLongs(key.slice(0,16)), 
			v = this.strToLongs(this.unescCtrlCh(ciphertext)),
			n = v.length;
		var z = v[n-1], y = v[0], delta = 0x9E3779B9;
		var mx, e, q = Math.floor(6 + 52/n), sum = q*delta;
		while (sum != 0) {
			e = sum>>>2 & 3;
			for (var p = n-1; p >= 0; p--) {
				z = v[p>0 ? p-1 : n-1];
				mx = (z>>>5 ^ y<<2) + (y>>>3 ^ z<<4) ^ (sum^y) + (k[p&3 ^ e] ^ z);
				y = v[p] -= mx;
			}
			sum -= delta;
		}
		return unescape(this.longsToStr(v).replace(/\0+$/,''));
	},

	strToLongs: function (s) {
		var ll = Math.ceil(s.length/4);
		var l = new Array(ll);
		for (var i=0; i<ll; i++) {
			l[i] = s.charCodeAt(i*4)
				+ (s.charCodeAt(i*4+1)<<8)
				+ (s.charCodeAt(i*4+2)<<16)
				+ (s.charCodeAt(i*4+3)<<24);
		}
		return l;
	},

	longsToStr: function (l) {
		var a = new Array(l.length);
		for (var i=0; i<l.length; i++) {
			a[i] = String.fromCharCode(
				l[i] & 0xFF,
				l[i]>>>8 & 0xFF,
				l[i]>>>16 & 0xFF,
				l[i]>>>24 & 0xFF
			);
		}
		return a.join('');
	},
	
	escCtrlCh: function (str) {  // escape control chars etc which might cause problems with encrypted texts
   	return str.replace(/[\0\t\n\v\f\r\xa0'"!]/g, function(c) { return '!' + c.charCodeAt(0) + '!'; });
	},

	unescCtrlCh: function (str) {  // unescape potentially problematic nulls and control characters
		return str.replace(/!\d\d?\d?!/g, function(c) { return String.fromCharCode(c.slice(1,-1)); });
	}
		
};



/// improved RC4 

Passpack.crypt.RC4 = {
	endecrypt: function (txt,key,N,dval) {
		
		function exc(v,a,b) {
			var t = v[a];
			v[a] = v[b];
			v[b] = t;
		}
		
		var num = [], sbox = [], b=0;
		
		for (var i=0;i<=255;i++) {
			sbox[i] = i;
			num[i] = key.charCodeAt(i % key.length);
		}
		
		// improvement (with some bugs - for example with N=5
		for (var u=0;u<N;u++) {
			for (var i=0;i<=255;i++) {
				b = (b + sbox[i] + num[i]) % 256;
				exc(sbox,i,b);
			}
		}
		//
		
		var k=0, j=0, ret = "", val;
		for (var i=0;i<txt.length;i++) {
			 k = (k + 1) % 256;
			 j = (j + sbox[k]) % 256;
			 exc(sbox,k,j);
			 val = txt.charCodeAt(i) ^ sbox[(sbox[k] + sbox[j]) % 256];
			 
			// dval produces not-reversible numeric strings:
			 
			 ret += dval ? val : String.fromCharCode(val);
		}
		return ret;
	}
};



Passpack.extend({
						
	decode: function (algorithm, enctext, key, pars) {
		if (!pars) pars = {};
		var ppc = Passpack.crypt,
			pretext = pars.unescape ? unescape(enctext) : enctext,
			text = /UTF8/.test(algorithm) || pars.noBase64 ? pretext : ppc.Base64.decode(pretext,1);
		switch (algorithm) {
			case 'UTF8':
				return ppc.UTF8.decode(text);
			case 'AES':
				return ppc.AES.AESDecryptCtr(
					text,
					key,
					pars.nbits && /^(128|192|256)$/.test(""+pars.nbits) ? pars.nbits : 256
				);
			case 'RC4':
				return ppc.RC4.endecrypt(
					text,
					key, 
					pars.rounds ? pars.rounds : 1
				);
			case 'xxTEA':
				return ppc.xxTEA.teadecrypt(
					text,
					key
				);
// default algorithm
			case 'Base64+':
		}
		return text;
	},
	
	encode: function (algorithm, plaintext, key, pars) {
		if (!pars) pars = {};
		var ret = plaintext, ppc = Passpack.crypt;
		switch (algorithm) {
			case 'UTF8':
				var utf8 = ppc.UTF8.encode(plaintext);
				break;
			case 'AES':
				ret = ppc.AES.AESEncryptCtr(
						plaintext,
						key, 
						pars.nbits && /^(128|192|256)$/.test(""+pars.nbits) ? pars.nbits : 256
					);
				break;
			case 'RC4':
				ret = ppc.RC4.endecrypt(
						plaintext,
						key, 
						pars.rounds ? pars.rounds : 1
					);
				break;
			case 'xxTEA':
				ret = ppc.xxTEA.teaencrypt(
						plaintext,
						key
					);
				break;
// this is the default algorithm:
			case 'Base64+':
				
		}
		if (!/UTF8/.test(algorithm) && !pars.noBase64) ret = ppc.Base64.encode(ret,1);
		return pars.escape ? escape(ret) : ret;

	}
						
});



// Optional string methods:

Passpack.quickStringMethods = false;
// set to true if you want to implement the quick methods

if (Passpack.quickStringMethods) {

	String.prototype.AESenc = function(key,pars) {
		return Passpack.encode("AES",this,key,pars);
	};
	
	String.prototype.AESdec = function(key,pars) {
		return Passpack.decode("AES",this,key,pars);
	};
	
	String.prototype.xxTEAenc = function(key,pars) {
		return Passpack.encode("xxTEA",this,key,pars);
	};
	
	String.prototype.xxTEAdec = function(key,pars) {
		return Passpack.decode("xxTEA",this,key,pars);
	};
	
	String.prototype.Base64enc = function(pars) {
		return Passpack.encode("Base64+",this,"",pars);
	};
	
	String.prototype.Base64dec = function(pars) {
		return Passpack.decode("Base64+",this,"",pars);
	};

}



/******************* JSON ********************/






/*
    json2.js
    2008-01-17

    Public Domain

    No warranty expressed or implied. Use at your own risk.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods:

        JSON.stringify(value, whitelist)
            value       any JavaScript value, usually an object or array.

            whitelist   an optional array prameter that determines how object
                        values are stringified.

            This method produces a JSON text from a JavaScript value.
            There are three possible ways to stringify an object, depending
            on the optional whitelist parameter.

            If an object has a toJSON method, then the toJSON() method will be
            called. The value returned from the toJSON method will be
            stringified.

            Otherwise, if the optional whitelist parameter is an array, then
            the elements of the array will be used to select members of the
            object for stringification.

            Otherwise, if there is no whitelist parameter, then all of the
            members of the object will be stringified.

            Values that do not have JSON representaions, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays will be replaced with null.
            JSON.stringify(undefined) returns undefined. Dates will be
            stringified as quoted ISO dates.

            Example:

            var text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'

        JSON.parse(text, filter)
            This method parses a JSON text to produce an object or
            array. It can throw a SyntaxError exception.

            The optional filter parameter is a function that can filter and
            transform the results. It receives each of the keys and values, and
            its return value is used instead of the original value. If it
            returns what it received, then structure is not modified. If it
            returns undefined then the member is deleted.

            Example:

            // Parse the text. If a key contains the string 'date' then
            // convert the value to a date.

            myData = JSON.parse(text, function (key, value) {
                return key.indexOf('date') >= 0 ? new Date(value) : value;
            });

    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    Use your own copy. It is extremely unwise to load third party
    code into your pages.
*/

/*jslint evil: true */

/*global JSON */

/*members "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    charCodeAt, floor, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join, length,
    parse, propertyIsEnumerable, prototype, push, replace, stringify, test,
    toJSON, toString
*/


Passpack.JSON = function () {

    function f(n) {    // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    Date.prototype.toJSON = function () {

// Eventually, this method will be based on the date.toISOString method.

        return this.getUTCFullYear()   + '-' +
             f(this.getUTCMonth() + 1) + '-' +
             f(this.getUTCDate())      + 'T' +
             f(this.getUTCHours())     + ':' +
             f(this.getUTCMinutes())   + ':' +
             f(this.getUTCSeconds())   + 'Z';
    };


	function isISODate (v) {
		return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}){0,1}Z$/.test(v); 
	}


	function ISO2Date (v) {
		var ret = new Date();
		ret.setFullYear(v.substring(0,4));
		ret.setMonth(parseInt(v.substring(5,7),10)-1);
		ret.setDate(v.substring(8,10));
		ret.setHours(v.substring(11,13));
		ret.setMinutes(v.substring(14,16));
		ret.setSeconds(v.substring(17,19));
		return ret;
	}


    var m = {    // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };

    function stringify(value, whitelist) {
        var a,          // The array holding the partial texts.
            i,          // The loop counter.
            k,          // The member key.
            l,          // Length.
            r = /["\\\x00-\x1f\x7f-\x9f]/g,
            v;          // The member value.

        switch (typeof value) {
        case 'string':

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe sequences.

            return r.test(value) ?
                '"' + value.replace(r, function (a) {
                    var c = m[a];
                    if (c) {
                        return c;
                    }
                    c = a.charCodeAt();
                    return '\\u00' + Math.floor(c / 16).toString(16) +
                                               (c % 16).toString(16);
                }) + '"' :
                '"' + value + '"';

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':
            return String(value);

        case 'object':

// Due to a specification blunder in ECMAScript,
// typeof null is 'object', so watch out for that case.

            if (!value) {
                return 'null';
            }

// If the object has a toJSON method, call it, and stringify the result.

            if (typeof value.toJSON === 'function') {
                return stringify(value.toJSON());
            }
            a = [];
            if (typeof value.length === 'number' &&
                    !(value.propertyIsEnumerable('length'))) {

// The object is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                l = value.length;
                for (i = 0; i < l; i += 1) {
                    a.push(stringify(value[i], whitelist) || 'null');
                }

// Join all of the elements together and wrap them in brackets.

                return '[' + a.join(',') + ']';
            }
            if (whitelist) {

// If a whitelist (array of keys) is provided, use it to select the components
// of the object.

                l = whitelist.length;
                for (i = 0; i < l; i += 1) {
                    k = whitelist[i];
                    if (typeof k === 'string') {
                        v = stringify(value[k], whitelist);
                        if (v) {
                            a.push(stringify(k) + ':' + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (typeof k === 'string') {
                        v = stringify(value[k], whitelist);
                        if (v) {
                            a.push(stringify(k) + ':' + v);
                        }
                    }
                }
            }

// Join all of the member texts together and wrap them in braces.

            return '{' + a.join(',') + '}';
        }
    }
   
// base filter function
// it converts ISO date strings to Date objects:
    
    function baseFilter (k,v) {
		if (typeof(v) != 'string' || !Passpack.JSON.isISODate(v)) return v;
		return Passpack.JSON.ISO2Date(v);
	}


    return {

// Passpack additional methods:
        isISODate: isISODate,
        ISO2Date: ISO2Date,
        baseFilter: baseFilter,

// standard methods:
        stringify: stringify,
        parse: function (text, filter) {
            var j;

            function walk(k, v) {
                var i, n;
                if (v && typeof v === 'object') {
                    for (i in v) {
                        if (Object.prototype.hasOwnProperty.apply(v, [i])) {
                            n = walk(i, v[i]);
                            if (n !== undefined) {
                                v[i] = n;
                            }
                        }
                    }
                }
                return filter(k, v);
            }


// Parsing happens in three stages. In the first stage, we run the text against
// regular expressions that look for non-JSON patterns. We are especially
// concerned with '()' and 'new' because they can cause invocation, and '='
// because it can cause mutation. But just to be safe, we want to reject all
// unexpected forms.

// We split the first stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace all backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.test(text.replace(/\\./g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the second stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional third stage, we recursively walk the new structure, passing
// each name/value pair to a filter function for possible transformation.


				if (!filter) filter = Passpack.JSON.baseFilter;

                return typeof filter === 'function' ? walk('', j) : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('parseJSON');
        }
    };
}();





/******************************** HASH ************************/


/* A JavaScript implementation of the Secure Hash Algorithm, SHA-256
 * Version 0.3 Copyright Angel Marin 2003-2004 - http://anmar.eu.org/
 * Distributed under the BSD License
 * Some bits taken from Paul Johnston's SHA-1 implementation
 */
 
// Modified 12 december 2006 by Francesco Sullo (www.sullof.com) in order to incapsulate the functions S, R, Ch, etc.
 
 
Passpack.crypt.SHA256 = {
	
	chrsz: 8,  /* bits per input character. 8 - ASCII; 16 - Unicode  */

	safe_add: function  (x, y) {
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}
	,
	
	S: function (X, n) {return ( X >>> n ) | (X << (32 - n));},
	R: function (X, n) {return ( X >>> n );},
	Ch: function (x, y, z) {return ((x & y) ^ ((~x) & z));},
	Maj: function (x, y, z) {return ((x & y) ^ (x & z) ^ (y & z));},
	Sigma0256: function (x) {return (this.S(x, 2) ^ this.S(x, 13) ^ this.S(x, 22));},
	Sigma1256: function (x) {return (this.S(x, 6) ^ this.S(x, 11) ^ this.S(x, 25));},
	Gamma0256: function (x) {return (this.S(x, 7) ^ this.S(x, 18) ^ this.R(x, 3));},
	Gamma1256: function (x) {return (this.S(x, 17) ^ this.S(x, 19) ^ this.R(x, 10));},
	
	core_sha256: function  (m, l) {
		var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
		var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
		var W = new Array(64);
		var a, b, c, d, e, f, g, h, i, j;
		var T1, T2;
		/* append padding */
		m[l >> 5] |= 0x80 << (24 - l % 32);
		m[((l + 64 >> 9) << 4) + 15] = l;
		for ( var i = 0; i<m.length; i+=16 ) {
			a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
			for ( var j = 0; j<64; j++) {
				if (j < 16) W[j] = m[j + i];
				else W[j] = this.safe_add(this.safe_add(this.safe_add(this.Gamma1256(W[j - 2]), W[j - 7]), this.Gamma0256(W[j - 15])), W[j - 16]);
				T1 = this.safe_add(this.safe_add(this.safe_add(this.safe_add(h, this.Sigma1256(e)), this.Ch(e, f, g)), K[j]), W[j]);
				T2 = this.safe_add(this.Sigma0256(a), this.Maj(a, b, c));
				h = g; g = f; f = e; e = this.safe_add(d, T1); d = c; c = b; b = a; a = this.safe_add(T1, T2);
			}
			HASH[0] = this.safe_add(a, HASH[0]); HASH[1] = this.safe_add(b, HASH[1]); HASH[2] = this.safe_add(c, HASH[2]); HASH[3] = this.safe_add(d, HASH[3]); HASH[4] = this.safe_add(e, HASH[4]); HASH[5] = this.safe_add(f, HASH[5]); HASH[6] = this.safe_add(g, HASH[6]); HASH[7] = this.safe_add(h, HASH[7]);
		}
		return HASH;
	},
	
	str2binb: function (str) {
	  var bin = Array();
	  var mask = (1 << this.chrsz) - 1;
	  for(var i = 0; i < str.length * this.chrsz; i += this.chrsz)
		bin[i>>5] |= (str.charCodeAt(i / this.chrsz) & mask) << (24 - i%32);
	  return bin;
	},
	
	binb2hex: function (binarray) {
	  var hexcase = 0; /* hex output format. 0 - lowercase; 1 - uppercase */
	  var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
	  var str = "";
	  for (var i = 0; i < binarray.length * 4; i++) {
		str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) + hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
	  }
	  return str;
	},
	calchex: function (s){return this.binb2hex(this.core_sha256(this.str2binb(s),s.length * this.chrsz));}
};



// utilities:


Passpack.utils.extend({


	getBits: function (passphrase) {

// inspired by Keepass (http://keepass.info/)

		if (!passphrase) return 0;
		var cset = [], ci = [0,32,33,47,48,57,58,64,65,90,91,96,97,122,123,126,126,255,256,65535], 
			t, ok, factor, df, vdf = [], vcc = [], el=0, bpc, ext, exdf;
		for (var i=0;i<passphrase.length;i++) {
			factor = 1;
			ok = 0;
			t = passphrase.charCodeAt(i);
			for (var j=0;j<ci.length;j+=2) {
				var cc = ci[j];
				if (t>=ci[j] && t<=ci[j+1]) {
					cset[''+j] = ci[j+1]-ci[j];
					ok = 1;
					break;
				}
			}
			if (!ok) cset['x'] = 65280;
			if (i >= 1) {
				df = t - ext;
				if (exdf == df) vdf[df] = 1;
				else {
					vdf[df] = (vdf[df]?vdf[df]:0) + 1;
					factor /= vdf[df];
				}
			}
			if (!vcc[t]) {
				vcc[t] = 1;
				el += factor;
			}
			else el += factor * (1 / ++vcc[t]);
			exdf = df;
			ext = t;	
		}
		var tot = 0;
		for (var i in cset) if (!isNaN(parseInt(i,10))) tot += cset[i];
		if (!tot) return 0;
		return Math.ceil(el * Math.log(tot) / Math.log(2));
	},

	charMatrix: {
		lcase: [97,122],
		ucase: [65,90],
		nums: [48,57],
		symb: [33,33,35,47,58,64,91,96,123,126],
		space: [161,254]
	},
	
	passGenerator: function (chars,n) {
		var str = "";
		for (var j in chars) {
			var M = Passpack.charMatrix[j];
			for (var u=0;u<M.length;u+=2) {
				for (var y=M[u];y<=M[u+1];y++) {
					str += String.fromCharCode(y);
				}
			}
		}
		var pass = '';
		if (str) {
			var l = str.length,
				p = 0;
			for (p=0;p<n;) {
				v = Math.floor(Math.random() * l);
				if (v == l) continue;
				var c = str.substring(v,v+1);
				pass += c;
				p++;
			}
		}
		return pass;
	},	
	
	simplePassGenerator: function (n) {
		return Passpack.HTP.utils.passGenerator({
				lcase: 1,
				ucase: 1,
				nums: 1
			},n?n:16);
	},
	
	genRandomKey: function (x, salt) {
		var l = x && x < 64 ? x : 64,
			ret = Passpack.hashx((salt ? salt : '') + 
				Passpack.utils.passGenerator({
					lcase: 1,
					ucase: 1, 
					nums: 1, 
					symb: 1, 
					space: 1
				},256),'',64)
				.substring(0,l);
		return ret;
	},
	
	getArrayFromHexString: function (hexstr,n) {
		var ret = [], x;
		if (!n) n = hexstr.length;
		for (var j=0;j<n;j+=2) {
			x = hexstr.substring(j,j+2);
			if (!x) return null;
			ret.push(parseInt(x,16));
		}
		return ret;
	},
	
		
	hashx: function (str,nohex,full) {
		var s = Passpack.crypt.SHA256.calchex(str),
			ss = "";
		if (!full) for (var j=0;j<64;j+=4) ss += s.substring(j,j+2);
		else ss = s;
		return nohex ? Passpack.utils.getStringFromHex(ss) : ss;
	},
	
	getStringFromHex: function (str,n) {
		if (!str) return '';
		var h = '';
		var t = n?str.length:32;
		for (var j=0;j<t;j=j+2) h += String.fromCharCode(parseInt(str.substring(j,j+2),16));
		return h;
	}

});

