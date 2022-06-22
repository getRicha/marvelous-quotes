const express = require('express')
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const app = express()
require('dotenv').config()

let connectionStr = process.env.DB_STRING

MongoClient.connect(connectionStr, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to Database')
    const db = client.db('marvel-quotes')
    const quotesCollection = db.collection('quotes')
    app.set('view engine', 'ejs')
    app.use(express.static('public'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    app.get('/', (req, res) => {
        quotesCollection.find().toArray()
            .then(results => res.render('index.ejs',{quotes:results}))
            .catch(err => console.error(err))
    })
    app.post('/quotes', (req, res) => {
        quotesCollection.insertOne(req.body)
            .then(result => res.redirect('/'))
            .catch(error => console.error(error))
    })
    app.put('/quotes', (req, res) => {
        quotesCollection.findOneAndUpdate(
            { name: 'Captain America' },
            {
                $set: {
                name: req.body.name,
                quote: req.body.quote
                }
            },
            {
                upsert: true
            }
        )
        .then(result => res.json('Success'))
        .catch(error => console.error(error))
    })
    app.delete('/quotes',(req,res) => {
        quotesCollection.deleteOne({ name: req.body.name })
            .then(result => {
                if (result.deletedCount === 0) {
                    return res.json('No quote to delete')
                }
                res.json(`Deleted Thanos's quote`)
            })
            .catch(error => console.error(error))
    })
    app.listen(3000, () => console.log('listening on 3000'))
  })
  .catch(error => console.error(error))
