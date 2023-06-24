import React from "react";
import {useAuth} from "../../auth/AuthContextProvider";

function Auth() {
    const {logIn, isLoggedIn, logOut, getEmailAddress} = useAuth()

    let notLoggedInContent = <>
        Niezalogowany
        <button onClick={logIn}>Zaloguj</button>
    </>

    let loggedInContent = <>
        Zalogowany jako {getEmailAddress()}
        <button onClick={logOut}>Wyloguj</button>
    </>

    return (
        isLoggedIn() ? loggedInContent : notLoggedInContent
    )
}

export default Auth