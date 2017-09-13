var logger = require('winston')

/**
 * Converts POS tagged input into bmc model object and generates a sample question.
 *
 * @param string taggedStr
 *   A POS tagged string.
 *
 * @return Object
 * Stanford POS output and the preliminary bmc model and sample question
 * bmc object format
 * bmc {
     metrics: [
       {
         subject: main subject
         descriptor: quality of the main subject
         justification: backing for the metric's description
       }
     ]
   }
 */
exports.process = function (taggedStr, cb) {
  taggedStr = taggedStr.replace(/\n/g, '')

  let tags = taggedStr.split(' ')
  let words = []
  let wordTags = []
  for (let tag of tags) {
    let splitIndex = tag.indexOf('_')
    words.push(tag.substring(0, splitIndex))
    wordTags.push(tag.substring(splitIndex + 1))
  }

  let bmc = {}
  // test against every rule until a match is found
  for (let rule of rules) {
    let result = rule(words, wordTags, bmc)
    if (result) {
      return cb(null, {taggedStr: taggedStr, bmc: result.bmc, question: result.question})
    }
  }

  cb(null, {taggedStr: taggedStr, bmc: bmc, question: 'No question could be generated'})
}

const rules = [
  comp
]

// handles comparative statements (adjectives, adverbs)
function comp (words, wordTags, bmc) {
  extractObject(0, words, wordTags, bmc)

  let question = 'No question could be generated'
  // check if justification exists, if not ask for it
  if (bmc.metrics[0].subject && !bmc.metrics[0].justification) {
    if (bmc.metrics[0].descriptor) {
      question = 'How did you achieve a ' + bmc.metrics[0].descriptor.join(' ') + ' ' + bmc.metrics[0].subject.join(' ') + '?'
    } else {
      question = 'How did you achieve ' + bmc.metrics[0].subject.join(' ') + '?'
    }
  }
  return ({bmc: bmc, question: question})
}

// given an index in the input, extract the main noun phrase from that point in the string with its description
// "Higher filtration performance", the index given is 0, the noun phrase is filtration performance and the description is better
function extractObject (index, words, wordTags, bmc) {
  // comp keys
  let compKeys = ['JJ', 'JJR', 'JJS', 'RB', 'RBR', 'RBS']
  let metric = {}
  metric.descriptor = []
  metric.subject = []

  // noun keys
  let objectKeys = ['NN', 'NNS', 'NNP', 'NNPS']
  for (let i = index; i < words.length; i++) {
    if (compKeys.includes(wordTags[i])) {
      metric.descriptor.push(words[i])
    }
    if (objectKeys.includes(wordTags[i])) {
      metric.subject.push(words[i])
    }
  }
  bmc.metrics = [metric]
}
