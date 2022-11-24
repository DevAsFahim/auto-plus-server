const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.3q2ltkd.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoriesCollection = client.db('autoPlus').collection('categories');
        const carsCollection = client.db('autoPlus').collection('cars');

        app.get('/categories', async(req, res) => {
            const query = {}
            const categories = await categoriesCollection.find(query).toArray();
            res.send(categories)
        })
        app.get('/category/:id', async(req, res) => {
            const id = req.params.id;
            const query = { categoryId: id }
            const cars = await carsCollection.find(query).toArray();
            res.send(cars)
        })
    }
    finally{

    }
}

run().catch(console.log)




app.get('/', (req, res) => {
    res.send('welcome to auto plus server')
})

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})
