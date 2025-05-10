// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyC7b-PC9MBTyR2VKEhEECNcxw5VMPqaPCs",
//   authDomain: "hackathon-1-8f769.firebaseapp.com",
//   projectId: "hackathon-1-8f769",
//   storageBucket: "hackathon-1-8f769.firebasestorage.app",
//   messagingSenderId: "429216825696",
//   appId: "1:429216825696:web:b17dd04c24165463941e05",
//   measurementId: "G-CMPX5018MF"
// };

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA9qFRUl6nHb5Q5nIJsv-9lfKXJpoVd_to",
  authDomain: "cman-smartasst.firebaseapp.com",
  databaseURL: "https://cman-smartasst-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cman-smartasst",
  storageBucket: "cman-smartasst.firebasestorage.app",
  messagingSenderId: "514037565137",
  appId: "1:514037565137:web:be09ae9038496f6428a7f0",
  measurementId: "G-5MMWGDLEXS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };


// {
//   "type": "service_account",
//   "project_id": "cman-smartasst",
//   "private_key_id": "0f0ef0dc8e3939cd7517e32c154c6e8cdc6ca5c8",
//   "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDQnhyuj/ZoFivd\nO2GGmxgMnrorfzZBbuqGlyKr4+h6/eb/kxZ9QYqqNzXup0jr4Uii22Pskkbu3rSR\ncCO9INNFljGsHTSyTahLoBamwjWAgTQbIELKG2M/zWd6ITWuUm4Pl9DvtdziLDVw\nnmqr4eB6rO/AAwaP810XTlDVv/RxUIHjReAMwGLY7x5sNam9fiBsNW/3XlEIt2ki\nFr5SPX0ZHhShChAFqnJkKuKLPI7DqXPY7VmwyVPJtK+wBxbytSDzCb8H35CT3Ic/\nAGhs9HzgBHB09giOdPY56lOpTzPTyRzf2L3RTGqyuE12gXWYJA17wZOUbzMA86j+\nXi4qTKFRAgMBAAECggEACG9ZgIi18VJy1pXyj7M7VIihxWV2MkzDncqEQ91KBphi\nhn3ngGFYiSEEr2Vt0jUV2e6In/BFfvNb61op5RlBLESc4Ip+bsvWB1dt4wiM35PE\ndr5Qr674zdkbxc6MRu6dSvMb/Gfm35w4Uu6M00NQRMAzohiyjg/MeUdDhx5Pn2SL\nvRzbUCsmKNQuKoT27DjZKNv9y9Ph6tDrUZOpi+y7QALIVlglQ5ew9XT6E9ePqmWi\nLf9FFNAsNWOkAEwVg+188PxRj3S8xTv6RFhcn1fH5QGUC3B2tcbIi5o1QfmxNTaI\nAwDZzRlIwIAzzXrQ4yX3fJXgVncatZbvHaWMBXI4OQKBgQDsmL9xO39YpyeM4n6E\nZnv04fJDca1s9+xPkWhtNWUGUF0BYZT9cwu/rmhSnMuYfcXZNEarEAthLUrOvE0/\nVRpSmNiQXBQK2bcEvXbph4bgnXEkEEppEOzulfxMl65ATmZLAjO9u3Q44zIa3Ic4\ncBh6LNbGTOX/gsw4FRMD7Xh0LQKBgQDhufSTROIzoEjVPf4tAJjUFo65UP04oNq8\n1hCSwCt7uFfuFtGEiIMs6DqQfxGjuVM2l07GlEE4559xgKOn/GDu7bCz7xZTJ5Te\nXeyGH0ZMqHP97aFR0zV2NIveklV/UxwUZPnb2Gyyxfr4O0W0O0TBYtkhM01BA/og\nlqkNtMdkNQKBgQDUPToPM5ZLSrd59HwV/XFY/Y873S/7vnNn9UK+JNXZUiH8aTMk\nIR3691NyOGGTC9B9xh1Wuu/aXqzqw5RwKcGRMrei2FbKXP+G6wdO+lqOB+5EsbBu\ni9ZfOIC5nJ+d5DZzNyh/HTdnCLgbzJQolrX+c1a/UKBKE2VrMcx7C32wiQKBgAKJ\n1c9GKgkMl2UWgmI9LHrOGiLJX1+gp3USLzOHR7Xnd82sogSMiHUb03TGiQs/TUlC\n4FbpWeZq7GcZXD3KX8iwEZmkaarbuhfaFIvZlC/OgSds4bCK4IIIyz3ghWeeJqWw\nEQNA5tAH2++osvr446gNFYYDDq5ZfhmZuCL4Unm1AoGBALjWclEOBH+BxdV1HJUZ\nKdTYhTRUDjI2fIJcv6cWe+NzJ9OloJ8r8lXEk1F49ROFeYHfxL6XRjhXJZSg46sO\nBjEf2sGAqdTR3F5xircu+kA5tceEPOjfHSz1DPBQfJqsXvYy69n4T2yy4yl2nibA\nwhLjtzvHhf7ryiFZNcWc3gBq\n-----END PRIVATE KEY-----\n",
//   "client_email": "firebase-adminsdk-fbsvc@cman-smartasst.iam.gserviceaccount.com",
//   "client_id": "116899001793600098891",
//   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
//   "token_uri": "https://oauth2.googleapis.com/token",
//   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
//   "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40cman-smartasst.iam.gserviceaccount.com",
//   "universe_domain": "googleapis.com"
// }

