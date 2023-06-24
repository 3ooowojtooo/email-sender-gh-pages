/* eslint-disable no-undef */
import React, {useState, useEffect} from "react";
import {useLoader} from "../component/loader/LoaderContext";
import {GmailApi} from "../api/GmailApi";

const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest';
const SCOPES = 'https://mail.google.com/';

export const AuthContext = React.createContext();
export const useAuth = () => React.useContext(AuthContext);

function loadScript(src, onLoad) {
    let script = document.createElement('script')
    script.src = src
    script.onload = onLoad
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    return script
}

export const AuthContextProvider = ({children}) => {
    const [gapiInitialized, setGapiInitialized] = useState(false)
    const [gsiInitialized, setGsiInitialized] = useState(false)
    const [initializationInProgress, setInitializationInProgress] = useState(false)
    const [tokenClient, setTokenClient] = useState(null)
    const [loggedIn, setLoggedIn] = useState(false)
    const [emailAddress, setEmailAddress] = useState(null)

    const {showLoading, hideLoading} = useLoader()

    useEffect(() => {
        if ((gapiInitialized && gsiInitialized) || initializationInProgress) return

        setInitializationInProgress(true)
        showLoading()

        const gapiScriptNode = loadScript("https://apis.google.com/js/api.js", gapiOnLoad)
        const gsiScriptNode = loadScript("https://accounts.google.com/gsi/client", gsiOnLoad)

        return () => {
            document.body.removeChild(gapiScriptNode)
            document.body.removeChild(gsiScriptNode)
        }
    }, [gapiInitialized, gsiInitialized, initializationInProgress])

    useEffect(() => {
        if (gapiInitialized && gsiInitialized && initializationInProgress) {
            hideLoading()
            setInitializationInProgress(false)
        }
    }, [gapiInitialized, gsiInitialized, initializationInProgress])

    let gapiOnLoad = () => {
        gapi.load('client', async () => {
            await gapi.client.init({
                apiKey: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
                discoveryDocs: [DISCOVERY_DOC],
            });
            setGapiInitialized(true)
        });
    }

    let gsiOnLoad = () => {
        let token = google.accounts.oauth2.initTokenClient({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: async (resp) => {
                if (resp.error === undefined) {
                    try {
                        const emailAddress = await fetchUserEmailAddress()
                        setEmailAddress(emailAddress)
                        setLoggedIn(true)
                    } catch (error) {
                        setLoggedIn(false)
                        alert("Error during logging in to Google account")
                        console.error(error)
                    }
                    hideLoading()
                } else {
                    hideLoading()
                    alert("Error during logging in to Google account")
                    console.error(resp.error)
                }
            }
        });
        setTokenClient(token)
        setGsiInitialized(true)
    }

    let fetchUserEmailAddress = async () => {
        const response = await gapi.client.gmail.users.getProfile({'userId': 'me'})
        return response.result.emailAddress
    }

    let apiInitialized = () => gsiInitialized && gapiInitialized && tokenClient !== null

    let logIn = () => {
        if (!apiInitialized()) return

        showLoading()

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            tokenClient.requestAccessToken({prompt: ''});
        }
    }

    let isLoggedIn = () => loggedIn

    let logOut = () => {
        if (!isLoggedIn()) return

        showLoading()
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken('');
            setLoggedIn(false)
        }
        hideLoading()
    }

    let getEmailAddress = () => isLoggedIn() ? emailAddress : null

    let getGmailApi = () => isLoggedIn() ? new GmailApi(gapi.client) : null

    return (
        <AuthContext.Provider value={{
            apiInitialized,
            logIn,
            isLoggedIn,
            logOut,
            getEmailAddress,
            getGmailApi
        }}>
            {children}
        </AuthContext.Provider>
    )
}