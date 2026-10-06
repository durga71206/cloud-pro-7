// Firebase App
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Firebase Authentication
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase Firestore
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Firebase Configuration

const firebaseConfig = {
    apiKey: "AIzaSyAyGI89HlOwkBFgE3bvvywt41jo7Fl6vTY",
    authDomain: "cloudonlinevoting.firebaseapp.com",
    projectId: "cloudonlinevoting",
    storageBucket: "cloudonlinevoting.firebasestorage.app",
    messagingSenderId: "779427110846",
    appId: "1:779427110846:web:3acef9182a6bc113bae3ef"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// LOGIN

window.login = async function () {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");


    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.innerText =
            "Login successful!";

        message.style.color = "green";

    } catch (error) {

        message.innerText =
            error.message;

        message.style.color = "red";
    }
};


// REGISTER

window.register = async function () {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("message");


    if (!email || !password) {

        message.innerText =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }


    if (password.length < 6) {

        message.innerText =
            "Password must contain at least 6 characters.";

        message.style.color = "red";

        return;
    }


    try {

        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.innerText =
            "Registration successful!";

        message.style.color = "green";

    } catch (error) {

        message.innerText =
            error.message;

        message.style.color = "red";
    }
};


// LOGOUT

window.logout = async function () {

    await signOut(auth);
};


// CHECK USER LOGIN

onAuthStateChanged(auth, (user) => {

    const loginSection =
        document.getElementById("loginSection");

    const votingSection =
        document.getElementById("votingSection");


    if (user) {

        loginSection.classList.add("hidden");

        votingSection.classList.remove("hidden");

    } else {

        loginSection.classList.remove("hidden");

        votingSection.classList.add("hidden");
    }
});


// CAST VOTE

window.vote = async function (
    candidateId,
    candidateName
) {

    const user = auth.currentUser;


    if (!user) {

        alert("Please login first.");

        return;
    }


    try {

        // Check whether user already voted

        const voteQuery = query(
            collection(db, "votes"),
            where("userId", "==", user.uid)
        );


        const voteSnapshot =
            await getDocs(voteQuery);


        if (!voteSnapshot.empty) {

            document.getElementById("voteMessage").innerText =
                "You have already voted!";

            document.getElementById("voteMessage").style.color =
                "red";

            return;
        }


        // Save vote

        await addDoc(
            collection(db, "votes"),
            {
                userId: user.uid,
                candidateId: candidateId,
                candidateName: candidateName,
                votedAt: new Date()
            }
        );


        document.getElementById("voteMessage").innerText =
            "Vote submitted successfully!";

        document.getElementById("voteMessage").style.color =
            "green";


        // Disable vote buttons

        const buttons =
            document.querySelectorAll(".candidate button");

        buttons.forEach((button) => {

            button.disabled = true;

            button.innerText = "Vote Submitted";

        });


    } catch (error) {

        console.error(error);

        document.getElementById("voteMessage").innerText =
            "Error submitting vote: " + error.message;

        document.getElementById("voteMessage").style.color =
            "red";
    }
};


// VIEW RESULTS

window.showResults = async function () {

    const resultList =
        document.getElementById("resultList");


    resultList.innerHTML =
        "<p>Loading results...</p>";


    try {

        const snapshot =
            await getDocs(
                collection(db, "votes")
            );


        let counts = {

            "Candidate 1": 0,

            "Candidate 2": 0,

            "Candidate 3": 0
        };


        snapshot.forEach((doc) => {

            const vote =
                doc.data();


            if (counts[vote.candidateId] !== undefined) {

                counts[vote.candidateId]++;
            }

        });


        resultList.innerHTML = "";


        Object.keys(counts).forEach((candidate) => {

            const div =
                document.createElement("div");

            div.className = "result-item";

            div.innerHTML =
                `<strong>${candidate}</strong> : ${counts[candidate]} votes`;

            resultList.appendChild(div);

        });


    } catch (error) {

        console.error(error);

        resultList.innerHTML =
            "<p>Unable to load results.</p>";
    }
};