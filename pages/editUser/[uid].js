import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import { database } from '../../firebase/config';
import { get, ref, set } from 'firebase/database';
import AddEventModal from './AddEventModal';

export default function Homepage() {

    const auth = useAuth();
    const [user, setUser] = useState(null);
    const router = useRouter();
    const [cultureEvents, setCultureEvents] = useState([]);
    const [sportsEvents, setSportsEvents] = useState([]);
    const [danceEvents, setDanceEvents] = useState([]);
    const [communityEvents, setCommunityEvents] = useState([]);
    const [wildcardEvents, setWildcardEvents] = useState([]);

    useEffect(() => {

        // fetch user data using query parameters from database
        const uid = router.query.uid;

        if (uid) {
            get(ref(database, 'users/' + uid)).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val());
                    const user = snapshot.val();
                    const pastEvents = Object.values(user.pastEvents);
                    console.log(pastEvents);
                    setUser(user);
                    setCultureEvents(pastEvents.filter((event) => event.category == "Culture"));
                    setSportsEvents(pastEvents.filter((event) => event.category == "Sports"));
                    setDanceEvents(pastEvents.filter((event) => event.category == "Dance"));
                    setCommunityEvents(pastEvents.filter((event) => event.category == "Community"));
                    setWildcardEvents(pastEvents.filter((event) => event.category == "Wildcard"));
                    console.log("User found!");
                    console.log(user);
                } else {
                    console.log("User does not exist.");
                }
            }
            ).catch((error) => {
                console.error(error);
            });
        }

    }, []);

    if (auth.loading || !user) {
        return (
            <span className="loading loading-spinner loading-lg" />
        )
    }

    const EventTable = (props) => {

        return (
            <div className="card w-full bg-base-300 shadow-xl px-4 py-4">
                <h1 className='text-2xl font-bold font-lato'>{props.title}</h1>
                {props.events.length == 0 ? <p className='text-sm font-lato'>No events yet</p> :
                    <table className='table mx-auto'>
                        <thead>
                            <tr>
                                <th className='px-4 py-2'>Event</th>
                                <th className='px-4 py-2'>Date</th>
                                <th className='px-4 py-2'>Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {props.events.map((event) => {

                                const date = new Date(event.start);
                                const dateString = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' });

                                return (
                                    <tr key={event.name}>
                                        <td className=''>{event.name}</td>
                                        <td className=''>{dateString}</td>
                                        <td className=''>{event.points}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                }
            </div>
        );
    };

    const ProgressBar = (props) => {
        return (
            <>
                <h1 className='text-lg font-bold font-lato pb-1'>{props.category} Points</h1>
                <div className='flex flex-row content-center'>
                    <div className='basis-5/6'>
                        <progress className="progress progress-info w-full h-4" value={props.points} max={props.max}></progress>
                    </div>
                    <div className='basis-1/6'>
                        <p className='text-center align-middle font-bold'>{props.points}/{props.max}</p>
                    </div>
                </div>
            </>
        )
    }

    return (
        <main className="flex min-h-screen flex-col items-start justify-start p-12">

            <button class="btn btn-primary" onClick={() => router.push("/searchUser")}>Back to home</button>

            <AddEventModal user={user}/>

            <div className='flex flex-col items-center w-full'>
                <p className='text-5xl font-bold font-lato'>{user.firstName + " " + user.lastName}</p>
                <p className='text-md font-bold font-lato text-base-600 pt-2'>{user.year + " | " + user.bigFam + " | " + user.phoneNumber}</p>
                {user.eventName != "NOT CHECKED IN" ? <p className='text-md font-bold font-lato text-primary'>Currently checked in to {user.eventName}</p> : <p className='text-md font-bold font-lato text-primary'>Not checked in to any event</p>}
            </div>


            <div className="container mx-auto pt-2">
                <h1 className=' w-full text-3xl font-bold font-lato pt-2 pb-2 text-start'>Point Summary</h1>
                <div className="card w-full bg-base-300 shadow-xl px-4 py-4">
                    <div className="px-4 py-3">
                        <h1 className='text-2xl font-bold font-lato pb-2'>Goodphil 2024</h1>
                        <progress className="progress progress-info w-full h-6" value={user.points.culture + user.points.sports + user.points.dance + user.points.community + user.points.wildcard} max="9"></progress>
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
                <div className="divider"/>
            </div>

            <div className="container mx-auto">
                <h1 className='w-full text-3xl font-bold font-lato pt-2 pb-2 text-start'>Event Log</h1>
                <div className="pt-3 pb-3 space-y-5">
                    <EventTable title="Sports" events={sportsEvents} />
                    <EventTable title="Culture" events={cultureEvents} />
                    <EventTable title="Community" events={communityEvents} />
                    <EventTable title="Dance" events={danceEvents} />
                    <EventTable title="Wildcard" events={wildcardEvents} />
                    <div class="flex justify-center"> 
                        <button class="btn btn-primary self-center" onClick={() => document.getElementById('addEventModal').showModal()}>Add Event</button>
                    </div>
                </div>
            </div>

        </main>
    )
}