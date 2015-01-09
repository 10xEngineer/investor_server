'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var supergoose = require('supergoose');
/**
 * Transaction Schema
 */
var TransactionSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    transaction_type: { // deposit / withdrawal
	    type: String,
	    required: true,
	    default: 'deposit'
    },
    amount: {
	    type: Number,
	    required: true,
	    default: 0.0
    },
    customer: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    portfolio: {
        type: Schema.ObjectId,
        ref: 'Portfolio'
    }
});

// keep track of when transactions are updated and created
TransactionSchema.pre('save', function(next, done){
  if (this.isNew) {
    this.created = Date.now();
  }
  this.updated = Date.now();
  next();
});

TransactionSchema.plugin(supergoose, []);
mongoose.model('Transaction', TransactionSchema);