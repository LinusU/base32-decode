function createAlphabet (str) {
  var lookup = {}
  for (var i = 0; i < str.length; i++) {
    lookup[str.charAt(i)] = i
  }
  return lookup
}

var RFC4648 = createAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ234567')
var RFC4648_HEX = createAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUV')
var CROCKFORD = Object.assign(
  createAlphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'),
  createAlphabet('0123456789ABCDEFGHJKMNPQRSTVWXYZ'.toLowerCase()),
  {
    'o': 0,
    'O': 0,
    'i': 1,
    'I': 1,
    'l': 1,
    'L': 1
  }
)

function readChar (alphabet, char) {
  var idx = alphabet[char]

  if (idx === undefined) {
    throw new Error('Invalid character found: ' + char)
  }

  return idx
}

module.exports = function base32Decode (input, variant) {
  var alphabet

  switch (variant) {
    case 'RFC3548':
    case 'RFC4648':
      alphabet = RFC4648
      input = input.replace(/=+$/, '')
      break
    case 'RFC4648-HEX':
      alphabet = RFC4648_HEX
      input = input.replace(/=+$/, '')
      break
    case 'Crockford':
      alphabet = CROCKFORD
      input = input.replace(/-+|([*~$=u]$)/ig, '')
      break
    default:
      throw new Error('Unknown base32 variant: ' + variant)
  }

  var length = input.length

  var bits = 0
  var value = 0

  var index = 0
  var output = new Uint8Array((length * 5 / 8) | 0)

  for (var i = 0; i < length; i++) {
    value = (value << 5) | readChar(alphabet, input[i])
    bits += 5

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255
      bits -= 8
    }
  }

  return output.buffer
}
