var tablinks = document.getElementsByClassName("tab-links");
var tabcontents = document.getElementsByClassName("tab-contents");
const scriptURL = 'https://script.google.com/macros/s/AKfycbzZIzaYKLhiij3A_3uOliVllMKYS8v1mGjbITRWIycLLyAHlAVRstYE4c2zfDNzvPLT/exec'
const form = document.forms['submit-to-google-sheet']
var sidemenu = document.getElementById("sidemenu");



// Function to open a specific tab
function opentab(tabname){
    for(tablink of tablinks){
        tablink.classList.remove("active-link");
    }
    for(tabcontent of tabcontents){
        tabcontent.classList.remove("active-tab");
    }
    event.currentTarget.classList.add("active-link");
    document.getElementById(tabname).classList.add("active-tab");
}


// Function to toggle the side menu
function openmenu(){
    sidemenu.style.right = "0";
}
function closemenu(){
    sidemenu.style.right = "-200px";
}


// Add event listeners to form submission to handle Google Sheets integration
form.addEventListener('submit', e => {
e.preventDefault();
fetch(scriptURL, { method: 'POST', body: new FormData(form) })
    .then(response => {
        if (response.ok) {
            msg.innerHTML = "Message sent successfully!";
            setTimeout(() => msg.innerHTML = "", 5000);
            form.reset();
        } else {
            msg.innerHTML = "Failed to send message. Please try again.";
        }
    })
    .catch(error => {
        console.error('Error!', error.message);
        msg.innerHTML = "Failed to send message. Please try again.";
    });
});