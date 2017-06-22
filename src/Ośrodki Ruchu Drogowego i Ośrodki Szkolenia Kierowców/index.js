import cheerio from 'cheerio'

import sources from './source'

// https://regex101.com/r/8exTuS/1
const wordRegex = /^([W|M|P]ORD.*?$)\n(.*?)$/gm

// https://regex101.com/r/9ts474/1
const oskRegex = /(.*?)\n(.*?)\nNIP: (.*?)\n\n/gm

// https://regex101.com/r/s3D6kU/4
const addressRegex = /^(.*?)(\d{2}-\d{3})?, (\d*.*?\w*?)((\d+?|[A-Z]\/).*?)?$/g

const allMatches = regex => (string) => {
    const re = regex

    const traverse = () => {
        const matches = re.exec(string)
        return matches ? [matches.slice(1), ...traverse()] : []
    }

    return traverse();
}

const toTitleCase = (string) => {
    const changeCasing = string =>
        [...string]
        .map((x, index) => index === 0 ? x.toUpperCase() : x.toLowerCase())
        .join('')

    const words = string
        .split(' ')
        .map(x => x.trim())
        .filter(x => x)
        .map(changeCasing)
        .join(' ')

    return words
}

const processAddress = (string) => {
    const matches = allMatches(addressRegex)(string)[0]
    if (!matches || matches.length < 4) {
        return null
    }

    // due to regex issue match 2 & 3 may yeild numbers when there is no street name
    const areNumbers = (+matches[2] == matches[2])
    const street = areNumbers ? undefined : matches[2]
    const streetNumber = areNumbers ? [matches[2], matches[3]].join('') : matches[3]

    const finalStreet = {
        ...(street ? { name: toTitleCase(street) } : {}),
        ...(streetNumber ? { number: streetNumber } : {})
    }

    return ({
        city: toTitleCase(matches[0]),
        zipCode: matches[1],
        ...(finalStreet ? { street: finalStreet } : {}),
    })
}

const multipleMultilines = /\n\n*/gm

const process = (source) => {
    const $ = cheerio.load(source)

    const state = $('.woj').text()

    const words = $('#words dl *').map(function () {
        return $(this).text();
    })
    .get()
    .join('\n')
    .replace(multipleMultilines, '\n')

    const processedWords = allMatches(wordRegex)(words).map(x =>
        ({
            name: x[0],
            address: x[1]
        })
    )

    const osks = $('#osk dl *').map(function () {
        return `${this.tagName === 'dt' ? '\n' : ''}${$(this).text()}`;
    })
    .get()
    .join('\n')

    const processedOsks = allMatches(oskRegex)(osks).map(x =>
        ({
            name: x[0],
            address: processAddress(x[1]),
            nip: x[2]
        })
    )

    return {
        name: state,
        words: processedWords,
        osks: processedOsks
    }
}

const result = Object.values(sources).map(process)

export default result
