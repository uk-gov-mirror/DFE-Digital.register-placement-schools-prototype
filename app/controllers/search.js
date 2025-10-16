const { Op } = require('sequelize')

const {
  Provider,
  School
} = require('../models')

const {
  getPlaceDetails,
  getPlaceSuggestions
} = require('../services/googleMaps')

const {
  getPlacementSchoolDetails,
  getPlacementSchoolsByLocation,
  getPlacementSchoolsForProvider
} = require('../services/placementSchoolSearch')

const {
  removeFilter,
  asInt,
  buildSelectedFilters,
  parseFilters,
  hasAnyFilters,
  fetchFilterOptions,
  locationSelectedFilterConfig,
  providerSelectedFilterConfig,
  csvEscape,
  formatAgeRange,
  kmToMiles,
  normaliseAcademicYears
} = require('../helpers/search')

exports.search_get = async (req, res) => {
  delete req.session.data.search
  delete req.session.data.filters
  delete req.session.data.keywords
  delete req.session.data.q
  delete req.session.data.location
  delete req.session.data.provider
  delete req.session.data.school

  const q = req.session.data.q || req.query.q

  res.render('search/index', {
    q,
    actions: {
      continue: '/search'
    }
  })
}

exports.search_post = async (req, res) => {
  const q = req.session.data.q || req.query.q
  const errors = []

  if (q === undefined) {
    const error = {}
    error.fieldName = "q"
    error.href = "#q"
    error.text = "Select find placement schools by location, school or training provider"
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/index', {
      q,
      errors,
      actions: {
        continue: '/search'
      }
    })
  } else {
    if (q === 'location') {
      res.redirect('/search/location')
    } else if (q === 'provider') {
      res.redirect('/search/provider')
    } else if (q === 'school') {
      res.redirect('/search/school')
    } else {
      res.send('Page not found')
    }
  }
}

exports.searchLocation_get = async (req, res) => {
  delete req.session.data.provider
  delete req.session.data.school

  const { search } = req.session.data

  res.render('search/location', {
    search,
    actions: {
      back: '/search',
      cancel: '/search',
      continue: '/search/location'
    }
  })
}

exports.searchLocation_post = async (req, res) => {
  const { search } = req.session.data
  const errors = []

  if (!search.length) {
    const error = {}
    error.fieldName = 'location'
    error.href = '#location'
    error.text = 'Enter a city, town or postcode'
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/location', {
      search,
      errors,
      actions: {
        back: '/search',
        cancel: '/search',
        continue: '/search/location'
      }
    })
  } else {
    res.redirect('/results')
  }
}

exports.searchSchool_get = async (req, res) => {
  delete req.session.data.location
  delete req.session.data.provider

  const { search } = req.session.data

  res.render('search/school', {
    search,
    actions: {
      back: '/search',
      cancel: '/search',
      continue: '/search/school'
    }
  })
}

exports.searchSchool_post = async (req, res) => {
  const { search } = req.session.data
  const errors = []

  if (!search.length) {
    const error = {}
    error.fieldName = 'school'
    error.href = '#school'
    error.text = 'Enter a school name, UKPRN or URN'
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/school', {
      search,
      errors,
      actions: {
        back: '/search',
        cancel: '/search',
        continue: '/search/school'
      }
    })
  } else {
    res.redirect('/results')
  }
}

exports.searchProvider_get = async (req, res) => {
  delete req.session.data.location
  delete req.session.data.school

  const { search } = req.session.data

  res.render('search/provider', {
    search,
    actions: {
      back: '/search',
      cancel: '/search',
      continue: '/search/provider'
    }
  })
}

exports.searchProvider_post = async (req, res) => {
  const { search } = req.session.data
  const errors = []

  if (!search.length) {
    const error = {}
    error.fieldName = 'provider'
    error.href = '#provider'
    error.text = 'Enter a provider name, UKPRN or URN'
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/provider', {
      search,
      errors,
      actions: {
        back: '/search',
        cancel: '/search',
        continue: '/search/provider'
      }
    })
  } else {
    res.redirect('/results')
  }
}

/**
 * GET /results
 * Renders search results for three modes: location, provider, school.
 * - Uses querystring `q` to switch mode.
 * - Reads progressive-enhancement state from req.query first, then req.session.data fallback.
 */
