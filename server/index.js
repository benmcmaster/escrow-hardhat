const express = require('express')
const cors = require('cors')
require('dotenv').config()
const mysql = require('mysql2')

const app = express()
const port = 3001

const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')
connection.end()

app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    res.json({ username: 'Flavio' })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})