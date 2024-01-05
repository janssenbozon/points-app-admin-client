import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createNewEventInFirebase } from '@/functions/eventFunctions';

export default function CreateEvent() {

    const router = useRouter();
    const [eventName, setEventName] = useState("");
    const [category, setCategory] = useState("Select a Category");
    const [points, setPoints] = useState(null);
    const [start, setStart] = useState(new Date());
    const [end, setEnd] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [eventCard, setEventCard] = useState(true);
    const [eventStartCode, setEventStartCode] = useState(0);
    const [eventEndCode, setEventEndCode] = useState(0);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    /**
     * Handles the click event for creating a new event.
     */
    function handleClick() {

        setLoading(true);
        setError(false);

        // check if all fields are filled out
        if (eventName == "" || category == "Select a Category" || points == null || start == null || end == null) {
            setError("Please fill out all fields.");
            setLoading(false);
            return;
        }

        // create event object based on input
        const eventToCreate = {
            category: category,
            end: end,
            name: eventName,
            points: points,
            start: start,
        }

        // create event in firebase
        createNewEventInFirebase(eventToCreate).then((codes) => {
            setEventStartCode(codes.startCode);
            setEventEndCode(codes.endCode);
            setLoading(false);
            setSuccess(true);
            setEventCard(false);
        }).catch((error) => {
            setLoading(false);
            setError("Error creating event. Please try again.");
            setEventCard(false);
        });
    }
    
    /**
     * Renders a success card component with event creation details.
     * @returns {JSX.Element} The success card component.
     */
    function successCard() {
        return (
            <div>
                <div class="flex flex-col text-center">
                    <h2 class="text-5xl font-bold">Event created!</h2>
                    <div class="pt-4 pb-4">
                        The start/end code is: <div class="text-2xl font-bold">{eventStartCode} / {eventEndCode}</div>Please save this code for future reference.
                    </div>
                </div>
                <div class="flex justify-center py-3">
                    <button
                        class="btn btn-primary"
                        onClick={() => router.push('/eventPage')}>Return to Events</button>
                </div>
            </div>
        )
    }

    function CategorySelect() {
        return (
            <select className="select select-bordered select-primary w-full max-w-xs" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Select a Category" selected="true" disabled="disabled">Select a Category</option>
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
            <div class="justify-center">
                <h1 class="text-5xl font-bold">Create an event.</h1>
                <p class="pt-2 pb-4 text-center">All fields are required.</p>
                <div class="flex flex-col space-y-2 w-80">
                    <input type="text" placeholder="Name" class="input input-bordered input-primary w-full max-w-xs" value={eventName} onChange={e => setEventName(e.target.value)} />
                    <CategorySelect />
                    <input type="number" placeholder="Points" class="input input-bordered input-primary w-full max-w-xs" value={points} onChange={e => setPoints(parseInt(e.target.value))} />
                    <h1 class="text-xl font-medium">Start Date and Time</h1>
                    <div class="flex flex-row space-x-2">
                        <input type="datetime-local" class="input input-bordered input-primary w-full" value={start} onChange={(e) => setStart(e.target.value)} />
                    </div>
                    <h1 class="text-xl font-medium">End Date and Time</h1>
                    <div class="flex flex-row space-x-2">
                        <input type="datetime-local" class="input input-bordered input-primary w-full" value={end} onChange={(e) => setEnd(e.target.value)} />
                    </div>
                    {error ? <div class="text-sm self-center text-red-400">{error}</div> : null}
                    <div class="flex justify-center py-3 space-x-3">
                        <button
                            class="btn btn-primary"
                            onClick={() => router.push('/dashboard')}>Back to dashboard</button>
                        <button
                            class="btn btn-primary"
                            onClick={() => handleClick()}>Create</button>
                    </div>
                </div>
            </div>
        )
    }


    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24">
            {loading ? <div class="loading loading-lg"></div> : null}
            {eventCard ? eventInput() : null}
            {success ? successCard() : null}
        </main>
    )
}
