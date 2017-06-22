import fs from 'fs'
import path from 'path'

import data from './index'

const ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath)
    if (fs.existsSync(dirname)) {
        return true
    }
    ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)

    return true
}


Object.entries(data).forEach(([key, value]) => {
    const destination = `./dist/${key}.json`
    ensureDirectoryExistence(destination)
    fs.writeFileSync(destination, JSON.stringify(value, null, 2))
});
