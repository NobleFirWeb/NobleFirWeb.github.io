gsap.registerPlugin(ScrollTrigger);

let video = document.querySelector("video"),
    videoWidth,
    videoHeight;
function setVideoDimensions() {
    videoWidth = video.offsetWidth;
    videoHeight = video.offsetHeight;
}
setVideoDimensions();
window.addEventListener("resize", setVideoDimensions);

const inset = { x: 0, y: 0, r: 50 };
const snap = gsap.utils.snap(4);
const videoPinTl = gsap
    .timeline({
        scrollTrigger: {
        trigger: ".video-wrapper",
        start: `center center`,
        end: "+=1000",
        pin: true,
        scrub: true,
        },
    })
    .fromTo(
        inset,
        {
        x: 0,
        y: 0,
        r: 50,
        },
        {
        duration: 1,
        x: 46,
        y: 34,
        r: 140,
        onUpdate() {
        video.style.clipPath = `inset(${Math.round(
          (inset.x * videoWidth) / 200,
        )}px ${Math.round((inset.y * videoHeight) / 200)}px round ${snap(
        inset.r,
        )}px)`;
        },
    },
    "<",
);
