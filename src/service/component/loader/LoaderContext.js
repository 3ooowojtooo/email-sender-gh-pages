import React, {useState} from "react";

export const LoaderContext = React.createContext();
export const useLoader = () => React.useContext(LoaderContext);

export const LoaderContextProvider = ({children}) => {
    const [loadingCounter, setLoadingCounter] = useState(0)

    const showLoading = () => {
        setLoadingCounter(oldValue => oldValue + 1)
    }

    const hideLoading = () => {
        setLoadingCounter(oldValue => oldValue - 1)
    }

    const shouldShowLoading = () => loadingCounter > 0

    return (
        <LoaderContext.Provider value={{
            showLoading,
            hideLoading,
            shouldShowLoading
        }}>
            {children}
        </LoaderContext.Provider>
    );
}