exports.results_get = async (req, res, next) => {
  try {
    const session = req.session?.data ?? {}
    const q = (req.query.q ?? session.q ?? '').toString()
    const page = asInt(req.query.page, 1)
    const limit = asInt(req.query.limit, 25)

    // shared "keywords" search text
    const keywords = (session.keywords ?? '').toString().trim()
    const hasSearch = keywords.length > 0

    if (q === 'location') {
      const filters = parseFilters(session.filters)
      // Defaults for UI state (don’t mutate filters)
      const selectedRadius = filters.radius ?? '10'
      const selectedSchoolType = filters.schoolType
      const selectedSchoolGroup = filters.schoolGroup
      const selectedSchoolStatus = filters.schoolStatus
      const selectedSchoolEducationPhase = filters.schoolEducationPhase

      const hasFilters = hasAnyFilters(filters, [
        // 'radius', // re-enable when radius chips are back
        'schoolType',
        'schoolGroup',
        'schoolStatus',
        'schoolEducationPhase'
      ])

      const selectedFilters = await buildSelectedFilters(
        locationSelectedFilterConfig(filters)
      )

      const {
        filterRadiusItems,
        filterSchoolTypeItems,
        filterSchoolGroupItems,
        filterSchoolStatusItems,
        filterSchoolEducationPhaseItems
      } = await fetchFilterOptions('location')

      const placeId = session.location?.id
      if (!placeId) return res.redirect('/search/location')

      const place = await getPlaceDetails(placeId)
      const lat = place?.geometry?.location?.lat
      const lng = place?.geometry?.location?.lng
      if (!(typeof lat === 'number' && typeof lng === 'number')) {
        return res.redirect('/search/location')
      }

      const { placements, pagination } = await getPlacementSchoolsByLocation(
        lat,
        lng,
        page,
        limit,
        selectedRadius,
        selectedSchoolType,
        selectedSchoolGroup,
        selectedSchoolStatus,
        selectedSchoolEducationPhase,
        keywords
      )

      return res.render('search/results-location', {
        location: { name: place.name, lat, lng },
        placements,
        pagination,
        keywords,
        hasSearch,
        hasFilters,
        selectedFilters,
        filterRadiusItems,
        filterSchoolTypeItems,
        filterSchoolGroupItems,
        filterSchoolStatusItems,
        filterSchoolEducationPhaseItems,
        selectedRadius,
        selectedSchoolType,
        selectedSchoolGroup,
        selectedSchoolStatus,
        selectedSchoolEducationPhase,
        actions: {
          newSearch: '/search',
          view: '/results',
          filters: { apply: '/results', remove: '/results/remove-all-filters' },
          search: { find: '/results', remove: '/results/remove-keyword-search' },
          download: '/results/location-download'
        }
      })
    }

    if (q === 'provider') {
      const filters = parseFilters(session.filters)
      const selectedRegion = filters.region
      const selectedSchoolType = filters.schoolType
      const selectedSchoolGroup = filters.schoolGroup
      const selectedSchoolStatus = filters.schoolStatus
      const selectedSchoolEducationPhase = filters.schoolEducationPhase

      const hasFilters = hasAnyFilters(filters, [
        'region',
        'schoolType',
        'schoolGroup',
        'schoolStatus',
        'schoolEducationPhase'
      ])

      const selectedFilters = await buildSelectedFilters(
        providerSelectedFilterConfig(filters)
      )

      const {
        filterRegionItems,
        filterSchoolTypeItems,
        filterSchoolGroupItems,
        filterSchoolStatusItems,
        filterSchoolEducationPhaseItems
      } = await fetchFilterOptions('provider')

      const providerId = session.provider?.id
      if (!providerId) return res.redirect('/search/provider')

      const { provider, placements, pagination } = await getPlacementSchoolsForProvider(
        providerId,
        page,
        limit,
        selectedRegion,
        selectedSchoolType,
        selectedSchoolGroup,
        selectedSchoolStatus,
        selectedSchoolEducationPhase,
        keywords
      )

      return res.render('search/results-provider', {
        provider,
        placements,
        pagination,
        keywords,
        hasSearch,
        hasFilters,
        selectedFilters,
        filterRegionItems,
        filterSchoolTypeItems,
        filterSchoolGroupItems,
        filterSchoolStatusItems,
        filterSchoolEducationPhaseItems,
        selectedRegion,
        selectedSchoolType,
        selectedSchoolGroup,
        selectedSchoolStatus,
        selectedSchoolEducationPhase,
        actions: {
          newSearch: '/search',
          view: '/results',
          filters: { apply: '/results', remove: '/results/remove-all-filters' },
          search: { find: '/results', remove: '/results/remove-keyword-search' },
          download: '/results/provider-download'
        }
      })
    }

    if (q === 'school') {
      const { search, school } = req.session.data ?? {}
      if (!school?.id) return res.redirect('/search/school')
      const placementSchool = await getPlacementSchoolDetails(school.id)

      return res.render('search/results-school', {
        q,
        search,
        placementSchool,
        actions: { newSearch: '/search' }
      })
    }

    // Unknown mode
    return res.status(404).send('Page not found - Results')
  } catch (err) {
    // Let your global error handler (or Express default) deal with it
    return next(err)
  }
}

