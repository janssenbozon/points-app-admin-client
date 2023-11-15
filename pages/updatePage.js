import Head from 'next/head'
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { get, set, ref, update } from 'firebase/database';
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

        // for each event: 
        // change the name of the variable code to startCode
        // add endCode variable and generate random 6 digit code

        get(ref(database, 'events/')).then((snapshot) => {
            if (snapshot.exists()) {

                // try on one event
                const events = snapshot.val();

                // for each event
                Object.values(events).forEach((event) => {
                    console.log(event);
                    const startCode = event.code;
                    const endCode = Math.floor(100000 + Math.random() * 900000);
                    const updates = {};
                    updates['/events/' + startCode + '/code'] = startCode;
                    updates['/events/' + startCode + '/startCode'] = startCode;
                    updates['/events/' + startCode + '/endCode'] = endCode;
                    update(ref(database), updates);
                });

                console.log("Update complete!");
            } else {
                console.log("No data available");
            }
        }).catch((error) => {
            console.error(error);
        });

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
