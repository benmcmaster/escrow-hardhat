const express = require('express')
const cors = require('cors')
require('dotenv').config()
const mysql = require('mysql2')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.PORT || 3001

const connection = mysql.createConnection(process.env.DATABASE_URL)
console.log('Connected to PlanetScale!')
//connection.end()

app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    connection.query('SELECT * FROM contracts', function (err, rows, fields) {
        if (err) throw err

        res.send(rows)
    })
})

// create an API route that inserts a new record into the contracts table
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))
app.post('/contracts', (req, res) => {
    console.log("/contracts req.body: ", req.body);
    const { address, depositor, arbiter, beneficiary, value, decision } = req.body;

    // perform the database query
    connection.query(
        'INSERT INTO contracts (`address`, `depositor`, `arbiter`, `beneficiary`, `value`, `decision`) VALUES (?, ?, ?, ?, ?, ?)',
        [address, depositor, arbiter, beneficiary, value, decision],
        (error, results) => {
            if (error) {
                console.error(error);
                res.status(500).send({error: 'Internal server error'});
            } else {
                res.status(200).send({message: 'Record inserted successfully'});
            }
        }
    );
});

app.put('/contracts/:id', (req, res) => {
    console.log("/contracts/:id req.body: ", req.body);
    const id = req.params.id;
    const decision = req.body.decision;

    // Update the decision column in contracts table
    connection.query('UPDATE contracts SET decision = ? WHERE id = ?', [decision, id], (error, results, fields) => {
        if (error) throw error;
        res.send({error: 'Decision updated successfully.'});
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})