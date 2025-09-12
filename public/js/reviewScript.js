//For rating in reviews
document.addEventListener("DOMContentLoaded", function () {
    const starResults = document.querySelectorAll(".starability-result");
    starResults.forEach((result) => {
        const rating = result.getAttribute("data-rating");
        const percentage = (rating / 5) * 100;
        result.style.setProperty("--rating", `${percentage}%`);
    });
});

//Show more functionality for reviews
function toggleReview(reviewId) {
    const reviewText = document.getElementById("review-" + reviewId);
    const button = document.getElementById("btn-" + reviewId);

    if (reviewText.classList.contains("collapsed")) {
        reviewText.classList.remove("collapsed");
        button.textContent = "Show less";
    } else {
        reviewText.classList.add("collapsed");
        button.textContent = "Show more";
    }
}
const form = document.getElementById("new-listing-form");
const loader = document.getElementById("loader");

form.addEventListener("submit", function () {
    // Show the loader
    loader.style.display = "flex";

    // Optional: Disable the submit button to prevent multiple submissions
    const submitButton = form.querySelector(".submit-btn");
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerText = "Uploading...";
    }
});
