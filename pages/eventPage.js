import { database } from "@/firebase/config";
import { ref, get, set } from "firebase/database";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export default function EventPage() {

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null); // Store the event data to delete
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

    const handleDelete = () => {
        if (eventToDelete) {
          const { code } = eventToDelete;
          console.log("handleDelete()");
          console.log(code);
          const eventRef = ref(database, 'events/' + code);
          get(eventRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                console.log(snapshot.val());
                set(ref(database, 'events/' + code), null);
                router.reload();
              } else {
                console.log("No data available");
              }
            })
            .catch((error) => {
              console.error(error);
            });
        }
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
                                        <button onClick={() => {
                                            router.push({
                                                pathname: '/editEvent',
                                                query: {
                                                    eventCode: event.code,
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

    const openModal = (event) => {
        console.log("Model pressed");
        setEventToDelete(event); // Set the event data when opening the modal
        document.getElementById('my_modal_1').showModal();
    }

    const closeModel = () => {
        setEventToDelete(null); // Clear the event data when closing the modal
        document.getElementById('my_modal_1').close();
    }

    const PopUp = () => {
        return (
            <dialog id="my_modal_1" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg">Delete Event</h3>
                    <p className="py-4">Are you sure you want to delete {eventToDelete?.name}? This will not delete the event for people who have already claimed the point.</p>
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <div className="flex space-x-3">
                                <button className="btn" onClick={closeModel}>Close</button>
                                <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        )
    }


    return (
        <main>
            <div class="flex min-h-screen flex-col items-center justify-center space-y-3">
                {loading ? <span class="loading loading-spinner loading-lg"/> : <EventsList />}
                <PopUp />
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