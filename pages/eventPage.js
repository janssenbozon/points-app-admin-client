import { database } from "@/firebase/config";
import { ref, get } from "firebase/database";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

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
        <main>
            <div class="flex min-h-screen flex-col items-center justify-center space-y-3">
                {loading ? <div class="loading loading-lg"/> : <EventsList />}
                <div class="flex justify-center space-x-3">
                <button
                    class="btn btn-primary"
                    onClick={() => router.push('/dashboard')}>Back to dashboard</button>
                <button
                    class="btn btn-primary"
                    onClick={() => router.push('/createEvent')}>Create an event</button>
                </div>
            </div>
        </main>
    )
}