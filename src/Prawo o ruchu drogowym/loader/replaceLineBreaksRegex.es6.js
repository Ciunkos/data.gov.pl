// https://regex101.com/r/xVne5D/1/
export default /((\p{Ll}|,|\.)\s*?)(\n)(\s*?\p{Ll}{2}|\p{Ll}{1} )/gu

// substitution:
// "$2 $4"