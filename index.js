const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const admin = require('firebase-admin')

var serviceAccount = require('./firetest-abf6f-firebase-adminsdk-t4772-f2ab4d489e.json')

const fireApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firetest-abf6f.firebaseio.com"
})

const auth = fireApp.auth()

const app = express()

const PORT = process.env.PORT || 8080

app.use(express.static('static'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'access-token']
}))

app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/static/index.html`)
})

app.post('/authenticate', async (req, res) => {
  try {
    const token = req.headers['access-token']
    const user = await auth.verifyIdToken(token)
    res.json({ valid: true, user: user })
  } catch (error) {
    console.log('Failed to VerifyToken: ', error)
    res.json({ valid: false, error: error })
  }
})

app.listen(PORT, () => console.log(`Running at port ${PORT}`))
