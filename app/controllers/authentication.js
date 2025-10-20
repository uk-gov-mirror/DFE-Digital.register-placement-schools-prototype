const passport = require('passport')

exports.signIn_get = (req, res) => {
  // If user is already authenticated, redirect to support page
  if (req.isAuthenticated()) {
    return res.redirect('/support/placement-schools')
  }

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
