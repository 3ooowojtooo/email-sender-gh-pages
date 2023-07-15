import React, {useEffect, useState} from "react";
import FileBase64 from 'react-file-base64'
import './Main.css'
import {useAuth} from "../../auth/AuthContextProvider";
import {Attachment} from "../../api/Attachment";
import {useLoader} from "../loader/LoaderContext";
import {Form} from "react-bootstrap";
import Timer from "../timer/Timer";

const LOCAL_STORAGE_DRAFT_ID_KEY = "DRAFT_ID"

function Main() {
    const [to, setTo] = useState("")
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [files, setFiles] = useState([])
    const [draftIdTyped, setDraftIdTyped] = useState("")

    const [draftId, setDraftId] = useState("")

    const {isLoggedIn, getGmailApi} = useAuth()
    const {showLoading, hideLoading} = useLoader()
    const gmailApi = getGmailApi()

    useEffect(() => {
        const localStorageDraftId = localStorage.getItem(LOCAL_STORAGE_DRAFT_ID_KEY)
        if (localStorageDraftId == null) {
            deleteDraftId()
        } else {
            saveDraftId(localStorageDraftId)
        }
    }, [saveDraftId])

    function saveDraftId(draft) {
        setDraftId(draft)
        localStorage.setItem(LOCAL_STORAGE_DRAFT_ID_KEY, draft)
    }

    let deleteDraftId = () => {
        setDraftId("")
        localStorage.removeItem(LOCAL_STORAGE_DRAFT_ID_KEY)
    }

    function isDraftIdSet() {
        return !(draftId === null || draftId === "")
    }

    let onFilesSelected = selectedFiles => {
        const mappedFiles = selectedFiles.map(f => new Attachment(f.type, f.name, f.base64.split(";base64,")[1]))
        setFiles(mappedFiles)
    }

    let createDraft = async () => {
        try {
            const fieldsValid = validateFields()
            if (!fieldsValid) return
            showLoading()
            const response = await gmailApi.createDraft(title, to, content, files)
            const draftId = response.data.id
            saveDraftId(draftId)
            hideLoading()
            alert("Stworzono wersję roboczą wiadomości.")
        } catch (err) {
            hideLoading()
            alert("Bład podczas tworzenia wersji roboczej emaila")
            console.error(err)
        }
    }

    let validateFields = () => {
        if (to === '' || to === undefined) {
            alert("Podaj adres email adresata")
            return false
        } else if (title === '' || title === undefined) {
            alert("Podaj tytuł maila")
            return false
        } else if (content === '' || content === undefined) {
            alert("Podaj treść maila")
            return false
        }

        return true
    }

    let clearFields = () => {
        setTo("")
        setTitle("")
        setContent("")
        setDraftIdTyped("")
    }

    let typedDraftButtonOnClick = () => {
        saveDraftId(draftIdTyped)
    }

    return (
        isLoggedIn() ?
            <div>
                <Form>
                    <Form.Group className="mb-3" controlId="to">
                        <Form.Label>Adres email adresata</Form.Label><br/>
                        <Form.Control type="email"
                                      placeholder="Podaj adres email adresata" value={to}
                                      size="lg"
                                      disabled={isDraftIdSet()}
                                      onChange={event => setTo(event.target.value)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="title">
                        <Form.Label>Tytuł emaila</Form.Label><br/>
                        <Form.Control as="textarea"
                                      placeholder="Wpisz tytuł maila" value={title}
                                      size="lg"
                                      disabled={isDraftIdSet()}
                                      onChange={event => setTitle(event.target.value)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="to">
                        <Form.Label>Treść emaila</Form.Label><br/>
                        <Form.Control as="textarea"
                                      placeholder="Wpisz treść maila" value={content}
                                      size="lg"
                                      disabled={isDraftIdSet()}
                                      onChange={event => setContent(event.target.value)}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="attachments">
                        <Form.Label>Załączniki</Form.Label><br/>
                        <FileBase64 multiple={true} onDone={onFilesSelected}/><br/>
                    </Form.Group><br/>
                    <Form.Group className="mb-3" controlId="draftIdTyped">
                        <Form.Label>Albo podaj draft id:</Form.Label><br/>
                        <Form.Control as="textarea"
                                      placeholder="Wpisz draft id" value={draftIdTyped}
                                      size="lg"
                                      disabled={isDraftIdSet()}
                                      onChange={event => setDraftIdTyped(event.target.value)}/>
                    </Form.Group>
                </Form>
                <button disabled={isDraftIdSet()} onClick={createDraft}>Stwórz wersję roboczą</button>
                <button disabled={isDraftIdSet()} onClick={typedDraftButtonOnClick}>Użyj wpisanego draft id</button>
                <Timer draftId={draftId} clearDraftId={deleteDraftId} clearForm={clearFields}/>
            </div>
            : <></>
    )
}

export default Main