exports.removeRegionFilter = (req, res) => {
  const { filters } = req.session.data
  filters.region = removeFilter(
    req.params.region,
    filters.region
  )
  res.redirect('/results')
}

exports.removeSchoolTypeFilter = (req, res) => {
  const { filters } = req.session.data
  filters.schoolType = removeFilter(
    req.params.schoolType,
    filters.schoolType
  )
  res.redirect('/results')
}

exports.removeSchoolGroupFilter = (req, res) => {
  const { filters } = req.session.data
  filters.schoolGroup = removeFilter(
    req.params.schoolGroup,
    filters.schoolGroup
  )
  res.redirect('/results')
}

exports.removeSchoolStatusFilter = (req, res) => {
  const { filters } = req.session.data
  filters.schoolStatus = removeFilter(
    req.params.schoolStatus,
    filters.schoolStatus
  )
  res.redirect('/results')
}

exports.removeSchoolEducationPhaseFilter = (req, res) => {
  const { filters } = req.session.data
  filters.schoolEducationPhase = removeFilter(
    req.params.schoolEducationPhase,
    filters.schoolEducationPhase
  )
  res.redirect('/results')
}

exports.removeAllFilters = (req, res) => {
  delete req.session.data.filters
  res.redirect('/results')
}

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/results')
}

/// ------------------------------------------------------------------------ ///
/// Autocomplete data
/// ------------------------------------------------------------------------ ///

exports.locationSuggestions_json = async (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  const query = req.query.search || ''

  if (!query || query.length < 2) {
    return res.json([])
  }

  try {
    const results = await getPlaceSuggestions(query)

    const suggestions = results.map((result) => ({
      text: result.description,
      value: result.place_id
    }))

    res.json(suggestions)
  } catch (err) {
    console.error(err)
    res.status(500).json([])
  }

}

exports.providerSuggestions_json = async (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  const query = req.query.search || ''

  const providers = await Provider.findAll({
    attributes: [
      'id',
      'operatingName',
      'legalName',
      'ukprn',
      'urn'
    ],
    where: {
      deletedAt: null,
      [Op.or]: [
        { operatingName: { [Op.like]: `%${query}%` } },
        { legalName: { [Op.like]: `%${query}%` } },
        { ukprn: { [Op.like]: `%${query}%` } },
        { urn: { [Op.like]: `%${query}%` } }
      ]
    },
    order: [['operatingName', 'ASC']]
  })

  res.json(providers)
}

exports.schoolSuggestions_json = async (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  const query = req.query.search || ''

  const schools = await School.findAll({
    attributes: [
      'id',
      'name',
      'ukprn',
      'urn'
    ],
    where: {
      deletedAt: null,
      [Op.or]: [
        { name: { [Op.like]: `%${query}%` } },
        { ukprn: { [Op.like]: `%${query}%` } },
        { urn: { [Op.like]: `%${query}%` } }
      ]
    },
    order: [['name', 'ASC']]
  })

  res.json(schools)
}

/// ------------------------------------------------------------------------ ///
/// Download data
/// ------------------------------------------------------------------------ ///

