/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable semi */
const PROD = true;

var firebaseConfig = {
  apiKey: 'AIzaSyCHsvdC8MBpRQeKQq1rHidvoYBdE-WLCPg',
  authDomain: 'resellrabbit-3f22c.firebaseapp.com',
  projectId: 'resellrabbit-3f22c',
  storageBucket: 'resellrabbit-3f22c.appspot.com',
  messagingSenderId: '1016089958318',
  appId: '1:1016089958318:web:827a4e1f29576278411a3f',
  measurementId: 'G-TYY4T1GS7D',
  poratlLink: 'ext-firestore-stripe-subscriptions-createPortalLink'
};

var stripeVars = {
  publishableKey: 'pk_test_51IThrWBkbf8GXgrmYqFd0yr9yIZH5GWqU5R4faGp7vd9wEier2tQu2VfYYl7xySBoh6hEUmUHECB9Lqh8lQOtWrr00AYIPykxu',
  priceIdMonthly: 'price_1IzXVqBkbf8GXgrmAMXZC4Fm',
  priceIdYearly: 'price_1IzXVqBkbf8GXgrmyaIOEWSm'
}

if (PROD) {
  firebaseConfig = {
    apiKey: 'AIzaSyB1wMM-bZG8VF53ZfbMEg0TsaVCDLf59wM',
    authDomain: 'resellrabbit-posh-prod.firebaseapp.com',
    projectId: 'resellrabbit-posh-prod',
    storageBucket: 'resellrabbit-posh-prod.appspot.com',
    messagingSenderId: '417226503516',
    appId: '1:417226503516:web:5896ce530c551bac38fd99',
    measurementId: 'G-B6TQESBQ88',
    portalLink: 'ext-firestore-stripe-subscriptions-nd50-createPortalLink'
  };

  stripeVars = {
    publishableKey: 'pk_live_51IThrWBkbf8GXgrmKbtp37vhMqyLJuxspH2EHZXUocoFJKBoGdjFBsgqEoq06It3RyCDuK23VgB9tGkPqY3zpLym001mTvipCn',
    priceIdMonthly: 'price_1JAN7FBkbf8GXgrmm49CFNSq',
    priceIdYearly: 'price_1JAN7GBkbf8GXgrmM4l0ctII'
  }
} 

const CANCEL_URL = window.location.origin;
const SUCCESS_URL = window.location.origin + '/welcome';

const SUBSCRIPTION_SUBJECT = 'New Subscription - (CHOOSE ONE: Monthly / Yearly)';
const PORTAL_SUBJECT = 'Access to Stripe portal';


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

function createUserWithEmailAndPassword () {
  const form = document.getElementsByName('signup-form')[0];
  const email = form.elements.email.value;
  const password = form.elements.password.value;
  const passwordver = form.elements.passwordver.value;

  if (email.indexOf('+') > -1 && PROD) {
    alert('Please enter a valid email address.');
    return;
  }

  // Verify that passwords match.
  if (password !== passwordver) {
    alert('Passwords don\'t match.');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in.
      const createdUser = userCredential.user;
      this.showRedirectMsg();
      this.initStripe(createdUser);
    })
    .catch((error) => {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage += ' Please login instead or correct the entered email.'
      }
      alert(`${errorMessage}`);
    });
}

function loginWithEmailAndPassword () {
  const form = document.getElementsByName('login-form')[0];
  const email = form.elements.email.value;
  const password = form.elements.password.value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      const createdUser = userCredential.user;
      this.showRedirectMsg(/* redirectToPortal */ true);
      this.redirectToCustomerPortal();
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(`${errorMessage}`);
    });
}

async function loginWithGoogle (isInCheckoutProcess = false) {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(() => {
    if (isInCheckoutProcess) {
      // Redirect to Stripe checkout.
      this.showRedirectMsg();
      this.initStripe();
    } else {
      this.showRedirectMsg(/* redirectToPortal */ true);
      this.redirectToCustomerPortal();
    }
  }).catch((err) => {
    const msg = 'Error with signing in. Please contact us at resellrabbit@gmail.com and we will help as soon as we can.';
    alert(`${msg}\n${err}`);
  });
}

function sendPasswordResetEmail () {
  const form = document.getElementsByName('password-reset-form')[0];
  const email = form.elements.email.value;
  const auth = firebase.auth();

  auth.sendPasswordResetEmail(email).then(function () {
    // Email sent. Redirect to login page.
    alert('Email sent! Keep an eye out on your inbox.');
    window.location.href = '/login';
  }).catch(function (error) {
    // An error happened.
    alert(`${error.message}\nIf more information is needed, please contact us at resellrabbit@gmail.com.`);
  });
}

async function getUser () {
  const user = await firebase.auth().currentUser;
  if (user) {
    // User is signed in.
    return user;
  } else {
    return null;
  }
}

function logout () {
  firebase.auth().signOut().then(() => {
    // Sign-out successful.
    window.location.href = '/';
  }).catch((err) => {
    alert(`Error with logging out.\n${err}`);
  });
}

async function initStripe (createdUser = null) {
  const urlParams = new URLSearchParams(window.location.search);
  let plan = stripeVars.priceIdMonthly;
  if (urlParams.get('plan') === 'yearly') {
    plan = stripeVars.priceIdYearly;
  }
  const db = firebase.firestore();
  let user = createdUser;
  if (!user) {
    user = await this.getUser();
  }
  const docRef = await db
    .collection('customers')
    .doc(user.uid)
    .collection('checkout_sessions')
    .add({
      price: plan,
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL
    });
  docRef.onSnapshot(async (snap) => {
    const { error, url } = snap.data();
    if (url) {
      // We have a Stripe Checkout URL, let's redirect.
      window.location.assign(url);
    }
    if (error) {
      // TODO: Fix preventing double requests error.
      if (!error.message.startsWith('There is currently another in-progress request')) {
        console.log("DEBUG " + error.code + ": " + errorMessage);
        alert(`${error.message}`);
      }
    }
  });
}

async function redirectToCustomerPortal () {
  const functionRef = firebase
    .app()
    .functions('us-east4')
    .httpsCallable(firebaseConfig.portalLink);
  const { data } = await functionRef({ returnUrl: window.location.origin });
  window.location.assign(data.url);
}

function showRedirectMsg (redirectToPortal = false) {
  let subject = SUBSCRIPTION_SUBJECT;
  if (redirectToPortal) {
    subject = PORTAL_SUBJECT;
  }
  document.querySelector('.modal').innerHTML = `Redirecting to Stripe... <br /> <span class="description">If this page does not redirect within <span id="timer">15</span> seconds, please <a href="mailto:resellrabbit@gmail.com?subject=[${subject}]" class="pink">reach us directly</a>.</span>`;
  let count = 15;
  const timer = setInterval(function() {
    document.querySelector('#timer').innerHTML = count--;
    if (count == 0) {
      clearInterval(timer);
    }
  }, 1000);
}

function showSignUpPasswordVerification () {
  const signupForm = document.getElementsByName('signup-form')[0];
  if (signupForm) {
    const passwordVerify = signupForm.elements.passwordver;
    passwordVerify.style.display = 'block';
  }
}
