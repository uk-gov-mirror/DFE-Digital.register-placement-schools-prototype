const passport = require('passport')
const { User } = require('../models')

exports.signIn_get = (req, res) => {
  // If user is already authenticated, redirect to support page
  if (req.isAuthenticated()) {
    return res.redirect('/support/placement-schools')
  }

  // Check if we should use persona selection or sign-in form
  const useSignInForm = process.env.USE_SIGN_IN_FORM === 'true'

  if (useSignInForm) {
    // Show sign-in form
    res.render('authentication/sign-in', {
      email: req.session.email || '',
      flash: {
        error: req.flash('error')[0] || null
      },
      actions: {
        save: '/auth/sign-in',
        cancel: '/'
      }
    })
  } else {
    // Redirect to persona selection
    res.redirect('/auth/persona')
  }
}

exports.persona_get = (req, res) => {
  // If user is already authenticated, redirect to support page
  if (req.isAuthenticated()) {
    return res.redirect('/support/placement-schools')
  }

  res.render('authentication/persona', {
    actions: {
      save: '/auth/persona',
      cancel: '/'
    }
  })
}

exports.signIn_post = (req, res, next) => {
  // Store email in session for form repopulation on error
  req.session.email = req.body.email

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err)
    }

    // Authentication failed
    if (!user) {
      req.flash('error', info.message || 'Authentication failed')
      return res.redirect('/auth/sign-in')
    }

    // Log the user in
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }

      // Clear email from session
      delete req.session.email

      // Redirect to intended page or default to support
      const redirectTo = req.session.returnTo || '/support/placement-schools'
      delete req.session.returnTo

      return res.redirect(redirectTo)
    })
  })(req, res, next)
}

exports.persona_post = async (req, res, next) => {
  const personaId = req.body.persona
  const errors = []

  // Validate that a persona has been selected
  if (!personaId) {
    const error = {}
    error.fieldName = 'persona'
    error.href = '#persona'
    error.text = 'Select who you want to sign in as'
    errors.push(error)
  }

  // If validation fails, re-render the form with errors
  if (errors.length) {
    return res.render('authentication/persona', {
      errors,
      actions: {
        save: '/auth/persona',
        cancel: '/'
      }
    })
  }

  try {
    // Find the user by ID
    const user = await User.findByPk(personaId)

    if (!user || !user.isActive) {
      const error = {}
      error.fieldName = 'persona'
      error.href = '#persona'
      error.text = 'Select a valid persona you want to sign in as'
      errors.push(error)

      return res.render('authentication/persona', {
        errors,
        actions: {
          save: '/auth/persona',
          cancel: '/'
        }
      })
    }

    // Log the user in directly
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }

      // Redirect to intended page or default to support
      const redirectTo = req.session.returnTo || '/support/placement-schools'
      delete req.session.returnTo

      return res.redirect(redirectTo)
    })
  } catch (error) {
    return next(error)
  }
}

exports.signOut_get = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err)
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err)
      }

      res.redirect('/auth/sign-in')
    })
  })
}
