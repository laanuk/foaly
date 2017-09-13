const express = require('express')
const app = express()
const logger = require('winston')
const bodyParser = require('body-parser')

const Tagger = require('./tagger').Tagger

const options = {
  port: process.env.STANFORD_POSTAGGER_PORT || '9000',
  host: process.env.STANFORD_POSTAGGER_HOST || 'localhost'
}

const tagger = new Tagger(options)

app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({'extended': 'true'}))
app.use(bodyParser.json())

app.get('*', function (req, res) {
  res.sendfile('./public/app.html')
})

app.post('/api/bmc', function (req, res) {
  var input = req.body.text
  if (!input || input.length === 0) {
    res.send('invalid input')
  } else {
    tagger.tag(input, function (err, resp) {
      if (err) {
        logger.warn('An error occurred tagging the input', {err: err})
        res.json({status: 'error', output: err})
      }
      logger.info('Processed input', {output: resp})
      res.json({status: 'success', output: resp})
    })
  }
})

function onStart () {
  app.listen(8000)
  logger.info('Server started on port 8000')
}

onStart()
