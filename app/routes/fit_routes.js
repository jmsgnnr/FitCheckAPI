const express = require('express')
const passport = require('passport')
const Fit = require('../models/fit.js')
const customErrors = require('../../lib/custom_errors')
const handle404 = customErrors.handle404
const requireOwnership = customErrors.requireOwnership
const removeBlanks = require('../../lib/remove_blank_fields')
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /fits
router.get('/fits', requireToken, (req, res, next) => {
  Fit.find({ owner: req.user._id })
    .then(fits => {
      return fits.map(fit => fit.toObject())
    })
    // respond with status 200 and JSON of the fits
    .then(fits => res.status(200).json({ fits: fits }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// SHOW
// GET /fits/5a7db6c74d55bc51bdf39793
router.get('/fits/:id', requireToken, (req, res, next) => {
  // req.params.id will be set based on the `:id` in the route
  Fit.findById(req.params.id)
    .then(handle404)
    // if `findById` is succesful, respond with 200 and "fit" JSON
    .then(fit => res.status(200).json({ fit: fit.toObject() }))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// CREATE
// POST /fits
router.post('/fits', requireToken, (req, res, next) => {
  req.body.fit.owner = req.user._id
  Fit.create(req.body.fit)
    .then(fit => res.status(201).json({ fit: fit.toObject() })
    )
    .catch(next)
})

// UPDATE
// PATCH /fits/5a7db6c74d55bc51bdf39793
router.patch('/fits/:id', requireToken, removeBlanks, (req, res, next) => {
  delete req.body.fit.owner

  Fit.findById(req.params.id)
    .then(handle404)
    .then(fit => {
      // pass the `req` object and the Mongoose record to `requireOwnership`
      // it will throw an error if the current user isn't the owner
      requireOwnership(req, fit)

      // pass the result of Mongoose's `.update` to the next `.then`
      return fit.updateOne(req.body.fit)
    })
    // if that succeeded, return 204 and no JSON
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

// DESTROY
// DELETE /fits/5a7db6c74d55bc51bdf39793
router.delete('/fits/:id', requireToken, (req, res, next) => {
  Fit.findById(req.params.id)
    .then(handle404)
    .then(fit => {
      // throw an error if current user doesn't own `fit`
      requireOwnership(req, fit)
      // delete the fit ONLY IF the above didn't throw
      fit.deleteOne()
    })
    // send back 204 and no content if the deletion succeeded
    .then(() => res.sendStatus(204))
    // if an error occurs, pass it to the handler
    .catch(next)
})

module.exports = router
