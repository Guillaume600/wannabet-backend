const express = require('express')
const router = express.Router()

router.get('/', (req, res) => {
    res.json({result: true, message: 'hello'})
})

module.exports = router