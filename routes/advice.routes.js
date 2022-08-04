const router = require("express").Router();
 
const mongoose = require('mongoose');
 
const Advice = require('../models/Advice.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');

const {isAuthenticated, isAuthor} = require("../middleware/jwt.middleware")
 

//READ list of advices 
router.get('/advices', (req, res, next) => {
    Advice.find()
        .populate("products")
        .then(allAdvices => {
            res.json(allAdvices)
        })
        .catch(err => res.json(err));
});


//  POST /api/advices  -  Creates a new advice
router.post('/advices', isAuthenticated, (req, res, next) => {
  const { title, problemDescription, advice, products: productId } = req.body;
 
  Advice.create({ title, problemDescription, advice, products: [productId] })
  .then(newAdvice => {
    return Product.findByIdAndUpdate(productId, { $push: { advices: newAdvice._id } } );
  })
    .then(response => res.json(response))
    .catch(err => res.json(err));
});


//READ advice details
router.get('/advices/:adviceId', (req, res, next) => {
    const { adviceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adviceId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    
    Advice.findById(adviceId)
        .populate('products')
        .then(advice => res.json(advice))
        .catch(error => res.json(error));
});

//UPDATE advice
router.put('/advices/:adviceId', isAuthenticated, (req, res, next) => {
    const { adviceId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(adviceId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Advice.findByIdAndUpdate(adviceId, req.body, { new: true })
        .then((updatedAdvice) => res.json(updatedAdvice))
        .catch(error => res.json(error));
});

//DELETE advice
router.delete ('/advices/:adviceId', isAuthenticated, (req, res, next) => {
    const { adviceId } = req.params;

   
    if (!mongoose.Types.ObjectId.isValid(adviceId)) {
        res.status(400).json({ message: 'Specified id is not valid' });
        return;
    }

    Advice.findByIdAndRemove(adviceId)
        .then(() => res.json({ message: `Advice with id ${adviceId} was removed successfully.` }))
        .catch(error => res.status(500).json(error));
});
 
module.exports = router;