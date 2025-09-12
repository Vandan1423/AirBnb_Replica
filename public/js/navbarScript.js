//Horizontal Navigation buttons
const categoryNav = document.getElementById("categoryNav");
const scrollLeftBtn = document.getElementById("scrollLeft");
const scrollRightBtn = document.getElementById("scrollRight");

scrollLeftBtn.addEventListener("click", () => {
    categoryNav.scrollBy({ left: -300, behavior: "smooth" });
});

scrollRightBtn.addEventListener("click", () => {
    categoryNav.scrollBy({ left: 300, behavior: "smooth" });
});
function updateArrows() {
    scrollLeftBtn.style.display = categoryNav.scrollLeft > 0 ? "flex" : "none";
    scrollRightBtn.style.display =
        categoryNav.scrollLeft + categoryNav.clientWidth <
        categoryNav.scrollWidth
            ? "flex"
            : "none";
}

categoryNav.addEventListener("scroll", updateArrows);
window.addEventListener("resize", updateArrows);
updateArrows();
