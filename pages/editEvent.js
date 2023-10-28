import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { get, ref, set } from "firebase/database";
import { database } from '../firebase/config';
import { resolve } from 'styled-jsx/css';
import { auth } from '../firebase/config';
import Link from 'next/link';

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
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [attendees, setAttendees] = useState([]);
    const [activeTab, setActiveTab] = useState("Event Details");


    useEffect(() => {
        console.log(router.query.eventCode);
        const eventRef = ref(database, 'events/' + router.query.eventCode);
        get(eventRef).then((snapshot) => {
            const event = snapshot.val();
            console.log(event);
            setEventName(event.name);
            setCategory(event.category);
            setPoints(event.points);
            setStart(event.start);
            setEnd(event.end);
            setEventCode(router.query.eventCode);
            setAttendees([]);

            if (event.attendees != null) {
                // Create an array of promises for fetching user data
                const promises = Object.keys(event.attendees).map((uid) => {
                    const userRef = ref(database, 'users/' + uid);
                    return get(userRef).then((snapshot) => {
                        const user = snapshot.val();
                        const trimmedUser = {
                            name: user.firstName + " " + user.lastName,
                            year: user.year,
                            bigFam: user.bigFam,
                            phoneNumber: user.phoneNumber,
                        };
                        return trimmedUser;
                    }).catch((error) => {
                        setError(error.code);
                    });
                });

                // Use Promise.all to wait for all user data fetches to complete
                Promise.all(promises).then((userArray) => {
                    // Update the attendees state with the user data
                    setAttendees(userArray);
                });
            }
        }).catch((error) => {
            setError(error.code);
        })

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

        return new Promise(async (resolve, reject) => {
            setLoading(true);
            setError(false);

            set(ref(database, 'events/' + eventCode), {
                category: category,
                end: end,
                name: eventName,
                points: points,
                start: start,
                code: eventCode,
            }).then(() => {
                console.log("handleClick()");
                setLoading(false);
                closeModel();
                setSuccess(true);
                resolve(true);
            }).catch((error) => {
                setLoading(false);
                setError("Error creating event. Please try again. Error code: " + error.code);
                setEventCard(false);
                reject(error);
            });
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

    const openModal = (event) => {
        console.log("Model pressed");
        document.getElementById('my_modal_1').showModal();
    }

    const closeModel = () => {
        document.getElementById('my_modal_1').close();
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
                <h1 class="text-5xl font-bold">Edit an Event</h1>
                <p class="pt-2 pb-4">All fields are required.</p>
                <div class="flex flex-col space-y-2 w-80">
                    <input type="text" placeholder="Name" class="input input-bordered input-primary w-full max-w-xs" value={eventName} onChange={e => setEventName(e.target.value)} />
                    <CategorySelect/>
                    <input type="number" placeholder="Points" class="input input-bordered input-primary w-full max-w-xs" value={points} onChange={e => setPoints(parseInt(e.target.value))} />
                    <h1 class="text-xl font-medium">Start Date and Time</h1>
                    <input type="datetime-local" class="input input-bordered input-primary" value={start} onChange={(e) => setStart(e.target.value)} />
                    <h1 class="text-xl font-medium">End Date and Time</h1>
                    <input type="datetime-local" class="input input-bordered input-primary" value={end} onChange={(e) => setEnd(e.target.value)} />
                    {error ? <div class="text-sm self-center text-red-400">{error}</div> : null}
                    {success ? <div class="text-sm self-center text-primary">Your changes have been saved.</div> : null}
                    <div class="flex justify-center py-3 space-x-3">
                        <button
                            class="btn btn-primary"
                            onClick={() => router.push('/eventPage')}>Back</button>
                        <button
                            class="btn btn-primary"
                            onClick={() => openModal()}>Save</button>
                    </div>
                </div>
            </div>
        )
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
