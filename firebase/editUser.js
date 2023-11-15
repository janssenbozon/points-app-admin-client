import { update, get, set } from "firebase/database";
import { database } from "./config";

function updateName(id, firstName, lastName) {

    const updates = {};
    updates['/users/' + id + '/firstName'] = firstName;
    updates['/users/' + id + '/lastName'] = lastName;
    updates['/names/' + firstName + ' ' + lastName + '/' + id] = id;

    update(ref(database), updates).then(() => {
        console.log('Name updated!')
        return true;
    }).catch((error) => {
        console.error('Failed to update name:', error);
        return false;
    });
    
}

function updateBigFamily(id, bigFam) {

    update(ref(database, 'users/' + id), {
        bigFam: bigFam
    });

}

function updateYear(id, year) {

    update(ref(database, 'users/' + id), {
        year: year
    });

}

async function addEvent(userId, eventId) {

    const event = await get(ref(database, 'events/' + eventId));
    const user = await get(ref(database, 'users/' + userId));
    const category = event.category.toLowerCase();
    const points = user.points[category] + event.points;

    const updates = {};
    updates['/users/' + userId + '/points/' + category] = points;
    updates['/users/' + userId + '/pastEvents/' + event.startCode] = {
        name: event.name,
        start: event.start,
        points: event.points,
        category: event.category
    };
    updates['/events/' + eventID + '/attendees/' + uid] = { name: user.firstName + " " + user.lastName, uid: userId };

    update(ref(database), updates)
        .then(() => {
            console.log('Event added!')
            return true;
        })
        .catch((error) => {
            console.error('Failed to update user\'s status:', error);
            return false;
        });

}

async function removeEvent(userId, eventId) {

    const event = await get(ref(database, 'events/' + eventId));
    const user = await get(ref(database, 'users/' + userId));
    const category = event.category.toLowerCase();
    const points = user.points[category] - event.points;

    const updates = {};
    updates['/users/' + userId + '/points/' + category] = points;
    updates['/users/' + userId + '/pastEvents/' + event.startCode] = null;
    updates['/events/' + eventID + '/attendees/' + uid] = null;

    update(ref(database), updates)
        .then(() => {
            console.log('Event removed!')
            return true;
        })
        .catch((error) => {
            console.error('Failed to update user\'s status:', error);
            return false;
        });

}

export { updateName, updateBigFamily, updateYear, addEvent, removeEvent };