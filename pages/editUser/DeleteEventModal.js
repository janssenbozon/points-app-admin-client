import { database } from "@/firebase/config";
import { get, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

const DeleteEventModal = (props) => {
    const [showConfirm, setShowConfirm] = useState(true);
    const [showComplete, setShowComplete] = useState(false);
    const [showError, setShowError] = useState(false);
    const uid = props.user.uid;
    const event = props.event;
    
    const closeModal = () => {
        const modal = document.getElementById('deleteEventModal');
        setShowConfirm(true);
        setShowComplete(false);
        setShowError(false);
        modal.close();
    }

    const deleteEvent = () => {
        console.log("Deleting event...");
        console.log(event);
        console.log(uid);

        const user = props.user;
        let updates = {};
        const category = event.category.toLowerCase();
        console.log("Category = " + category);
        const points = user.points[category] - event.points;
        console.log("Points = " + points);

        updates['/users/' + uid + '/points/' + category] = points;
        updates['/users/' + uid + '/pastEvents/' + event.code] = null;
        updates['/events/' + event.code + '/attendees/' + uid] = null;

        update(ref(database), updates)
            .then(() => {
                console.log('Event deleted successfully!')
                setShowConfirm(false);
                setShowComplete(true);
            })
            .catch((error) => {
                console.error('Failed to delete event:', error);
                setShowConfirm(false);
                setShowError(true);
            });
    }

    const ConfirmationPrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Confirmation</h3>
                <p className="py-4">You're about to delete {event.name} from this user. This will remove {event.points} {event.category} points from this user. Are you sure you want to proceed?</p>
                <div className="modal-action">
                    {/* if there is a button in form, it will close the modal */}
                    <div className="flex flex-row justify-center space-x-3">
                        <button className="btn" onClick={() => closeModal()}>No, take me back!</button>
                        <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); deleteEvent(); }}>Yes, delete this event.</button>
                    </div>
                </div>
            </>
        )
    }

    const CompletePrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Success!</h3>
                <p className="py-4">The event has been deleted from this user.</p>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={() => props.router.reload()}>Close</button>
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
                <p className="py-4">Something went wrong while deleting the event.</p>
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
        <dialog id="deleteEventModal" className="modal">
            <div className="modal-box">
                {showConfirm ? <ConfirmationPrompt /> : null}
                {showComplete ? <CompletePrompt /> : null}
                {showError ? <ErrorPrompt /> : null}
            </div>
        </dialog>
    )
}

export default DeleteEventModal;
