const loginForm = document.getElementById("login-form");
const codeInput = document.getElementById("codeInput");


const baseUrl = `http://localhost:5000`

let mobileNumber;
let isOTPDelevery = false;

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    mobileNumber = parseInt(document.getElementById("phoneInput").value)

    if (isNaN(mobileNumber)) alert("Invalid Phone Number")
    else {

        if (isOTPDelevery) {
            const code = codeInput.value
            const respon = await verifyOtp(mobileNumber, code)
            alert(respon.status)
            return;
        }
        const response = await sendVerificationCode(mobileNumber)
        if (response.status === "pending") {
            codeInput.parentElement.classList.remove("hidden")
            isOTPDelevery = true
        }
    }
})

async function sendVerificationCode(mobileNumber) {
    const url = `${baseUrl}/login`
    const res = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: mobileNumber })
    })
    const json = await res.json()
    if (res.status === 200) {
        return json.Data
    } else {
        return json
    }
}


async function verifyOtp(mobileNumber, code) {
    const url = `${baseUrl}/verify`
    const res = await fetch(url, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: mobileNumber, otp: code })
    })
    const json = await res.json()
    if (res.status === 200) {
        return json.twiloData
    } else {
        return json
    }
}