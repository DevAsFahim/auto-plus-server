const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3q2ltkd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run() {
    try {
        const categoriesCollection = client.db('autoPlus').collection('categories');
        const carsCollection = client.db('autoPlus').collection('cars');
        const usersCollection = client.db('autoPlus').collection('users');
        const bookingsCollection = client.db('autoPlus').collection('bookings');
        const blogsCollection = client.db('autoPlus').collection('blogs');
        const testimonialsCollection = client.db('autoPlus').collection('testimonials');
        const wishesCollection = client.db('autoPlus').collection('wishes');

        // get category
        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories)
        })
        // get testimonials
        app.get('/testimonials', async (req, res) => {
            const query = {}
            const test = await testimonialsCollection.find(query).toArray();
            res.send(test)
        })
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { categoryId: id }
            const cars = await carsCollection.find(query).toArray();
            res.send(cars)
        })
        // get seller data
        app.get('/sellers', async (req, res) => {
            const query = { userType: 'seller' };
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers)
        })
        // jwt
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })
        // get user data
        app.get('/users', async (req, res) => {
            const query = { userType: 'user' };
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        })

        // get sellers products
        app.get('/myproducts/:email', async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email };
            const myProducts = await carsCollection.find(query).toArray();
            res.send(myProducts)
        })
        // get sellers products
        app.get('/bookings/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings)
        })
        // get wish products
        app.get('/wishlist/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const wishes = await wishesCollection.find(query).toArray();
            res.send(wishes)
        })
        // get user data
        app.get('/advertise', async (req, res) => {
            const query = { advertise: 'true' };
            const result = await carsCollection.find(query).toArray();
            res.send(result)
        })
        //get blog data
        app.get('/blogs', async (req, res) => {
            const query = {};
            const blogs = await blogsCollection.find(query).toArray();
            res.send(blogs)
        })
        // individual blog data
        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const blog = await blogsCollection.findOne(query);
            res.send(blog)
        })

        //check admin
        app.get('/users/admin/:email', async(req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.userType === 'admin'})
        })
        // check seller
        app.get('/users/seller/:email', async(req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({isSeller: user?.userType === 'seller'})
        })

        // post car 
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await carsCollection.insertOne(product);
            res.send(result);
        })

        // post user
        app.post('/users', async (req, res) => {
            const users = req.body;
            const result = await usersCollection.insertOne(users);
            res.send(result)
        })

        // post user product bookings to database
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result)
        })
        app.post('/wishlist', async (req, res) => {
            const wishes = req.body;
            const result = await wishesCollection.insertOne(wishes);
            res.send(result)
        })

        // verify seller
        app.put('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    verified: "true"
                },
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // advertise true
        app.put('/advertise/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    advertise: "true"
                },
            }
            const result = await carsCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })

        // delete seller
        app.delete('/seller/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })
        // delete user
        app.delete('/user/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })
        // delete product
        app.delete('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carsCollection.deleteOne(query);
            res.send(result)
        })

    }
    finally {

    }
}

run().catch(console.log)




app.get('/', (req, res) => {
    res.send('welcome to auto plus server')
})

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})
