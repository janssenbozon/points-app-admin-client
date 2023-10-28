import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { get, ref, set } from "firebase/database";
import { database } from '../firebase/config';

export default function EditEvent() {

    const router = useRouter();
    const [user, setUser] = useState("");
    const [events, setEvents] = useState("");
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        console.log(router.query.uid);
        const userRef = ref(database, 'users/' + router.query.uid);
        get(userRef).then((snapshot) => {
            const user = snapshot.val();
            console.log(user);
            setUser(user)
            // pull event data

        }).catch((error) => {
            setError(error.code);
        })

    }, [router.query])

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

    function Header() {
        return (
            <div className='container'>
                <p className='text-xl font-bold font-lato'>{user.firstName}</p>
                {user.eventName == "NOT CHECKED IN" ? <p className='text-xl font-bold font-lato'>Not checked in</p> : <p className='text-xl font-bold font-lato'>Checked into: {user.eventName}</p>}
            </div>
        )
    }

    function PointsSummary() {
        return (
            <div className="container mx-auto pt-2">
                <h1 className=' w-full text-3xl font-bold font-lato pt-2 pb-2 text-start'>Point Summary</h1>
                <div className="card w-full bg-base-300 shadow-xl px-4 py-4">
                    <div className="px-4 py-3">
                        <h1 className='text-2xl font-bold font-lato pb-2'>Goodphil 2024</h1>
                        <progress className="progress progress-info w-full h-6" value={user.points.total} max="9"/>
                        <ProgressBar
                            category="Culture"
                            points={user.points.culture}
                            max={2}
                        />
                        <ProgressBar
                            category="Sports"
                            points={user.points.sports}
                            max={2}
                        />
                        <ProgressBar
                            category="Dance"
                            points={user.points.dance}
                            max={2}
                        />
                        <ProgressBar
                            category="Community"
                            points={user.points.community}
                            max={2}
                        />
                        <ProgressBar
                            category="Wildcard"
                            points={user.points.wildcard}
                            max={1}
                        />
                    </div>
                </div>
            </div>
        )
    }

    const EventsList = () => {
        return (
            <main class='flex flex-col space-y-3'>
                <div class='text-5xl font-bold text-center'>Events List</div>
                <div class="overflow-x-auto">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Points</th>
                                <th>Start</th>
                                <th>Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map((event) => {
                                return (
                                    <tr key={event.code}>
                                        <td>{event.name}</td>
                                        <td>{event.category}</td>
                                        <td>{event.points}</td>
                                        <td>{event.start.slice(2, 10)}</td>
                                        <td>{event.code}</td>
                                        <button onClick={() => openModal(event)}>
                                            <TrashIcon className="h-4 w-4 mx-2 my-3" />
                                        </button>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </main>
        )
    }


    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {loading ? <div class="loading loading-lg"></div> : null}
            {error ? <div className="alert alert-error">{error}</div> : null}
            {success ? <div className="alert alert-success">Your changes have been saved.</div> : null}
        </main>
    )
}
