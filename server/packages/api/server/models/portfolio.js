'use strict';
 
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var supergoose = require('supergoose');
/**
 * Portfolio Schema
 */

var FundSchema = new Schema({
	name: {type: String, required: true, default: ''}, // name of ETF fund
	allocation: {type: Number, required: true, default: 0} // proportion allocated
});

var PortfolioSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    customer: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: false,
        trim: true,
        default: 'Default Fund'
    },
    stock_percentage_split: { // show stock vs bond % as 0-1 
	    type: Number,
	    required: true,
	    default: 0.5
    },
    allocations: [FundSchema], // Fund % (0-1) allocations, must total to 1 (100%)
    transactions: { // sum these to get invested amount
        type: Schema.ObjectId,
        ref: 'Transaction'
    },
    balance: { // balance after returns
        type: Number,
        required: true,
        default: 0.0
    }
});

// keep track of when portfolios are updated and created

PortfolioSchema.pre('save', function(next, done){
  if (this.isNew) {
    this.created = Date.now();
  }
  this.updated = Date.now();
  next();
});

PortfolioSchema.plugin(supergoose, []);
mongoose.model('Portfolio', PortfolioSchema);