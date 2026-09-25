import { initializeApp } from "firebase/app";
import {
  getAuth as firebaseGetAuth,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const getFirebaseConfigured = () =>
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
  );

let _app = null;
let _auth = null;

const getApp = () => {
  if (!_app) {
    if (!getFirebaseConfigured()) {
      throw new Error("Firebase is not properly configured. Please check your REACT_APP_FIREBASE_* environment variables.");
    }
    _app = initializeApp(firebaseConfig);
  }
  return _app;
};

export const getAuth = () => {
  if (!_auth) {
    _auth = firebaseGetAuth(getApp());
  }
  return _auth;
};

export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");

export {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
};

export const getIdToken = (firebaseUser) => firebaseUser.getIdToken();