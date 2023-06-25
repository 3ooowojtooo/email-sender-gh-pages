import React, {useState} from "react";
import './Timer.css'
import {DateTimePicker} from "react-tempusdominus-bootstrap";
import {Form} from "react-bootstrap";
import {useTimer} from "react-timer-hook";
import {useAuth} from "../../auth/AuthContextProvider";

const DEFAULT_OFFSET_MS = parseInt(process.env.REACT_APP_OFFSET_MS)
const DEFAULT_DATE = new Date()
DEFAULT_DATE.setMilliseconds(0)

function Timer({draftId, clearDraftId, clearForm}) {

    const [date, setDate] = useState(DEFAULT_DATE)
    const [offsetMs, setOffsetMs] = useState(DEFAULT_OFFSET_MS)
    const [timerRunning, setTimerRunning] = useState(false)

    const {getGmailApi} = useAuth()
    const gmailApi = getGmailApi()

    const {
        seconds,
        minutes,
        hours,
        pause,
        restart,
    } = useTimer({ expiryTimestamp: date, onExpire: () => onTimerExpire(), autoStart: false });

    let shouldBeVisible = () => !(draftId === "" || draftId == null)

    let startTimer = () => {
        const newExpiryTimestamp = new Date(date.valueOf() - offsetMs)
        restart(newExpiryTimestamp, true)
        setTimerRunning(true)
    }

    let onTimerExpire = async () => {
        const now = new Date()
        console.log("expire; " + now.toLocaleString() + "; " + now.getMilliseconds())
        try {
            const response = await gmailApi.sendDraft(draftId)
            if (response.status === 200) {
                alert("Pomyślnie wysłano emaila")
                setTimerRunning(false)
                clearDraftId()
                clearForm()
            } else {
                alert("Błąd podczas wysyłania maila")
                console.error(JSON.stringify(response))
                setTimerRunning(false)
            }
        } catch (err) {
            alert("Błąd podczas wysyłania maila")
            console.error(err)
            setTimerRunning(false)
        }
    }

    let onCancel = () => {
        pause()
        setTimerRunning(false)
    }

    let displayOffsetMs = () => {
        if (offsetMs === 0)
            return ""
        else if (offsetMs > 0)
            return "plus " + offsetMs + " milisekund"
        else
            return "minus " + offsetMs + " milisekund"
    }

    return (
        shouldBeVisible() ?
            <div>
                <h2>Ustawianie czasu wysyłki maila</h2>
                <span>Identyfikator wersji roboczej: {draftId}</span>
                <button onClick={clearDraftId}>Powrót do definiowania wersji roboczej</button>
                <Form>
                    <Form.Group>
                        <Form.Label>Wybierz datę i czas wysłania maila</Form.Label><br/>
                        <DateTimePicker noIcon locale="pl"
                                        date={date} onChange={e => {
                                            const newDate = new Date(e.date)
                                            newDate.setMilliseconds(0)
                                            setDate(newDate)
                                        }}
                                        format="DD.MM.YYYY HH:mm:ss"
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Wybierz ile milisekund przed/po wybramym czasie mail ma zostać wysłany</Form.Label><br/>
                        <Form.Control type="number" value={offsetMs}
                                      size="lg"
                                      onChange={event => setOffsetMs(parseInt(event.target.value))}/>
                    </Form.Group>
                </Form><br/>
                <button disabled={timerRunning} onClick={startTimer}>Zaplanuj wysłanie</button><br/>
                {
                    timerRunning ?
                        <>
                            <span>Wysyłka zaplanowana na {date.toLocaleString()} {displayOffsetMs()}</span><br/>
                            <span>Czas do wysłania: <b>{hours}:{minutes}:{seconds}</b></span><br/>
                            <button onClick={onCancel}>Przerwij</button>
                        </>
                        :
                        <></>
                }
            </div>
            :
            <></>
    )
}

export default Timer