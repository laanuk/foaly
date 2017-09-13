var xmlrpc = require('xmlrpc')
var processor = require('./processor')

var Tagger = function (options) {
  options = options || {}

  var _client = xmlrpc.createClient({
    host: options.host || 'localhost',
    port: options.port || 9000,
    path: '/'
  })

  /**
   * Issues an API call to Stanford POS Tagging service to POS tag text.
   *
   * @param string str
   *   A blob of text to tag.
   *
   * @return Object
   * Stanford POS output and the preliminary bmc model and sample question
   */
  this.tag = function (str, cb) {
    // TODO: Remove this when I feel like dealing with puncuation
    // Remove puncuation
    str = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')

    _client.methodCall('tagger.runTagger', [str], function (err, resp) {
      if (err) {
        return cb(err)
      } else {
        return processor.process(resp, cb)
      }
    })
  }
}

module.exports.Tagger = Tagger