exports.locationDownload_csv = async (req, res, next) => {
  try {
    const session = req.session?.data ?? {}
    const q = (req.query.q ?? session.q ?? '').toString()

    // Only valid for the location search mode
    if (q !== 'location') {
      return res.status(400).send('Bad request: not a location search')
    }

    // Pull the same filters you use in results_get
    const filters = parseFilters(session.filters)
    const selectedRadius = filters.radius ?? '10'
    const selectedSchoolType = filters.schoolType
    const selectedSchoolGroup = filters.schoolGroup
    const selectedSchoolStatus = filters.schoolStatus
    const selectedSchoolEducationPhase = filters.schoolEducationPhase

    // Shared keywords text (if any)
    const keywords = (session.keywords ?? '').toString().trim()

    // Location details from your session flow
    const placeId = session.location?.id
    if (!placeId) return res.redirect('/search/location')

    const place = await getPlaceDetails(placeId)
    const lat = place?.geometry?.location?.lat
    const lng = place?.geometry?.location?.lng
    if (!(typeof lat === 'number' && typeof lng === 'number')) {
      return res.redirect('/search/location')
    }

    // Fetch ALL results (no pagination) — lift the limit to something big.
    const BIG_LIMIT = 10000
    const page = 1
    const limit = BIG_LIMIT

    const { placements } = await getPlacementSchoolsByLocation(
      lat,
      lng,
      page,
      limit,
      selectedRadius,
      selectedSchoolType,
      selectedSchoolGroup,
      selectedSchoolStatus,
      selectedSchoolEducationPhase,
      keywords
    )

    // Build CSV header (exact order requested)
    const header = [
      'school name',
      'ukprn',
      'urn',
      'school status',
      'school group',
      'school type',
      'education phase',
      'age range',
      'address line 1',
      'address line 2',
      'address line 3',
      'town',
      'county',
      'postcode',
      'distance (miles)',
      'academic years',
      'GIAS URL'
    ]

    // Map each placement to a row
    const rows = (placements ?? []).map(p => {
      // Be defensive about shape: data may live on p or p.school/placementSchool
      const s = p.school ?? p.placementSchool ?? p

      const name = s.name ?? s.schoolName ?? ''
      const ukprn = s.ukprn ?? s.UKPRN ?? ''
      const urn = s.urn ?? s.URN ?? ''

      const status = s.schoolStatus ?? s.status ?? ''
      const group = s.schoolGroup ?? s.group ?? ''
      const type = s.schoolType ?? s.type ?? ''
      const phase = s.educationPhase ?? s.phase ?? ''

      const ageRange = formatAgeRange(s.statutoryLowAge, s.statutoryHighAge)

      const addr = s.address ?? {}
      const line1 = addr.address1 ?? addr.line1 ?? ''
      const line2 = addr.address2 ?? addr.line2 ?? ''
      const line3 = addr.address3 ?? addr.line3 ?? ''
      const town  = addr.town ?? addr.locality ?? ''
      const county = addr.county ?? addr.administrativeArea ?? ''
      const postcode = addr.postcode ?? addr.postalCode ?? ''

      // Distance: prefer explicit miles otherwise convert km
      const distanceMiles =
        (typeof p.distanceMiles === 'number')
          ? p.distanceMiles.toFixed(2)
          : (typeof p.distanceKm === 'number')
              ? kmToMiles(p.distanceKm, 2)
              : (typeof p.distance === 'number') // if helper returns km as distance
                  ? kmToMiles(p.distance, 2)
                  : ''

      // Academic years: look in several places
      const academicYears =
        normaliseAcademicYears(p.academicYears ?? s.academicYears ?? s.years)

      const giasUrl = urn
        ? `https://get-information-schools.service.gov.uk/Establishments/Establishment/Details/${urn}`
        : ''

      return [
        name,
        ukprn,
        urn,
        status,
        group,
        type,
        phase,
        ageRange,
        line1,
        line2,
        line3,
        town,
        county,
        postcode,
        distanceMiles,
        academicYears,
        giasUrl
      ].map(csvEscape).join(',')
    })

    const csvHeader = header.map(csvEscape).join(',')
    const csvBody = rows.join('\r\n')
    const BOM = '\uFEFF' // Excel-friendly UTF-8
    const csv = `${BOM}${csvHeader}\r\n${csvBody}`

    const placeName = (place?.name ?? 'location')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()

    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(now).reduce((acc, p) => (acc[p.type] = p.value, acc), {})

    const filename = `rops-location-${placeName}-${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}.csv`
    res.setHeader('Content-Disposition', `attachment filename="${filename}"`)

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    return next(err)
  }
}

