export function convertToCsv(jsonData) {

    // Prepare CSV data
    const csvRows = [];
    const headers = ['Name', 'Year', 'Big Fam', 'Phone Number', 'Total Points', 'GoodPhil Eligible'];

    // Prepare event headers
    const events = jsonData.events;
    const eventIds = Object.keys(events).filter(id => id !== 'placeholder');
    const eventHeaders = eventIds.map(eventId => events[eventId].name);
    headers.push(...eventHeaders);

    // Prepare user rows
    const users = jsonData.users;
    Object.entries(users).forEach(([userId, userData]) => {
        const row = [];

        if (typeof userData === 'object') {
            row.push(`${userData.firstName} ${userData.lastName}`);
            row.push(userData.year);
            row.push(userData.bigFam);
            row.push(userData.phoneNumber || '');  // Include phone number

            // Calculate total points
            const points = userData.points;
            const totalPoints = Object.values(points).reduce((acc, val) => acc + val, 0);
            row.push(totalPoints);

            // Check GoodPhil eligibility
            const eligible = (points.sports >= 2 && points.dance >= 2 &&
                points.community >= 2 && points.culture >= 2 &&
                points.wildcard === 1 && totalPoints === 9) ? 'yes' : 'no';
            row.push(eligible);

            // Check event attendance
            const pastEvents = userData.pastEvents;
            const attendedEvents = Object.keys(pastEvents || {});
            eventIds.forEach(eventId => row.push(attendedEvents.includes(eventId) ? '✔' : ''));
        } else {
            row.push(...Array(headers.length - 1).fill(''));  // Fill empty row for string-based user data
        }

        csvRows.push(row);
    });

    const csvContent = [headers.join(',')].concat(csvRows.map(row => row.join(','))).join('\n');

    console.log(`CSV file has been created successfully.`);

    // return csvContent;
    return csvContent;
}


