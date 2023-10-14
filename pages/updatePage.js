import Head from 'next/head'
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { get, set, ref } from 'firebase/database';
import { database } from '../firebase/config';

export default function Dashboard() {

    const auth = useAuth();
    const router = useRouter();
    const handleSignout = async () => {
        if (await auth.signout()) {
            router.push('/login');
        } else {
            console.log("error signing out");
        }
    }

    function handleEvents() {
        // pull entire user database
        console.log("Starting update...");

        get(ref(database, 'users'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val());
                    var list = Object.values(snapshot.val());
                    list.forEach((user) => {

                        console.log("Updating user " + user.firstName + " " + user.lastName + " (" + user.uid + ")");

                        console.log("Past events: " + user.pastEvents);
                    
                        Object.values(user.pastEvents).forEach((event) => {
                            console.log("Updating event " + event.name + " (" + event.id + ")");
                            set(ref(database, 'events/' + event.code + '/attendees/' + user.uid), {
                                uid: user.uid,
                                name: user.firstName + " " + user.lastName
                            });
                        });
                    });

                    console.log("Update complete.");
                } else {
                    console.log("No data available");
                }
            })
            .catch((error) => {
                console.error(error);
            });

        // for each user:
            // pull their events
            // add to event attendees list for each event

        // for each user:
            // pull their phone number
            // add it to the phones database -> parent is phone VALUE is uid

            // pull their name
            // convert to lowercase
            // add it to names database -> parent is name CHILD is uid (for instances where two people share the same name)

    }


    // TODO: Break down into components
    return (

        <div>
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 class="text-5xl font-bold">Update</h1>
                <p class="py-3">Update your database.</p>
                <div class="flex flex-col space-y-3">
                    <button
                        class="btn btn-neutral"
                        onClick={() => handleEvents()}
                    >Update database (this cannot be undone!)</button>
                    <button
                        class="btn btn-error"
                        onClick={() => handleSignout()}
                    >Back</button>
                </div>
            </main>
        </div>
    )

}
