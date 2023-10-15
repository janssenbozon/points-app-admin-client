import Head from 'next/head'
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { get, ref, set } from 'firebase/database';
import { database } from '../firebase/config';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/20/solid';

export default function SearchUser() {

    const auth = useAuth();
    const router = useRouter();
    const [error, setError] = useState(false);
    const [showSearch, setShowSearch] = useState(true);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    function handleSearch(input) {
        console.log(input);

        // check if input is string or number
        if (isNaN(input)) {
            // input is string
            console.log("input is string");

            // pull uid(s) from names database
            get(ref(database, 'names/' + input)).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log("User found!");
                    console.log(snapshot.val());
                    const uids = snapshot.val();
                    Object.values(uids).forEach((uid) => {
                        get(ref(database, 'users/' + uid)).then((snapshot) => {
                            if (snapshot.exists()) {
                                console.log(snapshot.val());
                                const user = snapshot.val();
                                setResults(results => [...results, user]);
                            }
                        }).catch((error) => {
                            setError(error.code);
                        });
                    });
                } else {
                    setError("User does not exist.");
                }
            }).then(() => {
                setShowResults(true);
                setShowSearch(false);
            }).catch((error) => {
                setError(error.code);
            });

        } else {
            // input is number
            console.log("input is number");

            // pull uid from phones database
            get(ref(database, 'phones/' + input)).then((snapshot) => {
                if (snapshot.exists()) {
                    console.log(snapshot.val());
                    const uid = snapshot.val();
                    get(ref(database, 'users/' + uid)).then((snapshot) => {
                        if (snapshot.exists()) {
                            console.log(snapshot.val());
                            const user = snapshot.val();
                            setResults(results => [...results, user]);
                        }
                    }).catch((error) => {
                        setError(error.code);
                    });
                } else {
                    setError("User does not exist.");
                }
            }).then(() => {
                setShowResults(true);
                setShowSearch(false);
            }).catch((error) => {
                setError(error.code);
            });
        }
    }

    const Results = () => {
        return (
            <>
                <main class='flex flex-col space-y-3'>
                    <div class='text-5xl font-bold text-center'>Events List</div>
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
                                {results.map((user) => {
                                    return (
                                        <tr key={user.uid}>
                                            <td>{user.firstName + " " + user.lastName}</td>
                                            <td>{user.year}</td>
                                            <td>{user.bigFam}</td>
                                            <td>{user.phoneNumber}</td>
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
            </>
        )
    }

    const Search = () => {
        const [input, setInput] = useState();
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 class="text-5xl font-bold">Search For a User</h1>
                <p class="py-3">Look up a user by name or phone number.</p>
                <div class="flex flex-col space-y-3">
                    <input type="text" placeholder="Enter name or number" className="input input-bordered w-full max-w-xs" value={input} onChange={e => setInput(e.target.value)} />
                    <button
                        class="btn btn-neutral"
                        onClick={() => handleSearch(input)}
                    >Search</button>
                    <button
                        class="btn btn-neutral"
                        onClick={() => router.push('/dashboard')}
                    >Back</button>
                </div>
            </main>
        )
    }


    // TODO: Break down into components
    return (

        <div>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com"></link>
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin></link>
                <link href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap" rel="stylesheet"></link>
            </Head>
            { showSearch ? <Search /> : null}
            { showResults ? <Results /> : null}
        </div>
    )

}
