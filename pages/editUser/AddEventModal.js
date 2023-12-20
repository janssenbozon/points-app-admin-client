import { database } from "@/firebase/config";
import { get, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

const AddEventModal = (props) => {

    const [showInput, setShowInput] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorCode, setErrorCode] = useState();
    const [eventCode, setEventCode] = useState("");
    const uid = props.user.uid;
    const pastEventsKeys = Object.keys(props.user.pastEvents);
    const [event, setEvent] = useState(null);

    const closeModal = () => {
        const modal = document.getElementById('addEventModal');
        setShowInput(true);
        setShowConfirm(false);
        setShowComplete(false);
        setShowError(false);
        setErrorCode("");
        modal.close();
    }

    const getEvent = (eventCode) => {
        console.log("Getting event...");

        if (pastEventsKeys.includes(eventCode)) {
            setErrorCode("User already has this event.");
            return;
        }

        const eventRef = ref(database, 'events/' + eventCode);
        get(eventRef).then((snapshot) => {
            console.log(snapshot);
            if (snapshot.exists()) {
                const event = snapshot.val();

                const formattedEvent = {
                    name: event.name,
                    start: event.start,
                    points: event.points,
                    category: event.category
                }
                setEvent(formattedEvent);
                setEventCode(eventCode);
                setShowInput(false);
                setShowConfirm(true);
            } else {
                setErrorCode("Event does not exist.");
            }
        }).catch((error) => {
            setErrorCode(error);
            console.error(error);
        })
    }

    const addToUser = () => {
        console.log("Adding event to user...");
        console.log(event);
        console.log(uid);

        const user = props.user;
        let updates = {};
        const category = event.category.toLowerCase();
        console.log("Category = " + category);
        const points = user.points[category] + event.points;
        console.log("Points = " + points);

        updates['/users/' + uid + '/points/' + event.category] = points;
        updates['/users/' + uid + '/pastEvents/' + eventCode] = {
            name: event.name,
            start: event.start,
            points: event.points,
            category: event.category
        };
        updates['/events/' + eventCode + '/attendees/' + uid] = { name: user.firstName + " " + user.lastName, uid: uid };

        update(ref(database), updates)
        .then(() => {
            console.log('User status changed to checked out!')
            setShowConfirm(false);
            setShowComplete(true);
        })
        .catch((error) => {
            console.error('Failed to update user\'s status:', error);
            setShowConfirm(false);
            setShowError(true);
        });
    }


    const ConfirmationPrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Confirmation</h3>
                <p className="py-4">You're about to add {event.name} to this user. This will give this user {event.points} {event.category} points. Are you sure you want to proceed?</p>
                <div className="modal-action">
                    {/* if there is a button in form, it will close the modal */}
                    <div className="flex flex-row justify-center space-x-3">
                        <button className="btn" onClick={() => closeModal()}>No, take me back!</button>
                        <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); addToUser(); }}>Yes, save these changes.</button>
                    </div>
                </div>
            </>
        )
    }

    const InputPrompt = () => {
        const [eventCode, setEventCode] = useState("");
        return (
            <>
                <h3 className="font-bold text-lg">Add an event</h3>
                <p className="py-4">Enter the event code for the event you would like to add.</p>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">Event Code</span>
                    </label>
                    <input type="text" placeholder="Event Code" className="input input-bordered" value={eventCode} onChange={(e) => setEventCode(e.target.value)} />
                    <p className="text-sm text-error">{errorCode}</p>
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={() => closeModal()}>No, take me back!</button>
                            <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); getEvent(eventCode); }}>Search</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    const CompletePrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Success!</h3>
                <p className="py-4">The event has been added to this user.</p>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={() => closeModal()}>Close</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    const ErrorPrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Error</h3>
                <p className="py-4">Something went wrong while adding the event.</p>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={closeModal}>Close</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    return (
        <dialog id="addEventModal" className="modal">
            <div className="modal-box">
                {showInput ? <InputPrompt /> : null}
                {showConfirm ? <ConfirmationPrompt /> : null}
                {showComplete ? <CompletePrompt /> : null}
                {showError ? <ErrorPrompt /> : null}
            </div>
        </dialog>
    )
}

export default AddEventModal;





