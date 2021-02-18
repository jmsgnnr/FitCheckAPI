const express = require('express')

const passport = require('passport')

// pull in Mongoose model for fits
const Fit = require('../models/fit')

// this is a collection of methods that help us detect situations when we need
// to throw a custom error
const customErrors = require('../../lib/custom_errors')

// we'll use this function to send 404 when non-existant document is requested
const handle404 = customErrors.handle404
// we'll use this function to send 401 when a user tries to modify a resource
// that's owned by someone else
const requireOwnership = customErrors.requireOwnership

// this is middleware that will remove blank fields from `req.body`, e.g.
// { fit: { title: '', text: 'foo' } } -> { fit: { text: 'foo' } }
const removeBlanks = require('../../lib/remove_blank_fields')
// passing this as a second argument to `router.<verb>` will make it
// so that a token MUST be passed for that route to be available
// it will also set `req.user`
const requireToken = passport.authenticate('bearer', { session: false })

// instantiate a router (mini app that only handles routes)
const router = express.Router()

// INDEX
// GET /fits
router.get('/fits', requireToken, (req, res, next) => {
  Fit.find()
    .then(fits => {
      // `fits` will be an array of Mongoose documents
      // we want to convert each one to a POJO, so we use `.map` to
      // apply `.toObject` to each one
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
  // set owner of new fit to be current user
  req.body.fit.owner = req.user.id

  Fit.create(req.body.fit)
    // respond to succesful `create` with status 201 and JSON of new "fit"
    .then(fit => {
      res.status(201).json({ fit: fit.toObject() })
    })
    // if an error occurs, pass it off to our error handler
    // the error handler needs the error message and the `res` object so that it
    // can send an error message back to the client
    .catch(next)
})

// UPDATE
// PATCH /fits/5a7db6c74d55bc51bdf39793
router.patch('/fits/:id', requireToken, removeBlanks, (req, res, next) => {
  // if the client attempts to change the `owner` property by including a new
  // owner, prevent that by deleting that key/value pair
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
