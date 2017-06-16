const renderProperties = props =>
    (props && Object.entries(props)
    // .filter(([key, value]) => value)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')) || ''

const renderChildren = children =>
    children && Array.isArray(children)
    ? children.join('\n')
    : children

const indent = (indentation, text) =>
    `${' '.repeat(indentation)}${text}`

const createElement = indentation => tag => props => children =>
    children && children.length > 0
    ? indent(indentation, `<${tag} ${renderProperties(props)}>\n${renderChildren(children)}\n${indent(indentation, `</${tag}>`)}`)
    : indent(indentation, `<${tag} ${renderProperties(props)}/>`)

const toJsxString = (data, indentation = 0) => {
    const renderType = (data) => {
        if (!data) {
            return ''
        } else if (typeof data === 'string') {
            return data
        } else if (Array.isArray(data)) {
            return data.map(x => toJsxString(x, indentation)).join('\n')
        } else if (typeof data === 'object') {
            return createElement(indentation)(data.type)(data.props)(
                toJsxString(data.children, indentation + 2)
            )
        }
        return ''
    }

    return renderType(data)
}

export default toJsxString
