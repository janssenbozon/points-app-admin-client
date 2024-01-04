import Head from 'next/head'
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { get, ref } from 'firebase/database';
import { database } from '../firebase/config';
import { convertToCsv } from '../functions/formatData';

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

    function handleSearch() {
        router.push('/searchUser');
    }

    function handleEvents() {
        router.push('/eventPage');
    }
    function handleBatchEdit() {
        router.push('/batchEdit');
    }

    function handleExport() {
        get(ref(database, "/")).then((snapshot) => {
            console.log("data fetched!")
            let data = snapshot.val();
            console.log("data as json: ", data);
            let dataAsCsv = convertToCsv(data);
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataAsCsv));
            element.setAttribute('download', 'goodphil_data.csv');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        });
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
            <main className="flex min-h-screen flex-col items-center justify-center p-24">
                <h1 class="text-5xl font-bold">Dashboard</h1>
                <p class="py-3">What would you like to do?</p>
                <div class="flex flex-col space-y-3">
                    <button
                        class="btn btn-neutral"
                        onClick={() => handleEvents()}
                    >View events</button>
                    <button
                        class="btn btn-neutral"
                        onClick={() => handleSearch()}
                    >Search for a user</button>
                    <button
                        class="btn btn-neutral"
                        onClick={() => handleBatchEdit()}
                    >Batch edit users</button>
                    <button
                        class="btn btn-neutral"
                        onClick={() => handleExport()}
                    >Export User Data</button>
                    <button
                        class="btn btn-error"
                        onClick={() => handleSignout()}
                    >Log out</button>
                </div>
            </main>
        </div>
    )

}
