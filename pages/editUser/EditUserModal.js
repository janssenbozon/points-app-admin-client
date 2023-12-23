import { database } from "@/firebase/config";
import { get, ref, update } from "firebase/database";
import { useEffect, useState } from "react";

const EditUserModal = (props) => {

    const [showInput, setShowInput] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showComplete, setShowComplete] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorCode, setErrorCode] = useState();
    // make a newUser object with the same properties as user
    const user = props.user;
    const [newUser, setNewUser] = useState({
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        year: props.user.year,
        bigFam: props.user.bigFam
    });

    const closeModal = () => {
        const modal = document.getElementById('editUserModal');
        setShowInput(true);
        setShowConfirm(false);
        setShowComplete(false);
        setShowError(false);
        setErrorCode("");
        modal.close();
    }

    const updateUserData = (newUser) => {
        console.log("Updating user data...");

        const updates = {};
        const oldName = user.firstName + " " + user.lastName;
        const newName = newUser.firstName + " " + newUser.lastName;

        updates['/users/' + user.uid + '/firstName'] = newUser.firstName;
        updates['/users/' + user.uid + '/lastName'] = newUser.lastName;
        updates['/users/' + user.uid + '/year'] = newUser.year;
        updates['/users/' + user.uid + '/bigFam'] = newUser.bigFam;

        // update names database
        updates['/names/' + oldName.toLowerCase() + '/' + user.uid] = null;
        updates['/names/' + newName.toLowerCase() + '/' + user.uid] = user.uid;
    }
        

    const ConfirmationPrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Confirmation</h3>
                <p className="py-4">You're about to change this user's personal data. Are you sure you want to proceed?</p>
                <div className="modal-action">
                    {/* if there is a button in form, it will close the modal */}
                    <div className="flex flex-row justify-center space-x-3">
                        <button className="btn" onClick={() => closeModal()}>No, take me back!</button>
                        <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); updateUserData(); }}>Yes, save these changes.</button>
                    </div>
                </div>
            </>
        )
    }

    const InputPrompt = () => {
        const [firstName, setFirstName] = useState(user.firstName);
        const [lastName, setLastName] = useState(user.lastName);
        const [year, setYear] = useState(user.year);
        const [bigFam, setBigFam] = useState(user.bigFam);

        return (
            <>
                <h3 className="font-bold text-lg">Edit User</h3>
                <p className="py-4">Change the text fields to make edits to the user. Do not leave any fields blank.</p>
                <div className="form-control">
                
                    <label className="label">
                        <span className="label-text">First Name</span>
                    </label>
                    <input type="text" className="input input-bordered" value={firstName} onChange={(e) => setFirstName(e.target.value)} />

                    <label className="label">
                        <span className="label-text">Last Name</span>
                    </label>
                    <input type="text" className="input input-bordered" value={lastName} onChange={(e) => setLastName(e.target.value)} />

                    <label className="label">
                        <span className="label-text">Year</span>
                    </label>
                    <select id='yearInput' className="select select-bordered w-full max-w-xs" value={year} onChange={(e) => setYear(e.target.value)}>
                        <option disabled selected>Select your year</option>
                        <option value="Freshman">Freshman</option>
                        <option value="Sophomore">Sophomore</option>
                        <option value="Junior">Junior</option>
                        <option value="Senior">Senior</option>
                        <option value="Graduate">Graduate</option>
                    </select>

                    <label className="label">
                        <span className="label-text">Big Fam</span>
                    </label>
                    <select id="bigFamInput" className="select select-bordered w-full max-w-xs" value={bigFam} onChange={(e) => setBigFam(e.target.value)}>
                        <option disabled selected>Select your big fam</option>
                        <option value="Dora and Diego">Dora and Diego</option>
                        <option value="Backyardigans">Backyardigans</option>
                        <option value="Wonder Pets">Wonder Pets</option>
                        <option value="Sesame Street">Sesame Street</option>
                        <option value="I don&apos;t know">I don&apos;t know</option>
                    </select>
                </div>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={() => closeModal()}>No, take me back!</button>
                            <button className="btn btn-primary" onClick={(e) => { e.preventDefault(); setNewUser(); showInput(false); showConfirm(true);}}>Save Changes</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    const CompletePrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Success!</h3>
                <p className="py-4">User data updated.</p>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={() => props.router.reload()}>Close</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    const ErrorPrompt = () => {
        return (
            <>
                <h3 className="font-bold text-lg">Error</h3>
                <p className="py-4">Something went wrong while adding the event.</p>
                <div className="modal-action">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <div className="flex flex-row justify-center space-x-3">
                            <button className="btn" onClick={closeModal}>Close</button>
                        </div>
                    </form>
                </div>
            </>
        )
    }

    return (
        <dialog id="editUserModal" className="modal">
            <div className="modal-box">
                {showInput ? <InputPrompt /> : null}
                {showConfirm ? <ConfirmationPrompt /> : null}
                {showComplete ? <CompletePrompt /> : null}
                {showError ? <ErrorPrompt /> : null}
            </div>
        </dialog>
    )
}

export default AddEventModal;





