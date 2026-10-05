
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import {
    getFirestore, collection, addDoc, doc, updateDoc, setDoc,
    query, orderBy, onSnapshot, serverTimestamp, getDoc
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as fbSignOut,
    onAuthStateChanged,
    updateProfile
  } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

  // 🔑 ===== FIREBASE CONFIG =====
  const firebaseConfig = {
    apiKey:            "AIzaSyBwid__7vvvApYKaVGlfODXQ-mVvACc0CY",
    authDomain:        "phiphakone-c4257.firebaseapp.com",
    projectId:         "phiphakone-c4257",
    storageBucket:     "phiphakone-c4257.firebasestorage.app",
    messagingSenderId: "1057364371211",
    appId:             "1:1057364371211:web:7699b6edd1d6a03f28e40e",
    measurementId:     "G-LMK56FK86T"
  };
  // ==============================

  try {
    if(firebaseConfig.apiKey.startsWith('PASTE_') || firebaseConfig.projectId.startsWith('PASTE_')){
      throw new Error('Firebase config ยังเป็น PASTE_* placeholder — ใส่ค่าจริงจาก Firebase Console → Project settings → Your apps → Web');
    }

    const app  = initializeApp(firebaseConfig);
    const db   = getFirestore(app);
    const auth = getAuth(app);

    // ---------- Auth + Firestore profile helpers ----------
    // Profile schema (Firestore: users/{uid}):
    //   { uid, name, email, phone, createdAt }

    async function lcRegister({ name, email, password, phone }) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      if (name) {
        try { await updateProfile(user, { displayName: name }); } catch(_){}
      }
      const profile = {
        uid:       user.uid,
        name:      name  || (email ? email.split('@')[0] : ''),
        email:     email || '',
        phone:     phone || '',
        createdAt: serverTimestamp()
      };
      await setDoc(doc(db, 'users', user.uid), profile, { merge: true });
      return { uid: user.uid, name: profile.name, email: profile.email, phone: profile.phone };
    }

    async function lcLogin({ email, password }) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      return {
        uid:   user.uid,
        name:  data.name  || user.displayName || (user.email ? user.email.split('@')[0] : ''),
        email: data.email || user.email || '',
        phone: data.phone || ''
      };
    }

    async function lcLogout() {
      await fbSignOut(auth);
    }

    async function lcGetProfile(uid) {
      if (!uid) return null;
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      return {
        uid,
        name:  data.name  || '',
        email: data.email || '',
        phone: data.phone || ''
      };
    }

    // Watch Firebase Auth state and mirror it into the existing Store('user')
    // so checkout/cart/orders code that reads Store.get('user') keeps working.
    onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const profile = (await lcGetProfile(user.uid)) || {
            uid:   user.uid,
            name:  user.displayName || (user.email ? user.email.split('@')[0] : ''),
            email: user.email || '',
            phone: ''
          };
          if (window.Store && typeof window.Store.set === 'function') {
            window.Store.set('user', profile);
          }
        } else {
          if (window.Store && typeof window.Store.remove === 'function') {
            window.Store.remove('user');
          }
        }
        window.dispatchEvent(new CustomEvent('lc-auth-changed', { detail: { user: user ? { uid: user.uid } : null } }));
      } catch (e) {
        console.warn('[Auth] state sync failed:', e);
      }
    });

    window.LCFB = {
      db, auth,
      collection, addDoc, doc, updateDoc, setDoc,
      query, orderBy, onSnapshot, serverTimestamp, getDoc,
      // auth API used by loginUser/registerUser/logoutUser
      lcRegister, lcLogin, lcLogout, lcGetProfile,
      ready: true
    };
    console.log('[Firebase] ✓ Initialized — project:', firebaseConfig.projectId);
    window.dispatchEvent(new Event('lcfb-ready'));
  } catch (err) {
    console.error('[Firebase] ✗ Init failed:', err);
    window.LCFB = { ready: false, error: err.message };
  }
