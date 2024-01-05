import { get, ref, set, update } from "firebase/database";
import { database } from "../firebase/config";

/**
 * Deletes an event from Firebase.
 * 
 * @param {string} code - The code of the event to delete.
 * @returns {Promise<void>} A promise that resolves when the event is deleted successfully.
 */
export function deleteEventFromFirebase(code) {

    const eventRef = ref(database, 'events/' + code);

    return get(eventRef).then((snapshot) => {
        if (snapshot.exists()) {
            console.log(snapshot.val());
            set(ref(database, 'events/' + code), null);
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
}

/**
 * Updates an event in Firebase.
 * 
 * @param {string} eventCode - The code of the event to update.
 * @param {object} eventData - The data of the event to update.
 * @param {string} eventData.category - The category of the event.
 * @param {string} eventData.end - The end date of the event.
 * @param {string} eventData.name - The name of the event.
 * @param {number} eventData.points - The points of the event.
 * @param {string} eventData.start - The start date of the event.
 * @returns {Promise<void>} A promise that resolves when the event is updated.
 */
export function updateEventInFirebase(eventCode, eventData) {
    return update(ref(database, 'events/' + eventCode), {
        category: eventData.category,
        end: eventData.end,
        name: eventData.name,
        points: eventData.points,
        start: eventData.start,
    })
}


/**
 * Processes the attendees data and fetches additional user information.
 * 
 * @param {Object} attendees - The attendees data.
 * @returns {Promise<Array>} - A promise that resolves to an array of trimmed user objects.
 */
function processAttendees(attendees) {
    console.log("processAttendees()")
    return new Promise((resolve, reject) => {
        if (attendees != null) {
            // Create an array of promises for fetching user data
            const promises = Object.keys(attendees).map((uid) => {
                const userRef = ref(database, 'users/' + uid);
                return get(userRef).then((snapshot) => {
                    const user = snapshot.val();
                    const trimmedUser = {
                        name: user.firstName + " " + user.lastName,
                        year: user.year,
                        bigFam: user.bigFam,
                        phoneNumber: user.phoneNumber,
                    };
                    return trimmedUser;
                }).catch((error) => {
                    reject(error);
                });
            });

            // Use Promise.all to wait for all user data fetches to complete
            Promise.all(promises).then((userArray) => {
                resolve(userArray);
            });
        }
        else {
            return [];
        }
    });
}

/**
 * Retrieves an event from Firebase based on the provided code.
 * 
 * @param {string} code - The code of the event to retrieve.
 * @returns {Promise<object>} A promise that resolves to the formatted event object.
 * @throws {Error} If there is an error retrieving the event from Firebase.
 */
export function getEventFromFirebase(code) {
    return new Promise((resolve, reject) => {

        const eventRef = ref(database, 'events/' + code);

        get(eventRef).then(async (snapshot) => {

            const event = snapshot.val();
            const attendees = event.attendees ? await processAttendees(event.attendees) : [];

            let formattedEvent = {
                name: event.name,
                category: event.category,
                points: event.points,
                start: event.start,
                end: event.end,
                startCode: event.startCode,
                endCode: event.endCode,
                attendees: attendees
            }

            resolve(formattedEvent);

        }).catch((error) => {
            reject(error);
        })
    });
}


/**
 * Generates a unique event code.
 * @returns {Promise<number>} A promise that resolves with the generated event code.
 */
function generateEventCode() {
    console.log("generateEventCode()")
    return new Promise((resolve, reject) => {
        const code = Math.floor(100000 + Math.random() * 900000);
        const eventRef = ref(database, 'events/' + code);
        get(eventRef)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    // Code already exists, try generating a new one
                    return generateEventCode();
                } else {
                    console.log("Code: " + code);
                    resolve(code); // Resolve the promise with the generated code
                }
            })
            .catch((error) => {
                reject(error);
                setError("Error creating event. Please try again.");
            });
    });
}

/**
 * Creates a new event in Firebase.
 * @param {Object} eventData - The data of the event to be created.
 * @param {string} eventData.category - The category of the event.
 * @param {string} eventData.end - The end date of the event.
 * @param {string} eventData.name - The name of the event.
 * @param {number} eventData.points - The points associated with the event.
 * @param {string} eventData.start - The start date of the event.
 * @returns {Promise<Object>} - A promise that resolves with an object containing the startCode and endCode of the created event.
 * @throws {Error} - If there is an error creating the event in Firebase.
 */
export function createNewEventInFirebase(eventData) {
    return new Promise(async (resolve, reject) => {

        const eventStartCode = await generateEventCode();
        const eventEndCode = await generateEventCode();

        const returnData = {
            startCode: eventStartCode,
            endCode: eventEndCode,
        }

        set(ref(database, 'events/' + eventStartCode), {
            category: eventData.category,
            end: eventData.end,
            name: eventData.name,
            points: eventData.points,
            start: eventData.start,
            startCode: eventStartCode,
            endCode: eventEndCode,
            attendees: "",
        }).then(() => {
            resolve(returnData);
        }).catch((error) => {
            reject(error);
        });
    });
}