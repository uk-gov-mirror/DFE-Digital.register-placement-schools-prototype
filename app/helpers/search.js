const {
  getRegionOptions,
  getRegionLabel,
  getSchoolTypeOptions,
  getSchoolTypeLabel,
  getSchoolGroupOptions,
  getSchoolGroupLabel,
  getSchoolStatusOptions,
  getSchoolStatusLabel,
  getSchoolEducationPhaseOptions,
  getSchoolEducationPhaseLabel
} = require('./gias')

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

const asInt = (v, fallback) => {
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

// --- selected filters (UI) builder ------------------------------------------

/**
 * Build the selected filters structure from a config + selected values.
 * @param {Array<{
 *   key: string,
 *   heading: string,
 *   selected: string[]|undefined,
 *   labelGetter: (code: string) => Promise<string>,
 *   removeHref: (code: string) => string
 * }>} groups
 */
const buildSelectedFilters = async (groups) => {
  const categories = []

  for (const g of groups) {
    if (!g.selected?.length) continue
    const items = await Promise.all(
      g.selected.map(async (code) => ({
        text: await g.labelGetter(code),
        href: g.removeHref(code)
      }))
    )
    categories.push({ heading: { text: g.heading }, items })
  }

  return categories.length ? { categories } : null
}

// --- filter parsing ----------------------------------------------------------

/**
 * From req.session.data.filters, normalise to arrays we can pass to queries
 * without throwing if keys are missing. Leaves “radius” as string (single).
 * @param {*} filters
 */
const parseFilters = (filters = {}) => ({
  // location mode
  radius: filters.radius ?? null,
  schoolType: Array.isArray(filters.schoolType) ? filters.schoolType : (filters.schoolType ? [filters.schoolType] : []),
  schoolGroup: Array.isArray(filters.schoolGroup) ? filters.schoolGroup : (filters.schoolGroup ? [filters.schoolGroup] : []),
  schoolStatus: Array.isArray(filters.schoolStatus) ? filters.schoolStatus : (filters.schoolStatus ? [filters.schoolStatus] : []),
  schoolEducationPhase: Array.isArray(filters.schoolEducationPhase) ? filters.schoolEducationPhase : (filters.schoolEducationPhase ? [filters.schoolEducationPhase] : []),

  // provider mode
  region: Array.isArray(filters.region) ? filters.region : (filters.region ? [filters.region] : [])
})

/**
 * True if any filter arrays have content (or radius provided).
 */
const hasAnyFilters = (f, keys) =>
  keys.some((k) => Array.isArray(f[k]) ? f[k].length > 0 : Boolean(f[k]))

// --- option lists fetcher ----------------------------------------------------

const fetchFilterOptions = async (mode) => {
  // shared
  const [
    filterSchoolTypeItems,
    filterSchoolGroupItems,
    filterSchoolStatusItems,
    filterSchoolEducationPhaseItems
  ] = await Promise.all([
    getSchoolTypeOptions(),
    getSchoolGroupOptions(),
    getSchoolStatusOptions(),
    getSchoolEducationPhaseOptions()
  ])

  if (mode === 'location') {
    const filterRadiusItems = await getRadiusOptions()
    return {
      filterRadiusItems,
      filterSchoolTypeItems,
      filterSchoolGroupItems,
      filterSchoolStatusItems,
      filterSchoolEducationPhaseItems
    }
  }

  if (mode === 'provider') {
    const filterRegionItems = await getRegionOptions()
    return {
      filterRegionItems,
      filterSchoolTypeItems,
      filterSchoolGroupItems,
      filterSchoolStatusItems,
      filterSchoolEducationPhaseItems
    }
  }

  return {}
}

// --- per-mode configs for selected-filters UI --------------------------------

const locationSelectedFilterConfig = (sel) => ([
  // If you re-enable radius chips, uncomment this block
  // {
  //   key: 'radius',
  //   heading: 'Search radius',
  //   selected: sel.radius ? [sel.radius] : [],
  //   labelGetter: getRadiusLabel,
  //   removeHref: (code) => `/results/remove-radius-filter/${code}`
  // },
  {
    key: 'schoolGroup',
    heading: 'School group',
    selected: sel.schoolGroup,
    labelGetter: getSchoolGroupLabel,
    removeHref: (code) => `/results/remove-school-group-filter/${code}`
  },
  {
    key: 'schoolType',
    heading: 'School type',
    selected: sel.schoolType,
    labelGetter: getSchoolTypeLabel,
    removeHref: (code) => `/results/remove-school-type-filter/${code}`
  },
  {
    key: 'schoolEducationPhase',
    heading: 'School education phase',
    selected: sel.schoolEducationPhase,
    labelGetter: getSchoolEducationPhaseLabel,
    removeHref: (code) => `/results/remove-school-education-phase-filter/${code}`
  },
  {
    key: 'schoolStatus',
    heading: 'School status',
    selected: sel.schoolStatus,
    labelGetter: getSchoolStatusLabel,
    removeHref: (code) => `/results/remove-school-status-filter/${code}`
  }
])

const providerSelectedFilterConfig = (sel) => ([
  {
    key: 'region',
    heading: 'Region',
    selected: sel.region,
    labelGetter: getRegionLabel,
    removeHref: (code) => `/results/remove-region-filter/${code}`
  },
  {
    key: 'schoolGroup',
    heading: 'School group',
    selected: sel.schoolGroup,
    labelGetter: getSchoolGroupLabel,
    removeHref: (code) => `/results/remove-school-group-filter/${code}`
  },
  {
    key: 'schoolType',
    heading: 'School type',
    selected: sel.schoolType,
    labelGetter: getSchoolTypeLabel,
    removeHref: (code) => `/results/remove-school-type-filter/${code}`
  },
  {
    key: 'schoolEducationPhase',
    heading: 'School education phase',
    selected: sel.schoolEducationPhase,
    labelGetter: getSchoolEducationPhaseLabel,
    removeHref: (code) => `/results/remove-school-education-phase-filter/${code}`
  },
  {
    key: 'schoolStatus',
    heading: 'School status',
    selected: sel.schoolStatus,
    labelGetter: getSchoolStatusLabel,
    removeHref: (code) => `/results/remove-school-status-filter/${code}`
  }
])

module.exports = {
  getCheckboxValues,
  removeFilter,
  getRadiusOptions,
  getRadiusLabel,
  asInt,
  buildSelectedFilters,
  parseFilters,
  hasAnyFilters,
  fetchFilterOptions,
  locationSelectedFilterConfig,
  providerSelectedFilterConfig
}
