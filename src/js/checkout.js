/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable semi */

const firebaseConfig = {
  apiKey: 'AIzaSyCHsvdC8MBpRQeKQq1rHidvoYBdE-WLCPg',
  authDomain: 'resellrabbit-3f22c.firebaseapp.com',
  projectId: 'resellrabbit-3f22c',
  storageBucket: 'resellrabbit-3f22c.appspot.com',
  messagingSenderId: '1016089958318',
  appId: '1:1016089958318:web:827a4e1f29576278411a3f',
  measurementId: 'G-TYY4T1GS7D'
};

const stripeVars = {
  publishableKey: 'pk_test_51IThrWBkbf8GXgrmYqFd0yr9yIZH5GWqU5R4faGp7vd9wEier2tQu2VfYYl7xySBoh6hEUmUHECB9Lqh8lQOtWrr00AYIPykxu',
  priceIdMonthly: 'price_1ImRwvBkbf8GXgrmTDtpUSNT',
  priceIdYearly: 'price_1ImRwvBkbf8GXgrmIRlrtHdF'
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
  const name = form.elements.name.value;
  const email = form.elements.email.value;
  const password = form.elements.password.value;

  if (name === '') {
    alert('Name must be filled out.');
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in.
      const createdUser = userCredential.user;
      createdUser.updateProfile({ displayName: name });
      this.initStripe(createdUser);
    })
    .catch((error) => {
      const errorMessage = error.message;
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
      this.showAccountDashboard(createdUser);
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(`${errorMessage}`);
    });
}

async function loginWithGoogle (isInCheckoutProcess = false) {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider).then(() => {
    console.log('Successfully signed in.');
    if (isInCheckoutProcess) {
      // Redirect to Stripe checkout.
      document.getElementById('signup-panel').innerHTML = this.getRedirectMsg();
      initStripe();
    } else {
      document.getElementById('login-panel').innerHTML = this.getRedirectMsg(/* redirectToPortal */ true);
      this.redirectToCustomerPortal();
    }
  }).catch((err) => {
    console.log('Error with signing in.');
    console.log(err);
    alert('Error with signing in. Please contact me at resellrabbit@gmail.com and I help as soon as I can.');
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
  }).catch(function(error) {
    // An error happened.
    alert(`${error.message}. If more information is needed, please contact me at resellrabbit@gmail.com.`);
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
    console.log('Successfully logged out'); // Sign-out successful.
    window.location.href = '/';
  }).catch((err) => {
    console.log(err);
    alert('Error with logging out.');
  });
}

async function initStripe (createdUser = null) {
  console.log('init stripe');
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
  console.log(user.uid);
  console.log("trying to log in");
  const docRef = await db
    .collection('customers')
    .doc(user.uid)
    .collection('checkout_sessions')
    .add({
      price: plan,
      allow_promotion_codes: true,
      success_url: SUCCESS_URL,
      cancel_url: CANCEL_URL
    });
  docRef.onSnapshot(async (snap) => {
    console.log("how many times? ");
    const { error, sessionId } = snap.data();
    console.log('sessionid: ' + sessionId);
    if (sessionId) {
      const stripe = Stripe(stripeVars.publishableKey);
      stripe.redirectToCheckout({ sessionId: sessionId, customerEmail: user.customerEmail });
    }
    if (error) {
      console.log(error);
    }
  });
}

async function redirectToCustomerPortal () {
  console.log('attempting to redirect to portal');
  const functionRef = firebase
    .app()
    .functions('us-east4')
    .httpsCallable('ext-firestore-stripe-subscriptions-nd50-createPortalLink');
  const { data } = await functionRef({ returnUrl: window.location.origin });
  window.location.assign(data.url);
}

function getRedirectMsg(redirectToPortal = false) {
  let subject = SUBSCRIPTION_SUBJECT;
  if (redirectToPortal) {
    subject = PORTAL_SUBJECT;
  }
  return `Redirecting to Stripe... <br /> <span class="description">If this page does not redirect within 10 seconds, please <a href="mailto:resellrabbit@gmail.com?subject=[${subject}]" class="pink">reach me directly</a>.</span>`;
}
