const getFeedbackRatingLabel = (code) => {
  if (!code) {
    return null
  }

  let label = code

  switch (code) {
    case '1':
      label = 'Very dissatisfied'
      break
    case '2':
      label = 'Dissatisfied'
      break
    case '3':
      label = 'Neither satisfied nor dissatisfied'
      break
    case '4':
      label = 'Satisfied'
      break
    case '5':
      label = 'Very satisfied'
      break
  }

  return label
}

module.exports = {
  getFeedbackRatingLabel
}
