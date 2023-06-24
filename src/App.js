import React from "react";
import './App.css';
import {BrowserRouter} from "react-router-dom";
import {AuthContextProvider} from "./service/auth/AuthContextProvider";
import {useLoader} from "./service/component/loader/LoaderContext";
import Auth from "./service/component/auth/Auth";
import Main from "./service/component/main/Main";

function App() {
    const {shouldShowLoading} = useLoader()

    return (
        <BrowserRouter>
            <AuthContextProvider>
                {renderMain()}
                {renderLoader(shouldShowLoading)}
            </AuthContextProvider>
        </BrowserRouter>
    );
}

function renderMain() {
    return <div className="main">
        <Auth/>
        <Main/>
    </div>
}

function renderLoader(shouldShowLoading) {
    return shouldShowLoading() ?
        <div className="loader">Ładowanie...</div>
        :
        <></>
}

export default App;
