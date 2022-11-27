const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3q2ltkd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('autoPlus').collection('categories');
        const carsCollection = client.db('autoPlus').collection('cars');
        const usersCollection = client.db('autoPlus').collection('users');
        const bookingsCollection = client.db('autoPlus').collection('bookings');

        // get category
        app.get('/categories', async (req, res) => {
            const query = {}
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories)
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

        // delete seller
        app.delete('/seller/:id', async(req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        } )

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