exports.providerDownload_csv = async (req, res, next) => {
  try {
    const session = req.session?.data ?? {}
    const q = (req.query.q ?? session.q ?? '').toString()

    if (q !== 'provider') {
      return res.status(400).send('Bad request: not a provider search')
    }

    const filters = parseFilters(session.filters)
    const selectedRegion = filters.region
    const selectedSchoolType = filters.schoolType
    const selectedSchoolGroup = filters.schoolGroup
    const selectedSchoolStatus = filters.schoolStatus
    const selectedSchoolEducationPhase = filters.schoolEducationPhase

    const keywords = (session.keywords ?? '').toString().trim()

    const providerId = session.provider?.id
    if (!providerId) return res.redirect('/search/provider')

    const BIG_LIMIT = 10000
    const page = 1
    const limit = BIG_LIMIT

    const { provider, placements } = await getPlacementSchoolsForProvider(
      providerId,
      page,
      limit,
      selectedRegion,
      selectedSchoolType,
      selectedSchoolGroup,
      selectedSchoolStatus,
      selectedSchoolEducationPhase,
      keywords
    )

    // Resolve a printable provider name once (used for the first column on every row)
    const pName = (provider?.operatingName || provider?.legalName || provider?.name || '').trim()

    // Build CSV header (exact order requested)
    const header = [
      'provider name',
      'school name',
      'ukprn',
      'urn',
      'school status',
      'school group',
      'school type',
      'education phase',
      'age range',
      'address line 1',
      'address line 2',
      'address line 3',
      'town',
      'county',
      'postcode',
      'academic years',
      'GIAS URL'
    ]

    const rows = (placements ?? []).map(p => {
      const s = p.school ?? p.placementSchool ?? p

      const sName = s.name ?? s.schoolName ?? ''
      const ukprn = s.ukprn ?? s.UKPRN ?? ''
      const urn = s.urn ?? s.URN ?? ''

      const status = s.schoolStatus ?? s.status ?? ''
      const group = s.schoolGroup ?? s.group ?? ''
      const type = s.schoolType ?? s.type ?? ''
      const phase = s.educationPhase ?? s.phase ?? ''

      const ageRange = formatAgeRange(s.statutoryLowAge, s.statutoryHighAge)

      const addr = s.address ?? {}
      const line1 = addr.address1 ?? addr.line1 ?? ''
      const line2 = addr.address2 ?? addr.line2 ?? ''
      const line3 = addr.address3 ?? addr.line3 ?? ''
      const town  = addr.town ?? addr.locality ?? ''
      const county = addr.county ?? addr.administrativeArea ?? ''
      const postcode = addr.postcode ?? addr.postalCode ?? ''

      const academicYears =
        normaliseAcademicYears(p.academicYears ?? s.academicYears ?? s.years)

      const giasUrl = urn
        ? `https://get-information-schools.service.gov.uk/Establishments/Establishment/Details/${urn}`
        : ''

      return [
        pName,
        sName,
        ukprn,
        urn,
        status,
        group,
        type,
        phase,
        ageRange,
        line1,
        line2,
        line3,
        town,
        county,
        postcode,
        academicYears,
        giasUrl
      ].map(csvEscape).join(',')
    })

    const csvHeader = header.map(csvEscape).join(',')
    const csvBody = rows.join('\r\n')
    const BOM = '\uFEFF'
    const csv = `${BOM}${csvHeader}\r\n${csvBody}`

    const providerName = (provider?.operatingName || provider?.legalName || provider?.name || 'provider')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()

    const now = new Date()
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/London',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }).formatToParts(now).reduce((acc, p) => (acc[p.type] = p.value, acc), {})
    const filename = `rops-provider-${providerName}-${parts.year}${parts.month}${parts.day}-${parts.hour}${parts.minute}${parts.second}.csv`

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.status(200).send(csv)
  } catch (err) {
    return next(err)
  }
}
