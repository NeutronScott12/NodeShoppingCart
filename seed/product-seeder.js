let Product = require('../models/product');
let mongoose = require('mongoose');

mongoose.connect('mongodb://scott:bob123@ds117919.mlab.com:17919/node-shopping-cart');

let products = [
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/en/5/5e/Gothiccover.png',
        title: 'Gothic',
        description: "Quite Good",
        price: 10
    }),
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Witcher_3_cover_art.jpg/250px-Witcher_3_cover_art.jpg',
        title: 'Wither 3',
        description: "Very Good",
        price: 20
    }),
    
    new Product({
        imagePath: 'https://upload.wikimedia.org/wikipedia/en/7/70/Fallout_4_cover_art.jpg',
        title: 'Fallout 4',
        description: "Very Good",
        price: 15
    }),
];

let done = 0;

for  (var i = 0; i < products.length; i++ ){
    products[i].save((err, result) => {
        done++;
        if (done == products.length){
            exit();
        }
    });
}

let exit = function(){
    mongoose.disconnect();
}



// for (product in products){
//     product.save();
// }

// products.forEach(product, index){
//     product.save();
// }
