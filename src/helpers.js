function getBit(byte, bit) {
    return !!(byte & Math.pow(2, bit));
}
module.exports.getBit = getBit;
module.exports.parseBitmap = function parseBitmap(bitmap, keys) {
    return keys.reduce((obj, key, bitIndex) => {
        obj[key] = getBit(bitmap, bitIndex)
        return obj;
    }, {});

}

function onesComplement(vals) {
    const sum = Array.isArray(vals) ?
        vals.reduce((sum, val) => sum += val, 0)
        : vals;

    // Return one's complement of the sum
    return ~sum & ~(Number.MAX_SAFE_INTEGER - 255)
}
module.exports.onesComplement = onesComplement;

function getValFromHex(buffer, offset, bytes = 2) {
    const hex = buffer.slice(offset, offset + bytes)
        .map(val => String.fromCharCode(val)).join('')
    return parseInt(hex, 16)
} module.exports.getValFromHex = getValFromHex;