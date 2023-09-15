import { useState, useEffect } from "react";

function RelativeTime({ datetime }: { datetime: string }) {
    const [relativeTime, setRelativeTime] = useState("");

    useEffect(() => {
        // Convert the input datetime string to a Date object
        const date = new Date(datetime);
        const dateTime = new Date(datetime).getTime();
        // Get the current date and time
        const now = new Date().getTime();

        // Calculate the time difference in milliseconds
        const timeDifference = now - dateTime;

        // Convert milliseconds to seconds
        const secondsDifference = Math.floor(timeDifference / 1000);

        // Calculate the relative time
        let formattedTime = "";
        if (secondsDifference < 60) {
            formattedTime = `${secondsDifference} seconds ago`;
        } else if (secondsDifference < 3600) {
            const minutes = Math.floor(secondsDifference / 60);
            formattedTime = `${minutes} ${minutes === 1 ? "minute" : "minutes"
                } ago`;
        } else if (secondsDifference < 86400) {
            const hours = Math.floor(secondsDifference / 3600);
            formattedTime = `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
        } else {
            const day = date.getDate().toString().padStart(2, "0");
            const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");

            formattedTime = `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
        }

        // Set the relative time in the state
        setRelativeTime(formattedTime);
    }, [datetime]);

    return <span>{relativeTime}</span>;
}

export default RelativeTime;
