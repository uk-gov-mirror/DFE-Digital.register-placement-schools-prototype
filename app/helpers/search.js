const getCheckboxValues = (name, data) => {
  return name && (Array.isArray(name)
    ? name
    : [name].filter((name) => {
        return name !== '_unchecked'
      })) || data && (Array.isArray(data) ? data : [data])
}

const removeFilter = (value, data) => {
  if (Array.isArray(data)) {
    return data.filter(item => item !== value)
  } else {
    return null
  }
}

const radii = [
  {
    id: '9ac0ef3d-e54c-4838-8921-7fb0fcb19934',
    name: '10 miles',
    code: '10'
  },
  {
    id: '5aff0aa3-701d-481d-931a-dd1040c0fbb5',
    name: '25 miles',
    code: '25'
  },
  {
    id: '45065bec-1e77-47f8-a246-17cb06d31ac9',
    name: '50 miles',
    code: '50'
  }
]

const getRadiusOptions = async () => {
  return radii.map(row => ({
    text: row.name,
    value: row.code,
    id: row.id
  }))
}

const getRadiusLabel = async (code) => {
  const row = radii.find(r => r.code === code)
  return row?.name || `Unknown (${code})`
}

module.exports = {
  getCheckboxValues,
  removeFilter,
  getRadiusOptions,
  getRadiusLabel
}
