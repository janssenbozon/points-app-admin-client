import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { deleteEventFromFirebase, getEventFromFirebase, updateEventInFirebase } from '@/functions/eventFunctions';

const Tab = ({ label, activeTab, onClick }) => {
    return (
        <a
            className={`tab ${activeTab === label ? 'tab-active' : ''}`}
            onClick={() => onClick(label)}
        >
            {label}
        </a>
    );
};

export default function EditEvent() {

    const router = useRouter();
    const [eventName, setEventName] = useState("");
    const [category, setCategory] = useState("");
    const [points, setPoints] = useState(null);
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [eventCard, setEventCard] = useState(true);
    const [eventCode, setEventCode] = useState(0);
    const [eventOutCode, setEventOutCode] = useState(0);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [attendees, setAttendees] = useState([]);
    const [activeTab, setActiveTab] = useState("Event Details");


    useEffect(() => {

        getEventFromFirebase(router.query.eventCode).then((event) => {
            setEventName(event.name);
            setCategory(event.category);
            setPoints(event.points);
            setStart(event.start);
            setEnd(event.end);
            setEventCode(event.startCode);
            setEventOutCode(event.endCode);
            setAttendees(event.attendees);
        }).catch((error) => {
            setError(error.code);
        });

    }, [router.query])

    const handleTabClick = (tabLabel) => {
        setActiveTab(tabLabel);
    };

    function handleClick() {

        // check if all fields are filled out
        if (eventName == "" || category == "" || points == null || start == null || end == null) {
            setError("Please fill out all fields.");
            return;
        }

        setLoading(true);
        setError(false);

        const newEventData = {
            name: eventName,
            category: category,
            points: points,
            start: start,
            end: end,
        }

        return updateEventInFirebase(eventCode, newEventData).then(() => {
            console.log("handleClick()");
            setLoading(false);
            closeModel();
            setSuccess(true);
        }).catch((error) => {
            setLoading(false);
            setError("Error creating event. Please try again. Error code: " + error.code);
            setEventCard(false);
        });
    }

    const PopUp = () => {
        return (
            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Are you sure?</h3>
                    <p className="py-4">Are you sure you want to make these changes? Changes will not reflect on users who already checked in.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <div className="flex flex-row justify-center space-x-3">
                                <button className="btn" onClick={closeModel}>No, take me back!</button>
                                <button className="btn btn-primary" onClick={handleClick}>Yes, save these changes.</button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        )
    }

    const DeleteModal = () => {
        return (
            <dialog id="my_modal_2" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete Event</h3>
                    <p className="py-4">Are you sure you want to delete {eventName}? This will not delete the event for people who have already claimed the point.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <div className="flex space-x-3">
                                <button className="btn" onClick={closeDelete}>No, take me back!</button>
                                <button className="btn btn-primary" onClick={handleDelete}>Delete Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        )
    }

    const ConfirmModal = () => {
        return (
            <dialog id="my_modal_3" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete Event</h3>
                    <p className="py-4">You have deleted {eventName}.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <div className="flex space-x-3">
                                <button className="btn btn-primary" onClick={() => router.push("/eventPage")}>Return to events page</button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        )
    }

    const ErrorModal = () => {
        return (
            <dialog id="my_modal_4" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Error deleting event</h3>
                    <p className="py-4">There was an error deleting {eventName}.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <div className="flex space-x-3">
                                <button className="btn btn-primary" onClick={() => document.getElementById('my_modal_4').close()}>Ok</button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        )
    }

    const openModal = (event) => {
        document.getElementById('my_modal_1').showModal();
    }

    const closeModel = () => {
        document.getElementById('my_modal_1').close();
    }

    const openDelete = (event) => {
        document.getElementById('my_modal_2').showModal();
    }

    const closeDelete = () => {
        document.getElementById('my_modal_2').close();
    }


    function CategorySelect() {
        return (
            <select className="select select-bordered select-primary w-full max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option disabled selected >Category</option>
                <option value="Culture">Culture</option>
                <option value="Community">Community</option>
                <option value="Dance">Dance</option>
                <option value="Sports">Sports</option>
                <option value="Wildcard">Wildcard</option>
            </select>
        )
    }

    function eventInput() {
        return (
            <div class="flex flex-col items-center w-full">
                <PopUp />
                <DeleteModal />
                <ConfirmModal />
                <ErrorModal />
                <p class="pt-2 pb-4">All fields are required.</p>
                <div class="flex flex-col space-y-2 w-80">
                    <input type="text" placeholder="Name" class="input input-bordered input-primary w-full max-w-xs" value={eventName} onChange={e => setEventName(e.target.value)} />
                    <CategorySelect />
                    <input type="number" placeholder="Points" class="input input-bordered input-primary w-full max-w-xs" value={points} onChange={e => setPoints(parseInt(e.target.value))} />
                    <h1 class="text-xl font-medium">Start Date and Time</h1>
                    <input type="datetime-local" class="input input-bordered input-primary" value={start} onChange={(e) => setStart(e.target.value)} />
                    <h1 class="text-xl font-medium">End Date and Time</h1>
                    <input type="datetime-local" class="input input-bordered input-primary" value={end} onChange={(e) => setEnd(e.target.value)} />
                    {error ? <div class="text-sm self-center text-red-400">{error}</div> : null}
                    {success ? <div class="text-sm self-center text-primary">Your changes have been saved.</div> : null}
                    <div class="flex justify-center py-3 space-x-3">
                        <button
                            class="btn bg-red-400"
                            onClick={() => openDelete()}>Delete event</button>
                        <button
                            class="btn btn-primary"
                            onClick={() => openModal()}>Save</button>
                    </div>
                </div>
            </div>
        )
    }

    const handleDelete = () => {
        console.log("handleDelete()");
        console.log(eventCode);

        deleteEventFromFirebase(eventCode).then(() => {
            document.getElementById('my_modal_2').close();
            document.getElementById('my_modal_3').showModal();
        }).catch((error) => {
            console.error(error);
            document.getElementById('my_modal_4').showModal();
        });
    }

    function attendeesList() {
        return (
            <>
                <div class='text-5xl font-bold text-center'>Attendees</div>
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Year</th>
                                <th>Big Fam</th>
                                <th>Phone Number</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendees.map((user) => {
                                return (
                                    <tr key={user.uid}>
                                        <td>{user.name}</td>
                                        <td>{user.year}</td>
                                        <td>{user.bigFam}</td>
                                        <td>{user.phoneNumber}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </>
        )
    }


    return (
        <main className="flex min-h-screen flex-col items-start justify-start p-12">
            <button class="btn btn-primary" onClick={() => router.push("/eventPage")}>Back to home</button>
            {loading ? <div class="loading loading-lg"></div> : null}
            <div className='flex flex-col w-full items-center justify-center'>
                <div className="text-5xl font-bold text-center">{eventName}</div>
                <div className="text-2xl font-bold text-center">In: {eventCode} / Out: {eventOutCode}</div>
                <div className="tabs tabs-boxed m-4">
                    <Tab
                        label="Event Details"
                        activeTab={activeTab}
                        onClick={handleTabClick}
                    />
                    <Tab
                        label="Attendees"
                        activeTab={activeTab}
                        onClick={handleTabClick}
                    />
                </div>
                {activeTab == "Event Details" ? eventInput() : null}
                {activeTab == "Attendees" ? attendeesList() : null}
            </div>
        </main>
    )
}
