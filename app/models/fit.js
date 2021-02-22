const mongoose = require('mongoose')

const fitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  site: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toObject: {
    transform: (_doc, fit) => {
      return {
        id: fit._id,
        name: fit.name,
        brand: fit.brand,
        site: fit.site,
        photo: fit.photo
      }
    }
  }
})

module.exports = mongoose.model('Fit', fitSchema)
