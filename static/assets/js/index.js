let login = document.getElementById('login')
let notify = document.getElementById('notify')
let message = document.getElementById('message')
let logout = document.getElementById('logout')

let auth = null
let database = null

// Loading Scripts
const loadScripts = setInterval(() => {
  if (!!firebase) {
    console.log('Loaded')
    clearInterval(loadScripts)
    firebase.initializeApp({
      apiKey: "AIzaSyBCvy75iW-q4lnmjp_46W0VimwDI9zyFx8",
      authDomain: "firetest-abf6f.firebaseapp.com",
      databaseURL: "https://firetest-abf6f.firebaseio.com",
      projectId: "firetest-abf6f",
      storageBucket: "firetest-abf6f.appspot.com",
      messagingSenderId: "590127970363"
    })
    console.log('Firebase Initialized')
    // Setting Auth | Database
    auth = firebase.auth()
    database = firebase.database().ref('/test')
    // Setting Language to Auth
    auth.languageCode = 'en'
    // Checking if has token
    setTimeout(async () => {
      try {
        // Getting Token
        const IdToken = await auth.currentUser.getIdToken()
        // Authenticating Token
        var request = new XMLHttpRequest()
        request.open('POST', '/authenticate', true)
        request.setRequestHeader('access-token', IdToken)
        request.responseType = 'application/json'
        request.onload = e => {
          const response = JSON.parse(request.response)
          if (response.valid) {
            const user = response.user
            message.innerHTML = `Welcome, ${user.name}!`
            logout.style.display = 'inline'
          } else {
            message.innerHTML = 'User not Registred!'
            login.style.display = 'inline'
          }
        }
        request.send()
      } catch (error) {
        message.innerHTML = 'Failed to Authenticate. Please, try to Login again.'
        login.style.display = 'inline'
        console.warn('Failed to Authenticate: ', error)
      }
    }, 2000)
  }
}, 500);


async function authenticate() {
  console.log('Loggin in')
  try {
    const provider = new firebase.auth.GoogleAuthProvider()
    const result = await auth.signInWithPopup(provider)
    localStorage.accessToken = result.credential.accessToken
    localStorage.idToken = result.credential.idToken
    const profile = result.additionalUserInfo.profile
    const snap = await database.once('value')
    const users = snap.val()
    let hasUser = false
    for (const x in users) {
      if (users[x].id === profile.id) hasUser = true
    }
    if (!hasUser) {
      database.push(profile)
    }
    message.innerHTML = `Welcome, ${profile.name}!`
    login.style.display = 'none'
    logout.style.display = 'inline'
  } catch (error) {
    console.warn('Error to Login!', error)
  }
}

async function signOut() {
  try {
    await firebase.auth().signOut()
    message.innerHTML = 'No User Logged'
    login.style.display = 'inline'
    logout.style.display = 'none'
  } catch (e) {
    message.innerHTML = 'Failed to Logout!'
  }
}
