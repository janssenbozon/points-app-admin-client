import React, { useState, useEffect, useContext, createContext } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from '../firebase/config'
import { getDatabase, ref, get, set } from "firebase/database";

const authContext = createContext()

export function AuthProvider({ children }) {
    const auth = useProvideAuth()
    return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

export const useAuth = () => {
    return useContext(authContext)
}

function useProvideAuth() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const signout = () => {
        console.log("signing out");
        setLoading(true);
        return new Promise((resolve, reject) => {
            auth.signOut()
                .then(() => {
                    setUser(false);
                    resolve(true);
                })
                .catch((error) => {
                    resolve(false);
                });
            setLoading(false);
        });
    }

    const signInWithEmail = (email, password) => {
        return new Promise((resolve, reject) => {
            console.log("signing in " + email + " " + password);
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in 
                    console.log("logged in")
                    setUser(userCredential.user);
                   resolve(true);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    resolve(false);
                });
        });
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
            } else {
                setUser(false)
            }
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    return {
        user,
        loading,
        signout,
        signInWithEmail
    }
}