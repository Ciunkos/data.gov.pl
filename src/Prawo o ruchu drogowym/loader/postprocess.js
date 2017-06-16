const filterObject = obj => 
    Object.entries(obj)
    .filter(x => x[1] !== undefined)
     .reduce((acc, curr) => ({ ...acc, [curr[0]]: curr[1] }), {})

const visit = (node, traverse) => {
    if (node.props.title && (
        node.props.title === '(uchylony)' ||
        node.props.title === '(uchylona)' ||
        node.props.title === '(pominięty)' ||
        node.props.title === '(utracił moc)'
    )) {
        return {
            ...node,
            props: filterObject({
                ...node.props,
                // title: undefined,
                annulled: true
            }),
            children: traverse(node.children)
        }
    }
    return {
        ...node,
        children: traverse(node.children)
    }
}

const traverse = (data) => {
    if (!data) {
        return data
    } else if (typeof data === 'string') {
        return visit(data, traverse)
    } else if (Array.isArray(data)) {
        return data.map(traverse).filter(x => x !== undefined)
    } else if (typeof data === 'object') {
        return visit(data, traverse)
    }
    return data
}

export default traverse
