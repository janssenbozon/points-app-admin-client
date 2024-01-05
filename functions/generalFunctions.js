import { get, ref } from "firebase/database";
import { database } from "../firebase/config";

export function getEntireDatabase() {
    return get(ref(database, "/")).then((snapshot) => {
        console.log("data fetched!")
        let data = snapshot.val();
        return data;
    });
}