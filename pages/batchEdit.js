import { useState } from "react";
import { ref, get, update } from "firebase/database";
import router from "next/router";
import { database } from "../firebase/config";

const BatchEditPage = () => {

    const [loading, setLoading] = useState(false);

    const [event, setEvent] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const [showNotFound, setShowNotFound] = useState(false);
    const [action, setAction] = useState("add");
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [eventError, setEventError] = useState("");
    const [eventLoading, setEventLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [usersNotFound, setUsersNotFound] = useState([]);

    const handleUsers = async () => {
        setUsers([]);
        setUsersNotFound([]);

        if (event == null) {
            setEventError("Event not selected.");
            return;
        }
        
        const phoneArray = phoneNumbers.split("\n");
        const promises = [];
        let notFound = false; // Add this line

        phoneArray.forEach((phoneNumber) => {
            promises.push(pullUserData(phoneNumber).catch(() => {
                notFound = true; // Set notFound to true if any promise rejects
            }));
        });

        Promise.all(promises).then(() => {
            if (notFound) { // Check the local variable instead of usersNotFound.length
                console.log("1 or more users not found.");
                document.getElementById("modal").showModal();
                setShowNotFound(true);
            } else {
                console.log("Users found.");
                document.getElementById("modal").showModal();
                setShowConfirm(true);
            }
        }).catch((error) => {
            console.error(error);
        });
    }

    const pullUserData = (phoneNumber) => new Promise((resolve, reject) => {
        const uidRef = ref(database, 'phones/' + phoneNumber + '/');
        get(uidRef).then((snapshot) => {
            if (snapshot.exists()) {
                const uid = snapshot.val();
                console.log(uid);
                pullUser(uid);
                resolve();
            } else {
                console.log("UID not found.");
                setUsersNotFound((usersNotFound) => [...usersNotFound, phoneNumber]);
                reject(); // Reject the promise when a user is not found
            }
        }).catch((error) => {
            console.error(error);
            reject();
        });
    });


    const pullUser = (uid) => {
        console.log("Pulling user...");
        const userRef = ref(database, 'users/' + uid + '/');
        get(userRef).then((snapshot) => {
            if (snapshot.exists()) {
                const user = snapshot.val();
                setUsers((users) => [...users, user]);
                console.log(user);
            } else {
                console.log("User not found.");
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    const performBatchEdit = () => {
        console.log("Batch editing...");
        console.log("Event = " + event);
        console.log("Action = " + action);
        console.log("Phone Numbers = " + phoneNumbers);
        setLoading(true);

        const updates = {};

        // format event data
        const eventCode = event.startCode;
        const category = event.category.toLowerCase();

        
        users.forEach((user) => {
            
            const uid = user.uid;
            if (action == "add" && user.pastEvents && !user.pastEvents[eventCode]) {
                updates['/users/' + uid + '/points/' + category] = user.points[category] + event.points;
                updates['/users/' + uid + '/pastEvents/' + eventCode] = {
                    name: event.name,
                    start: event.start,
                    points: event.points,
                    category: event.category
                };
                updates['/events/' + eventCode + '/attendees/' + uid] = { name: user.firstName + " " + user.lastName, uid: uid };
            } else if (action == "remove" && user.pastEvents && user.pastEvents[eventCode]) {
                updates['/users/' + uid + '/points/' + category] = user.points[category] - event.points;
                updates['/users/' + uid + '/pastEvents/' + eventCode] = null;
                updates['/events/' + eventCode + '/attendees/' + uid] = null;
            }
        });

        console.log(updates);

        update(ref(database), updates)
            .then(() => {
                console.log('Batch edit successful!')
                setShowConfirm(false);
                setShowComplete(true);
            })
            .catch((error) => {
                console.error('Failed to batch edit:', error);
                setShowConfirm(false);
                setShowError(true);
            });
    }

    const getEvent = (eventCode) => {
        console.log("Getting event...");
        setEventLoading(true);

        // check if input is empty
        if (eventCode == "") {
            setEventError("Event code is empty.");
            setEventLoading(false);
            return;
        }

        const eventRef = ref(database, 'events/' + eventCode);
        get(eventRef).then((snapshot) => {
            console.log(snapshot);
            if (snapshot.exists()) {
                const event = snapshot.val();
                console.log(event);
                setEvent(event);
                setEventError("");
                setEventLoading(false);
            } else {
                setEventError("Event does not exist.");
                setEventLoading(false);
            }
        }).catch((error) => {
            setEventError(error);
            setEventLoading(false);
            console.error(error);
        })
    }

    const EventComponent = () => {
        return (
            <>
                <p className='text-lg font-bold font-lato pt-3'>Event</p>
                {event ? <EventConfirmation /> : <EventInput />}
                {eventError ? <p className='text-red-500 font-bold font-lato'>{eventError}</p> : null}
            </>
        )
    }

    const EventConfirmation = () => {
        return (
            <>
                <div className='flex flex-row w-full items-center justify-center space-x-5'>
                    <p className='text-2xl font-bold font-lato py-3'>{event.name}</p>
                    <button className='btn btn-primary' onClick={(e) => setEvent(null)}>Change</button>
                </div>
            </>
        )
    }

    const EventInput = () => {

        const [eventInput, setEventInput] = useState("");

        return (
            <>
                <div className='flex flex-row w-full items-center justify-center space-x-5'>
                    {eventLoading ? <div class="loading loading-lg"></div> : <input className='input input-bordered w-auto' type="text" placeholder="Event Code" value={eventInput} onChange={(e) => setEventInput(e.target.value)}></input>}
                    <button className='btn btn-primary' onClick={(e) => getEvent(eventInput)}>Search</button>
                </div>
            </>
        )
    }

    const ConfirmationModal = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Confirmation</h3>
                <p className="py-4">You're about to {action} {event.name} to the following {phoneNumbers.length} users. Are you sure you want to proceed?</p>
                <table className='table mx-auto'>
                    <thead>
                        <tr>
                            <th className='px-4 py-2'>Name</th>
                            <th className='px-4 py-2'>Phone Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            return (
                                <tr key={user.uid}>
                                    <td className=''>{user.firstName} {user.lastName}</td>
                                    <td className=''>{user.phoneNumber}</td>
                                </tr>
                            );
                        }
                        )}
                    </tbody>
                </table>
                <div className="modal-action">
                    {/* if there is a button in form, it will close the modal */}
                    <div className="flex flex-row justify-center space-x-3">
                        <button className="btn" onClick={() => closeModal()}>No, take me back!</button>
                        <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); performBatchEdit(); }}>Yes, save these changes.</button>
                    </div>
                </div>
            </>
        )
    }

    const CouldNotFindUsersModal = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Could not find users</h3>
                <p className="py-4">The following phone numbers could not be found in the database. Do you want to proceed anyways?</p>
                <table className='table mx-auto'>
                    <thead>
                        <tr>
                            <th className='px-4 py-2'>Phone Number</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersNotFound.map((phoneNumber) => {
                            return (
                                <tr key={phoneNumber}>
                                    <td className=''>{phoneNumber}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="modal-action">
                    {/* if there is a button in form, it will close the modal */}
                    <div className="flex flex-row justify-center space-x-3">
                        <button className="btn btn-primary" onClick={() => closeModal()}>Go back</button>
                        <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); setShowNotFound(false); setShowConfirm(true); }}>Proceed</button>
                    </div>
                </div>
            </>
        )
    }

    const CompleteModal = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Success!</h3>
                <p className="py-4">Batch update completed.</p>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={() => router.reload()}>Close</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    const closeModal = () => {
        document.getElementById("modal").close();
        setShowConfirm(false);
        setShowComplete(false);
        setShowNotFound(false);
    }

    return (
        <main className="flex min-h-screen flex-col items-start justify-start p-12">
            <button class="btn btn-primary" onClick={() => router.push("/dashboard")}>Back to home</button>
            {loading ? <div class="loading loading-lg"></div> : null}
            <div className='flex flex-col w-full items-center justify-center'>
                <dialog id="modal" className="modal">
                    <div className="modal-box">
                        {showConfirm ? <ConfirmationModal /> : null}
                        {showNotFound ? <CouldNotFindUsersModal /> : null}
                        {showComplete ? <CompleteModal /> : null}
                    </div>
                </dialog>
                <p className='text-5xl font-bold font-lato pb-5'>Batch Edit</p>
                <form className='flex flex-col w-full items-center justify-center'>
                    <EventComponent />
                    <p className='text-lg font-bold font-lato pt-3'>Action</p>
                    <select className='select select-bordered w-1/2' value={action} onChange={(e) => { e.preventDefault(); setAction(e.target.value) }}>
                        <option disabled selected>Select an action</option>
                        <option value="add">Add</option>
                        <option value="remove">Remove</option>
                    </select>
                    <p className='text-lg font-bold font-lato pt-3'>Phone Numbers</p>
                    <p className='text-sm font-lato pb-3'>Enter phone numbers separated by new lines.</p>
                    <textarea className='textarea textarea-bordered w-1/2 mb-4' placeholder="Phone Numbers" onChange={(e) => setPhoneNumbers(e.target.value)}></textarea>
                </form>
                <button className='btn btn-primary' onClick={() => handleUsers()}>Submit</button>
            </div>
        </main>
    );
}

export default BatchEditPage;