
//......................................................................................................................................................

const express = require('express');

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { connectDB } = require('./db');
require('dotenv').config();




// Ensure the upload directory exists
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// Database connection with MongoDB
// mongoose.connect("mongodb+srv://mauryahimanshu979:XXDCvOJi0V2NzkWd@cluster0.pz64k14.mongodb.net/ecommerce_shopper", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })


//app config
const app = express()
const port = process.env.PORT || 4000

// middleware 
app.use(express.json())
app.use(cors())

// Serve static files from the 'public' directory
app.use(express.static('public'));

//DB connection
connectDB();



// API creation
app.get("/", (req, res) => {
    res.send("Express app is running");
});

// Image storage engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Creating upload endpoint for image
app.use('/images', express.static(uploadDir));

app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Schema for creating products
const Product = mongoose.model("product", {
    id: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    new_price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    available: {
        type: Boolean,
        default: true,
    },
});

// Add product API
app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        let last_product = products.slice(-1)[0];
        id = last_product.id + 1;
    } else {
        id = 1;
    }
    const product = new Product({
        id: id,
        name: req.body.name,
        image: req.body.image,
        category: req.body.category,
        new_price: req.body.new_price,
        old_price: req.body.old_price,
    });
    await product.save();
    res.json({
        success: true,
        name: req.body.name,
    });
});

// Create API for deleting products
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    res.json({
        success: true,
        id: req.body.id,
    });
});

// Create API for getting all products
app.get('/allproducts', async (req, res) => {
    let products = await Product.find({});
    res.send(products);
});

// Schema creation for the user model
const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

// Middleware to fetch user from token
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, 'secret_ecom');
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ errors: "Please authenticate using a valid token" });
    }
};

// Creating endpoint for registering the user
app.post('/signup', async (req, res) => {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
        return res.status(400).json({ success: false, errors: "Existing user found with the same email address" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) {
        cart[i] = 0;
    }

    const user = new Users({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart,
    });

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    };

    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
});

// Creating endpoint for user login
app.post('/login', async (req, res) => {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
        const passCompare = req.body.password === user.password;
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            };
            const token = jwt.sign(data, 'secret_ecom');
            res.json({ success: true, token });
        } else {
            res.json({ success: false, error: "Wrong Password" });
        }
    } else {
        res.json({ success: false, errors: "Wrong Email Id" });
    }
});

// Creating endpoint for new collection data
app.get('/newcollection', async (req, res) => {
    let products = await Product.find({});
    let newcollection = products.slice(-8);
    res.send(newcollection);
});

// Creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
    let products = await Product.find({ category: "women" });
    let popular_in_women = products.slice(0, 4);
    res.send(popular_in_women);
});

// Creating endpoints for adding products in cart data
app.post('/addtocart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    userData.cartData[req.body.itemId] += 1;
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Added");
});

// Creating endpoints to remove product from cart data

// app.post('/removefromcart', fetchUser, async (req, res) => {
//     let userData = await Users.findOne({ _id: req.user.id });
//     if (userData.cartData[req.body.itemId] > 0) {
//         userData.cartData[req.body.itemId] -= 1;
//     }
//     await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
//     res.send("Removed");
// });

app.post('/removefromcart', fetchUser, async (req, res) => {
    console.log("removed", req.body.itemId);
    let userData = await Users.findOne({ _id: req.user.id });
    if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
    }
    await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
    res.send("Removed");
});

// Creating endpoint to get cart data
app.post('/getcart', fetchUser, async (req, res) => {
    let userData = await Users.findOne({ _id: req.user.id });
    res.json(userData.cartData);
});

// app.listen(port, (error) => {
//     if (!error) {
//         console.log("Server running on the port " + port);
//     } else {
//         console.log("Error: " + error);
//     }
// });

app.listen(port,()=>{
    console.log(`server started on http://localhost:${port}`)
})