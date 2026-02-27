const fs = require('fs')
const path = require('path')

const stringsDir = path.join(__dirname, '..', 'strings')

function sortObjectKeysAscii(obj) {
  const out = {}
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      out[key] = obj[key]
    })
  return out
}

function sortJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  const sorted = sortObjectKeysAscii(parsed)
  fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + '\n')
}

function main() {
  const files = fs.readdirSync(stringsDir).filter((name) => name.endsWith('.json'))
  files.forEach((name) => {
    sortJsonFile(path.join(stringsDir, name))
  })
  console.log(`Sorted ${files.length} translation files`) 
}

main()
