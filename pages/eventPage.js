import { database } from "@/firebase/config";
import { ref, get, set } from "firebase/database";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import { deleteEventFromFirebase } from "@/functions/eventFunctions";

export default function EventPage() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setLoading(true);
        const eventsRef = ref(database, 'events');
        get(eventsRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val());
                    var list = Object.values(snapshot.val());
                    list.sort(function (a, b) {
                        // Turn your strings into dates, and then subtract them
                        // to get a value that is either negative, positive, or zero.
                        return new Date(a.start) - new Date(b.start);
                    });
                    console.log(list);
                    setEvents(list);
                } else {
                    console.log("No data available");
                }
            })
            .catch((error) => {
                console.error(error);
            });
        setLoading(false);
    }, []);

    /**
     * Renders a list of events.
     * @returns {JSX.Element} The rendered events list.
     */
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

                                const date = new Date(event.start);
                                const dateString = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });

                                return (
                                    <tr key={event.startCode}>
                                        <td>{event.name}</td>
                                        <td>{event.category}</td>
                                        <td>{event.points}</td>
                                        <td>{dateString}</td>
                                        <td>{event.startCode}</td>
                                        <button onClick={() => {
                                            router.push({
                                                pathname: '/editEvent',
                                                query: {
                                                    eventCode: event.startCode,
                                                }
                                            }, '/editEvent');
                                        }}>
                                            <PencilSquareIcon className="h-4 w-4 mx-2 my-3" />
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
        <main className="flex w-full flex-col items-start justify-start p-12">
            <button class="btn btn-primary" onClick={() => router.push("/dashboard")}>Back to home</button>
            <div class="flex min-h-screen flex-col self-center space-y-3">
                {loading ? <span class="loading loading-spinner loading-lg" /> : <EventsList />}
                <div class="flex justify-center space-x-3">
                    <button
                        class="btn btn-primary"
                        onClick={() => router.push('/createEvent')}>Create an event
                    </button>
                </div>
            </div>
        </main>
    )
}