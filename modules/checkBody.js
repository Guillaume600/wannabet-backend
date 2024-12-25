const checkBody = (body, params) => {
    let isValid = true
    for (let key of params) {
        if (!body[key] || body[key] === '') {
            isValid = false
        }
    }
    return isValid
}

module.exports = checkBody